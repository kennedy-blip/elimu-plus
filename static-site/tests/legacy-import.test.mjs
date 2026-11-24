import test from "node:test";
import assert from "node:assert/strict";
import { importLegacyProfile } from "../static/js/legacy-import.mjs";

const STORAGE_KEY = "elimu-plus-static-v1";
const CONTENT = {
  competencies: [
    { id: "communication", name: "Communication & Collaboration", short_name: "Communication", score: 75, icon: "💬" },
    { id: "critical-thinking", name: "Critical Thinking & Problem Solving", short_name: "Critical Thinking", score: 90, icon: "🧠" },
  ],
  quizzes: [{ id: "algebra-basics" }, { id: "plant-cells" }, { id: "kiswahili-grammar" }],
  downloadable_content: [
    { id: "math-curriculum", title: "Grade 7 Mathematics Curriculum", downloaded: false },
    { id: "science-notes", title: "Integrated Science Notes - Term 1", downloaded: false },
  ],
};

function makeStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    value(key) { return values.get(key) ?? null; },
  };
}

function makeIndexedDb(stores, { name = "elimu-plus-db" } = {}) {
  let openCount = 0;
  let closeCount = 0;
  const factory = {
    async databases() { return name ? [{ name }] : []; },
    open(databaseName) {
      openCount += 1;
      const request = {};
      queueMicrotask(() => {
        if (databaseName !== name) {
          request.error = new Error("Database not found");
          request.onerror?.();
          return;
        }
        request.result = {
          objectStoreNames: { contains: (storeName) => Object.hasOwn(stores, storeName) },
          transaction(storeName, mode) {
            assert.equal(mode, "readonly");
            return {
              objectStore(requestedStore) {
                assert.equal(requestedStore, storeName);
                return {
                  getAll() {
                    const getAllRequest = { result: stores[storeName] || [] };
                    queueMicrotask(() => getAllRequest.onsuccess?.());
                    return getAllRequest;
                  },
                };
              },
            };
          },
          close() { closeCount += 1; },
        };
        request.onsuccess?.();
      });
      return request;
    },
  };
  return { factory, openCount: () => openCount, closeCount: () => closeCount };
}

