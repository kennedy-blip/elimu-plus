import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  renderGradeChoices,
  renderLandingContent,
  renderOnboarding,
  renderWorkspace,
} from "../static/js/views.mjs";

const data = JSON.parse(await readFile(new URL("../data/learning-content.json", import.meta.url), "utf8"));
const config = JSON.parse(await readFile(new URL("../site-config.json", import.meta.url), "utf8"));

function makeState() {
  return {
    profile: { id: "demo", name: "Amani Wanjiku", school: "Example School", grade: 7, points: 0, streak: 1, level: 1 },
    currentView: "dashboard",
    isOffline: false,
    parentTab: "overview",
    parentMessagesRead: [],
    competencies: data.competencies.map((item) => ({ ...item })),
    portfolio: [],
    serviceProjects: [],
    downloads: data.downloadable_content.map((item) => ({ ...item })),
    quizResults: Object.fromEntries(data.quizzes.filter((quiz) => quiz.completed).map((quiz) => [quiz.id, { score: quiz.score, percent: quiz.score, sample: true }])),
    completedLessons: [],
    selectedLanguageId: "kikuyu",
    languageLessonTitle: "",
    languagePhraseIndex: 0,
    showTranslation: false,
    voiceNotes: data.voice_samples.map((item) => ({ ...item })),
    aiMessages: [],
    settings: { notifications: true, language: "English" },
    filters: { lessons: "All", labs: "all", downloads: "all", portfolio: "all" },
    searchQuery: "",
    modal: null,
    quizSession: null,
    aiOpen: false,
    menuOpen: false,
    isRecording: false,
    recordingTimeLabel: "0:00",
    liveTranscript: "",
    reflectionNotes: [],
  };
}

test("server-rendered chooser keeps the three CBC level cards actionable", () => {
  const html = renderLandingContent(data);
  assert.equal((html.match(/data-action="select-level"/g) || []).length, 3);
  for (const phrase of ["Choose Your Level", "Upper Primary", "Junior Secondary", "Senior School", "Interactive Learning Games"]) {
    assert.ok(html.includes(phrase), `missing chooser content: ${phrase}`);
  }
});

test("grade selection and onboarding render all grades with escaped fields", () => {
  const html = renderGradeChoices(data.grade_levels[1]);
  assert.match(html, /data-grade="7"/);
  assert.match(html, /data-grade="8"/);
  assert.match(html, /data-grade="9"/);
  const onboarding = renderOnboarding({ step: 1, grade: 7, name: "<script>alert(1)</script>", school: "", customSchool: "", error: "" }, data);
  assert.match(onboarding, /&lt;script&gt;/);
  assert.doesNotMatch(onboarding, /<input[^>]*value="<script>/);
});

test("every primary workspace view renders without missing state placeholders", () => {
  const cases = [
    ["dashboard", "Ready to learn today"],
    ["competencies", "Competency radar"],
    ["quizzes", "Available quizzes"],
    ["lessons", "Video lessons"],
    ["labs", "Virtual STEM labs"],
    ["languages", "Indigenous languages"],
    ["community", "Community service"],
    ["portfolio", "Digital portfolio"],
    ["offline", "Offline content"],
    ["voice-notes", "Voice to text"],
    ["parent", "Parent / teacher portal"],
    ["settings", "Settings"],
  ];
  for (const [view, expected] of cases) {
    const state = makeState();
    state.currentView = view;
    const html = renderWorkspace(state, data, config);
    assert.ok(html.toLocaleLowerCase().includes(expected.toLocaleLowerCase()), `${view} should contain its page heading`);
    assert.doesNotMatch(html, /\bundefined\b|\[object Object\]|NaN/, `${view} should not emit broken placeholders`);
    assert.match(html, /workspace-sidebar/);
  }
});

test("search route displays matching catalog results and its own breadcrumb", () => {
  const state = makeState();
  state.currentView = "search";
  state.searchQuery = "algebra";
  const html = renderWorkspace(state, data, config);
  assert.match(html, /Search learning content/);
  assert.match(html, /Introduction to Algebra/);
  assert.match(html, /data-action="open-lesson"/);
  assert.doesNotMatch(html, /Ready to learn today/);
});

test("quiz, lab, and form dialogs render expected controls", () => {
  const state = makeState();
  state.currentView = "quizzes";
  state.quizSession = { id: "algebra-basics", index: 0, answers: [], selected: null, result: null };
  let html = renderWorkspace(state, data, config);
  assert.match(html, /What is 15 \+ 27\?/);
  assert.match(html, /data-action="quiz-answer"/);

  state.quizSession = null;
  state.modal = { type: "lab", id: "virtual-microscope", started: true, zoom: 2 };
  html = renderWorkspace(state, data, config);
  assert.match(html, /Magnification/);
  assert.match(html, /data-action="lab-zoom"/);

  state.modal = { type: "portfolio" };
  html = renderWorkspace(state, data, config);
  assert.match(html, /data-form="portfolio"/);
  assert.match(html, /name="competencies"/);
});

test("local profile values are escaped before they enter rendered HTML", () => {
  const state = makeState();
  state.profile.name = "<img src=x onerror=alert(1)>";
  const html = renderWorkspace(state, data, config);
  assert.doesNotMatch(html, /<img src=x onerror=alert\(1\)>/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
});
