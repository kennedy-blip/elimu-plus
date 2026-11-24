const LEGACY_DATABASE_NAME = "elimu-plus-db";
const MAX_PORTFOLIO_ITEMS = 200;
const MAX_SERVICE_PROJECTS = 200;

function readStore(database, storeName) {
  if (!database.objectStoreNames.contains(storeName)) return Promise.resolve([]);
  return new Promise((resolve, reject) => {
    let request;
    try {
      request = database.transaction(storeName, "readonly").objectStore(storeName).getAll();
    } catch (error) {
      reject(error);
      return;
    }
    request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
    request.onerror = () => reject(request.error || new Error(`Could not read ${storeName}`));
  });
}

function validUser(user) {
  return user && (typeof user.id === "string" || Number.isFinite(user.id)) && String(user.id).trim().length > 0
    && typeof user.name === "string" && user.name.trim().length >= 2
    && typeof user.school === "string" && Number.isInteger(Number(user.grade))
    && Number(user.grade) >= 4 && Number(user.grade) <= 12;
}

function safeText(value, limit = 200) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function boundedNumber(value, min, max, fallback = min) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
}

function normalizeLanguage(language) {
  const value = String(language || "").trim().toLocaleLowerCase();
  return value === "sw" || value.startsWith("swahili") || value.startsWith("kiswahili")
    ? "Kiswahili"
    : "English";
}

function normalizeName(value) {
  return String(value || "").normalize("NFKD").replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function belongsToUser(record, userId) {
  return String(record?.userId ?? "") === String(userId);
}

function importCompetencies(records, content) {
  const competencyIds = new Map();
  for (const competency of content.competencies) {
    for (const label of [competency.name, competency.short_name, competency.shortName]) {
      const normalized = normalizeName(label);
      if (normalized) competencyIds.set(normalized, competency.id);
    }
  }
  const scores = new Map();
  for (const record of records) {
    const id = competencyIds.get(normalizeName(record.name || record.shortName));
    const score = Number(record.score);
    if (id && Number.isFinite(score)) scores.set(id, boundedNumber(score, 0, 100));
  }
  return content.competencies
    .filter((competency) => scores.has(competency.id))
    .map((competency) => ({ ...competency, score: scores.get(competency.id) }));
}

function importPortfolio(records) {
  const types = new Set(["image", "video", "pdf", "document"]);
  return records.filter((item) => safeText(item.title, 100)).slice(0, MAX_PORTFOLIO_ITEMS).map((item, index) => ({
    id: safeText(item.id, 100) || `legacy-portfolio-${index}`,
    title: safeText(item.title, 100),
    type: types.has(item.type) ? item.type : "document",
    uploadDate: safeText(item.uploadDate, 40),
    subject: safeText(item.subject, 80) || "General",
    competencies: Array.isArray(item.competencies)
      ? item.competencies.filter((value) => typeof value === "string").map((value) => safeText(value, 80)).filter(Boolean).slice(0, 20)
      : [],
    reflection: safeText(item.reflection, 600),
    size: safeText(item.size, 60) || "Imported metadata",
  }));
}

function importServiceProjects(records) {
  const statuses = new Set(["planned", "in-progress", "completed"]);
  return records.filter((item) => safeText(item.title, 100)).slice(0, MAX_SERVICE_PROJECTS).map((item, index) => ({
    id: safeText(item.id, 100) || `legacy-service-${index}`,
    title: safeText(item.title, 100),
    description: safeText(item.description, 500),
    hours: boundedNumber(item.hours, 0, 10000),
    status: statuses.has(item.status) ? item.status : "planned",
    impact: safeText(item.impact, 120) || "Community",
    date: safeText(item.date, 40),
    reflection: safeText(item.reflection, 1000),
  }));
}

function importDownloads(records, content) {
  const byTitle = new Map(records.map((item) => [normalizeName(item.title), item]));
  return content.downloadable_content.flatMap((item) => {
    const previous = records.find((record) => String(record.id) === String(item.id))
      || byTitle.get(normalizeName(item.title));
    return previous ? [{ id: item.id, downloaded: Boolean(previous.downloaded) }] : [];
  });
}

function importQuizResults(records, content) {
  const quizzes = new Map(content.quizzes.map((quiz) => [String(quiz.id), quiz.id]));
  content.quizzes.forEach((quiz, index) => quizzes.set(String(index + 1), quiz.id));
  const results = {};
  for (const record of records) {
    const quizId = quizzes.get(String(record.quizId));
    const score = Number(record.score);
    if (!quizId || !Number.isFinite(score)) continue;
    const percent = boundedNumber(score, 0, 100);
    results[quizId] = {
      score: percent,
      percent,
      completed: true,
      points: 0,
      migrated: true,
      completedAt: safeText(record.completedAt, 40),
    };
  }
  return results;
}

/**
 * Copy the active learner's available records from the former React app's
 * IndexedDB database. The original database is opened read-only and left in
 * place. API keys, AI conversations, and portfolio file bytes are deliberately
 * excluded; imported portfolio data contains metadata only.
 */
export async function importLegacyProfile({ storageKey, content, indexedDBFactory, storage } = {}) {
  let database = null;
  try {
    indexedDBFactory ||= globalThis.indexedDB;
    storage ||= globalThis.localStorage;
    if (!storageKey || !content || !storage || !indexedDBFactory || typeof indexedDBFactory.databases !== "function") return false;
    if (storage.getItem(storageKey)) return false;

    const databases = await indexedDBFactory.databases();
    if (!databases.some((entry) => entry.name === LEGACY_DATABASE_NAME)) return false;

    database = await new Promise((resolve, reject) => {
      const request = indexedDBFactory.open(LEGACY_DATABASE_NAME);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Could not open the existing learner database"));
      request.onblocked = () => reject(new Error("The existing learner database is busy"));
    });

    const [users, allSettings, allPortfolio, allServiceProjects, allDownloads, allCompetencies, allQuizResults] = await Promise.all([
      readStore(database, "users"),
      readStore(database, "settings"),
      readStore(database, "portfolio"),
      readStore(database, "serviceProjects"),
      readStore(database, "downloads"),
      readStore(database, "competencies"),
      readStore(database, "quizResults"),
    ]);
    const user = users.find(validUser);
    if (!user) return false;
    const userId = user.id;
    const preferences = allSettings.find((item) => String(item.userId) === String(userId));

    const imported = {
      profile: {
        id: safeText(userId, 100) || "legacy-learner",
        name: safeText(user.name, 80),
        school: safeText(user.school, 100),
        grade: Number(user.grade),
        points: boundedNumber(user.points, 0, 1_000_000_000),
        streak: boundedNumber(user.streak, 1, 1_000_000, 1),
        level: boundedNumber(user.level, 1, 1_000_000, 1),
      },
      currentView: "dashboard",
      isOffline: Boolean(preferences?.offlineMode),
      settings: {
        notifications: preferences?.notificationsEnabled !== false,
        language: normalizeLanguage(preferences?.language),
      },
      competencies: importCompetencies(allCompetencies.filter((item) => belongsToUser(item, userId)), content),
      portfolio: importPortfolio(allPortfolio.filter((item) => belongsToUser(item, userId))),
      serviceProjects: importServiceProjects(allServiceProjects.filter((item) => belongsToUser(item, userId))),
      downloads: importDownloads(allDownloads.filter((item) => belongsToUser(item, userId)), content),
      quizResults: importQuizResults(allQuizResults.filter((item) => belongsToUser(item, userId)), content),
    };
    storage.setItem(storageKey, JSON.stringify(imported));
    return true;
  } catch {
    return false;
  } finally {
    database?.close();
  }
}