test("imports the active learner's profile and supported progress, excluding secrets and file bytes", async () => {
  const storage = makeStorage();
  const legacy = makeIndexedDb({
    users: [
      { id: "learner-1", name: "Kendi Muriuki", school: "Meru High School", grade: 8, points: 245, streak: 3, level: 2 },
      { id: "learner-2", name: "Other learner", school: "Other School", grade: 7, points: 999 },
    ],
    settings: [
      { id: "settings-1", userId: "learner-1", language: "sw", offlineMode: true, notificationsEnabled: false, openaiApiKey: "legacy-secret-value" },
      { id: "settings-2", userId: "learner-2", openaiApiKey: "another-secret" },
    ],
    portfolio: [
      { id: "portfolio-1", userId: "learner-1", title: "Science project", type: "image", uploadDate: "2026-10-01", subject: "Science", competencies: ["Creativity"], size: "2 MB", thumbnail: "data:image/png;base64,private-file-bytes" },
      { id: "portfolio-other", userId: "learner-2", title: "Other learner's work" },
    ],
    serviceProjects: [
      { id: "service-1", userId: "learner-1", title: "School garden", description: "Planted seedlings", hours: 4, status: "completed", impact: "Environment", date: "2026-10-02" },
      { id: "service-other", userId: "learner-2", title: "Private project", hours: 80 },
    ],
    downloads: [
      { id: "1", userId: "learner-1", title: "Grade 7 Mathematics Curriculum", downloaded: true },
      { id: "2", userId: "learner-1", title: "Integrated Science Notes - Term 1", downloaded: false },
      { id: "3", userId: "learner-2", title: "Grade 7 Mathematics Curriculum", downloaded: true },
    ],
    competencies: [
      { id: "1", userId: "learner-1", name: "Communication & Collaboration", score: 96 },
      { id: "1-other", userId: "learner-2", name: "Critical Thinking & Problem Solving", score: 10 },
    ],
    quizResults: [
      { id: "result-1", userId: "learner-1", quizId: "1", score: 80, totalQuestions: 10, completedAt: "2026-10-03" },
      { id: "result-other", userId: "learner-2", quizId: "2", score: 20 },
    ],
    chatHistory: [{ id: "chat-1", oduserId: "learner-1", role: "user", content: "Do not migrate this conversation" }],
  });

  assert.equal(await importLegacyProfile({ storageKey: STORAGE_KEY, content: CONTENT, indexedDBFactory: legacy.factory, storage }), true);
  const serialized = storage.value(STORAGE_KEY);
  const imported = JSON.parse(serialized);
  assert.deepEqual(imported.profile, { id: "learner-1", name: "Kendi Muriuki", school: "Meru High School", grade: 8, points: 245, streak: 3, level: 2 });
  assert.equal(imported.isOffline, true);
  assert.deepEqual(imported.settings, { notifications: false, language: "Kiswahili" });
  assert.deepEqual(imported.competencies.map(({ id, score }) => ({ id, score })), [{ id: "communication", score: 96 }]);
  assert.deepEqual(imported.portfolio.map(({ id, title, reflection }) => ({ id, title, reflection })), [{ id: "portfolio-1", title: "Science project", reflection: "" }]);
  assert.deepEqual(imported.serviceProjects.map(({ id, title, hours, status }) => ({ id, title, hours, status })), [{ id: "service-1", title: "School garden", hours: 4, status: "completed" }]);
  assert.deepEqual(imported.downloads, [{ id: "math-curriculum", downloaded: true }, { id: "science-notes", downloaded: false }]);
  assert.deepEqual(imported.quizResults, { "algebra-basics": { score: 80, percent: 80, completed: true, points: 0, migrated: true, completedAt: "2026-10-03" } });
  assert.doesNotMatch(serialized, /legacy-secret-value|another-secret|openaiApiKey|private-file-bytes|Do not migrate this conversation/);
  assert.equal(legacy.closeCount(), 1);
});

test("does not replace an existing sidecar profile or open the legacy database", async () => {
  const current = JSON.stringify({ profile: { name: "Current learner" } });
  const storage = makeStorage({ [STORAGE_KEY]: current });
  const legacy = makeIndexedDb({ users: [{ id: "old", name: "Old learner", school: "Old School", grade: 7 }] });

  assert.equal(await importLegacyProfile({ storageKey: STORAGE_KEY, content: CONTENT, indexedDBFactory: legacy.factory, storage }), false);
  assert.equal(storage.value(STORAGE_KEY), current);
  assert.equal(legacy.openCount(), 0);
});

test("does not create or import from a missing database or invalid legacy profile", async () => {
  const storage = makeStorage();
  const missing = makeIndexedDb({}, { name: "" });
  assert.equal(await importLegacyProfile({ storageKey: STORAGE_KEY, content: CONTENT, indexedDBFactory: missing.factory, storage }), false);
  assert.equal(missing.openCount(), 0);
  assert.equal(storage.value(STORAGE_KEY), null);

  const invalid = makeIndexedDb({ users: [{ id: "too-young", name: "A", school: "School", grade: 3 }], settings: [] });
  assert.equal(await importLegacyProfile({ storageKey: STORAGE_KEY, content: CONTENT, indexedDBFactory: invalid.factory, storage }), false);
  assert.equal(storage.value(STORAGE_KEY), null);
  assert.equal(invalid.closeCount(), 1);
});

test("skips migration safely when the browser lacks IndexedDB database enumeration", async () => {
  const storage = makeStorage();
  assert.equal(await importLegacyProfile({ storageKey: STORAGE_KEY, content: CONTENT, indexedDBFactory: {}, storage }), false);
  assert.equal(storage.value(STORAGE_KEY), null);
});
