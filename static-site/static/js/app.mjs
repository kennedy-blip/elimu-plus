import {
  calculateQuizResult,
  escapeHtml,
  formatTime,
  getCompetencyLevel,
  getEducationLevel,
} from "./logic.mjs";
import { importLegacyProfile } from "./legacy-import.mjs";
import {
  NAV_ITEMS,
  renderFlowFrame,
  renderGradeChoices,
  renderLandingContent,
  renderOnboarding,
  renderWorkspace,
} from "./views.mjs";

const app = document.querySelector("#app");
const PAGE_IDS = new Set([...NAV_ITEMS.map((item) => item.id), "parent", "search"]);
let data = null;
let config = null;
let state = null;
let navigationTrail = [];
let navigationIndex = -1;
let onboarding = null;
let selectedLevelId = null;
let recordingTimer = null;
let transcriptTimer = null;
let speechRecognizer = null;
let toastTimer = null;

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function initialState(content) {
  const quizResults = Object.fromEntries(content.quizzes
    .filter((quiz) => quiz.completed && Number.isFinite(Number(quiz.score)))
    .map((quiz) => [quiz.id, { score: Number(quiz.score), percent: Number(quiz.score), completed: true, sample: true, points: 0 }]));
  return {
    profile: null,
    currentView: "dashboard",
    isOffline: false,
    parentTab: "overview",
    parentMessagesRead: [],
    pointsHistory: [],
    competencies: content.competencies.map((item) => ({ ...item, level: getCompetencyLevel(item.score) })),
    portfolio: [],
    serviceProjects: [],
    downloads: content.downloadable_content.map((item) => ({ ...item })),
    quizResults,
    completedLessons: [],
    selectedLanguageId: content.languages[0]?.id || "kikuyu",
    languageLessonTitle: "",
    languagePhraseIndex: 0,
    showTranslation: false,
    voiceNotes: content.voice_samples.map((item) => ({ ...item })),
    aiMessages: [],
    settings: { notifications: true, language: "English" },
    filters: { lessons: "All", labs: "all", downloads: "all", portfolio: "all" },
    searchQuery: "",
    modal: null,
    quizSession: null,
    aiOpen: false,
    menuOpen: false,
    isRecording: false,
    recordingSeconds: 0,
    recordingTimeLabel: "0:00",
    liveTranscript: "",
    reflectionNotes: [],
  };
}

function isValidProfile(profile) {
  return profile && typeof profile.name === "string" && profile.name.trim().length >= 2
    && typeof profile.school === "string" && Number.isInteger(Number(profile.grade))
    && Number(profile.grade) >= 4 && Number(profile.grade) <= 12;
}

function loadState(content, siteConfig) {
  const fresh = initialState(content);
  try {
    const saved = JSON.parse(localStorage.getItem(siteConfig.storage_key) || "null");
    if (!saved || typeof saved !== "object") return fresh;
    const quizResults = { ...fresh.quizResults };
    for (const quiz of content.quizzes) {
      const result = saved.quizResults?.[quiz.id];
      if (result && Number.isFinite(Number(result.percent ?? result.score))) {
        const score = Math.max(0, Math.min(100, Number(result.percent ?? result.score)));
        quizResults[quiz.id] = { ...result, percent: score, score, completed: true };
      }
    }
    const savedScores = new Map((Array.isArray(saved.competencies) ? saved.competencies : []).map((item) => [item.id, Number(item.score)]));
    const validView = PAGE_IDS.has(saved.currentView) ? saved.currentView : "dashboard";
    const languageIds = new Set(content.languages.map((item) => item.id));
    return {
      ...fresh,
      profile: isValidProfile(saved.profile) ? {
        id: String(saved.profile.id || makeId()),
        name: saved.profile.name.trim().slice(0, 80),
        school: saved.profile.school.trim().slice(0, 100),
        grade: Number(saved.profile.grade),
        points: Math.max(0, Number(saved.profile.points) || 0),
        streak: Math.max(1, Number(saved.profile.streak) || 1),
        level: Math.max(1, Number(saved.profile.level) || 1),
      } : null,
      currentView: validView,
      isOffline: Boolean(saved.isOffline),
      parentTab: ["overview", "progress", "reports", "messages"].includes(saved.parentTab) ? saved.parentTab : "overview",
      parentMessagesRead: Array.isArray(saved.parentMessagesRead) ? saved.parentMessagesRead.filter(Number.isInteger) : [],
      competencies: fresh.competencies.map((item) => {
        const score = savedScores.get(item.id);
        const nextScore = Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : item.score;
        return { ...item, score: nextScore, level: getCompetencyLevel(nextScore) };
      }),
      portfolio: Array.isArray(saved.portfolio) ? saved.portfolio.slice(0, 200) : [],
      serviceProjects: Array.isArray(saved.serviceProjects) ? saved.serviceProjects.slice(0, 200) : [],
      downloads: fresh.downloads.map((item) => ({ ...item, downloaded: Boolean(saved.downloads?.find((savedItem) => savedItem.id === item.id)?.downloaded ?? item.downloaded) })),
      quizResults,
      completedLessons: Array.isArray(saved.completedLessons) ? saved.completedLessons.filter((id) => content.lessons.some((item) => item.id === id)) : [],
      selectedLanguageId: languageIds.has(saved.selectedLanguageId) ? saved.selectedLanguageId : fresh.selectedLanguageId,
      voiceNotes: Array.isArray(saved.voiceNotes) ? saved.voiceNotes.slice(0, 100) : fresh.voiceNotes,
      aiMessages: Array.isArray(saved.aiMessages) ? saved.aiMessages.slice(-40) : [],
      settings: { ...fresh.settings, ...(saved.settings && typeof saved.settings === "object" ? saved.settings : {}) },
      filters: { ...fresh.filters, ...(saved.filters && typeof saved.filters === "object" ? saved.filters : {}) },
      searchQuery: typeof saved.searchQuery === "string" ? saved.searchQuery.slice(0, 120) : "",
      reflectionNotes: Array.isArray(saved.reflectionNotes) ? saved.reflectionNotes.slice(0, 100) : [],
    };
  } catch (error) {
    console.warn("Could not load local demo profile", error);
    return fresh;
  }
}

function saveState() {
  if (!state || !config) return;
  const persistent = {
    profile: state.profile,
    currentView: state.currentView,
    isOffline: state.isOffline,
    parentTab: state.parentTab,
    parentMessagesRead: state.parentMessagesRead,
    competencies: state.competencies,
    portfolio: state.portfolio,
    serviceProjects: state.serviceProjects,
    downloads: state.downloads,
    quizResults: state.quizResults,
    completedLessons: state.completedLessons,
    selectedLanguageId: state.selectedLanguageId,
    voiceNotes: state.voiceNotes,
    aiMessages: state.aiMessages,
    settings: state.settings,
    filters: state.filters,
    searchQuery: state.searchQuery,
    reflectionNotes: state.reflectionNotes,
  };
  try {
    localStorage.setItem(config.storage_key, JSON.stringify(persistent));
  } catch (error) {
    console.warn("Could not save local demo profile", error);
    showToast("This browser could not save your changes.");
  }
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

function render() {
  if (!app || !data || !config || !state) return;
  if (state.profile) {
    app.className = "workspace-app";
    app.innerHTML = renderWorkspace({
      ...state,
      canGoBack: navigationIndex > 0,
      canGoForward: navigationIndex >= 0 && navigationIndex < navigationTrail.length - 1,
    }, data, config);
    return;
  }
  if (onboarding) {
    app.className = "landing flow-mode";
    app.innerHTML = renderFlowFrame(renderOnboarding(onboarding, data), config);
    return;
  }
  const level = data.grade_levels.find((item) => item.id === selectedLevelId);
  if (level) {
    app.className = "landing flow-mode";
    app.innerHTML = renderFlowFrame(renderGradeChoices(level), config);
    return;
  }
  app.className = "landing flow-mode";
  app.innerHTML = renderFlowFrame(renderLandingContent(data), config);
}

function renderWorkspaceAndSave() {
  saveState();
  render();
}

function resetNavigation(view) {
  navigationTrail = [view];
  navigationIndex = 0;
  history.replaceState({ view, navigationIndex }, "", `#${view}`);
}

function pushNavigation(view) {
  navigationTrail = navigationTrail.slice(0, navigationIndex + 1);
  navigationTrail.push(view);
  navigationIndex = navigationTrail.length - 1;
  history.pushState({ view, navigationIndex }, "", `#${view}`);
}

function navigate(view, { push = true } = {}) {
  if (!PAGE_IDS.has(view) || !state?.profile) return;
  if (state.isRecording && view !== "voice-notes") finishRecording(true, false);
  state.currentView = view;
  state.modal = null;
  state.menuOpen = false;
  if (view !== "quizzes") state.quizSession = null;
  if (push) pushNavigation(view);
  else if (navigationIndex >= 0) {
    navigationTrail[navigationIndex] = view;
    history.replaceState({ view, navigationIndex }, "", `#${view}`);
  }
  renderWorkspaceAndSave();
}

function changeGrade() {
  if (!state?.profile) return;
  const accepted = window.confirm("Change your grade? Your demo work stays saved in this browser.");
  if (!accepted) return;
  if (state.isRecording) finishRecording(true, false);
  state.profile = null;
  state.currentView = "dashboard";
  state.modal = null;
  state.quizSession = null;
  onboarding = null;
  selectedLevelId = null;
  navigationTrail = [];
  navigationIndex = -1;
  history.replaceState({}, "", `${location.pathname}${location.search}`);
  renderWorkspaceAndSave();
}

function startQuiz(quizId) {
  const quiz = data.quizzes.find((item) => item.id === quizId);
  if (!quiz) return;
  state.currentView = "quizzes";
  state.quizSession = { id: quizId, index: 0, answers: [], selected: null, result: null };
  state.modal = null;
  state.menuOpen = false;
  pushNavigation("quizzes");
  renderWorkspaceAndSave();
}

function completeQuiz() {
  const session = state.quizSession;
  const quiz = data.quizzes.find((item) => item.id === session?.id);
  if (!quiz) return;
  const result = calculateQuizResult(session.answers, quiz.questions, quiz.points);
  const previous = state.quizResults[quiz.id];
  if (!previous) {
    state.profile.points = Number(state.profile.points || 0) + result.points;
    state.profile.level = Math.floor(state.profile.points / 500) + 1;
  }
  state.quizResults[quiz.id] = {
    score: result.percent,
    percent: result.percent,
    correct: result.correct,
    total: result.total,
    points: result.points,
    completed: true,
    sample: false,
    date: new Date().toISOString(),
  };
  session.result = { ...result, firstAttempt: !previous };
  renderWorkspaceAndSave();
}

function startRecording() {
  if (state.isRecording) return;
  state.isRecording = true;
  state.recordingSeconds = 0;
  state.recordingTimeLabel = "0:00";
  state.liveTranscript = "";
  render();
  recordingTimer = window.setInterval(() => {
    state.recordingSeconds += 1;
    state.recordingTimeLabel = formatTime(state.recordingSeconds);
    const timer = app.querySelector(".recording-time");
    if (timer) timer.textContent = state.recordingTimeLabel;
  }, 1000);

  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (Recognition) {
    try {
      speechRecognizer = new Recognition();
      speechRecognizer.continuous = true;
      speechRecognizer.interimResults = true;
      speechRecognizer.lang = "en-KE";
      speechRecognizer.onresult = (event) => {
        const transcript = Array.from(event.results).map((result) => result[0]?.transcript || "").join(" ").trim();
        updateTranscript(transcript);
      };
      speechRecognizer.onerror = () => showToast("Microphone access was unavailable. You can type a note instead.");
      speechRecognizer.start();
    } catch (error) {
      console.warn("Speech recognition could not start", error);
      showToast("Microphone access was unavailable. You can type a note instead.");
    }
  } else {
    let phraseIndex = 0;
    transcriptTimer = window.setInterval(() => {
      if (!state.isRecording) return;
      const phrase = data.transcription_demo[phraseIndex % data.transcription_demo.length];
      phraseIndex += 1;
      updateTranscript(`${state.liveTranscript || ""}${phrase}`);
    }, 1800);
  }
}

function updateTranscript(value) {
  state.liveTranscript = String(value || "");
  const textarea = app.querySelector("#live-transcript");
  const count = app.querySelector(".word-count");
  if (textarea && textarea.value !== state.liveTranscript) textarea.value = state.liveTranscript;
  if (count) count.textContent = `${state.liveTranscript.trim() ? state.liveTranscript.trim().split(/\s+/).length : 0} words`;
}

function finishRecording(save, shouldRender = true) {
  window.clearInterval(recordingTimer);
  window.clearInterval(transcriptTimer);
  recordingTimer = null;
  transcriptTimer = null;
  if (speechRecognizer) {
    try { speechRecognizer.stop(); } catch { /* already stopped */ }
    speechRecognizer = null;
  }
  state.isRecording = false;
  if (save && state.liveTranscript.trim()) {
    state.voiceNotes.unshift({
      id: makeId(),
      title: "New Recording",
      duration: formatTime(state.recordingSeconds),
      transcript: state.liveTranscript.trim(),
      date: new Date().toISOString().slice(0, 10),
      subject: "General",
    });
    state.voiceNotes = state.voiceNotes.slice(0, 100);
    state.liveTranscript = "";
    state.recordingTimeLabel = "0:00";
    if (shouldRender) {
      renderWorkspaceAndSave();
      showToast("Recording saved to this browser.");
    }
  } else if (shouldRender) {
    render();
    showToast("Recording stopped. Add a few words before saving a note.");
  }
}

function saveVoiceNote() {
  const transcript = (app.querySelector("#live-transcript")?.value || state.liveTranscript || "").trim();
  if (!transcript) {
    showToast("Type or record a few words first.");
    return;
  }
  if (state.isRecording) finishRecording(false, false);
  state.voiceNotes.unshift({
    id: makeId(),
    title: "Quick learning note",
    duration: formatTime(state.recordingSeconds),
    transcript,
    date: new Date().toISOString().slice(0, 10),
    subject: "General",
  });
  state.voiceNotes = state.voiceNotes.slice(0, 100);
  state.liveTranscript = "";
  state.recordingTimeLabel = "0:00";
  renderWorkspaceAndSave();
  showToast("Learning note saved.");
}

function tutorReply(question) {
  const prompt = question.toLocaleLowerCase();
  if (prompt.includes("photosynthesis")) return "Photosynthesis is how green plants make their own food. Leaves use sunlight, water, and carbon dioxide to make sugar, and they release oxygen. Think of a leaf as a tiny solar-powered kitchen!";
  if (prompt.includes("algebra") || prompt.includes("math")) return "A helpful way to start algebra is to treat a letter like a box hiding a number. If 3x = 15, divide both sides by 3: x = 5. The balance stays fair because you do the same thing to both sides.";
  if (prompt.includes("competenc")) return "CBC learning develops skills such as communication and collaboration, critical thinking, creativity, citizenship, digital literacy, learning to learn, and self-efficacy. You build them by practicing, reflecting, and applying ideas.";
  if (prompt.includes("independence") || prompt.includes("uhuru")) return "Kenya attained internal self-rule on Madaraka Day, 1 June 1963, and became independent on 12 December 1963. Jomo Kenyatta became the country's first President. What part of that journey would you like to explore?";
  if (prompt.includes("kiswahili") || prompt.includes("swahili")) return "Karibu! In Kiswahili, a nomino is a noun: a word that names a person, place, thing, or idea. For example, mwanafunzi means student and shule means school.";
  if (prompt.includes("essay") || prompt.includes("writing")) return "A clear essay often has three parts: an introduction that shares your main idea, body paragraphs that explain it with examples, and a conclusion that brings the ideas together. Start with a quick outline before writing.";
  return "That's a thoughtful question. This static preview uses a small set of built-in study examples and works offline; try asking about photosynthesis, algebra, CBC competencies, Kenya's independence, Kiswahili, or essay writing.";
}

function sendTutorMessage(message) {
  const text = String(message || "").trim();
  if (!text) return;
  state.aiMessages.push({ role: "user", content: text.slice(0, 500) });
  state.aiMessages.push({ role: "assistant", content: tutorReply(text) });
  state.aiMessages = state.aiMessages.slice(-40);
  renderWorkspaceAndSave();
  const messages = app.querySelector("#ai-messages");
  if (messages) messages.scrollTop = messages.scrollHeight;
  app.querySelector("#ai-input")?.focus();
}

function exportDemoData() {
  const payload = {
    profile: state.profile,
    competencies: state.competencies,
    portfolio: state.portfolio,
    community_projects: state.serviceProjects,
    downloads: state.downloads,
    quiz_results: state.quizResults,
    completed_lessons: state.completedLessons,
    voice_notes: state.voiceNotes,
    preferences: state.settings,
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "elimu-plus-demo-data.json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Your demo data export is ready.");
}

function resetDemoData() {
  if (!window.confirm("Clear the Elimu Plus demo profile and saved data from this browser?")) return;
  window.clearInterval(recordingTimer);
  window.clearInterval(transcriptTimer);
  try { speechRecognizer?.stop(); } catch { /* no active recognizer */ }
  speechRecognizer = null;
  try { localStorage.removeItem(config.storage_key); } catch { /* storage may be disabled */ }
  state = initialState(data);
  onboarding = null;
  selectedLevelId = null;
  navigationTrail = [];
  navigationIndex = -1;
  history.replaceState({}, "", `${location.pathname}${location.search}`);
  render();
  showToast("Local demo data cleared.");
}

function handleAction(action, control) {
  switch (action) {
    case "history-back":
      if (navigationIndex > 0) history.back();
      break;
    case "history-forward":
      if (navigationIndex >= 0 && navigationIndex < navigationTrail.length - 1) history.forward();
      break;
    case "select-level": {
      selectedLevelId = control.dataset.level;
      if (data.grade_levels.some((item) => item.id === selectedLevelId)) render();
      break;
    }
    case "back-to-levels":
      selectedLevelId = null;
      onboarding = null;
      render();
      break;
    case "select-grade": {
      const grade = Number(control.dataset.grade);
      if (getEducationLevel(grade)) {
        onboarding = { step: 1, grade, name: "", school: "", customSchool: "", error: "" };
        selectedLevelId = null;
        render();
      }
      break;
    }
    case "onboarding-back":
      if (onboarding) {
        onboarding.step = 1;
        onboarding.error = "";
        render();
      }
      break;
    case "change-grade":
      changeGrade();
      break;
    case "toggle-offline":
      state.isOffline = !state.isOffline;
      renderWorkspaceAndSave();
      showToast(state.isOffline ? "Offline demo mode enabled." : "Online demo mode enabled.");
      break;
    case "toggle-menu":
      state.menuOpen = !state.menuOpen;
      render();
      break;
    case "notifications":
      showToast(state.settings.notifications ? "You're all caught up!" : "Learning reminders are turned off.");
      break;
    case "open-ai":
      state.aiOpen = true;
      if (!state.aiMessages.length) state.aiMessages.push({ role: "assistant", content: `Jambo ${state.profile.name}! I can help with a few learning topics in this local demo. No API key or external AI service is used.` });
      render();
      app.querySelector("#ai-input")?.focus();
      break;
    case "close-ai":
      if (control.classList.contains("ai-backdrop") || control.matches("button")) {
        state.aiOpen = false;
        render();
      }
      break;
    case "ai-suggest":
      sendTutorMessage(control.dataset.question);
      break;
    case "open-modal":
      state.modal = { type: control.dataset.modal, id: control.dataset.id || "", prompt: control.dataset.prompt || "" };
      render();
      app.querySelector(".modal-card input:not([type=hidden]), .modal-card textarea")?.focus();
      break;
    case "close-modal":
      state.modal = null;
      render();
      break;
    case "open-lesson":
      state.modal = { type: "lesson", id: control.dataset.id };
      render();
      break;
    case "complete-lesson":
      if (!state.completedLessons.includes(control.dataset.id)) state.completedLessons.push(control.dataset.id);
      state.modal = null;
      renderWorkspaceAndSave();
      showToast("Lesson marked complete.");
      break;
    case "open-lab":
      state.modal = { type: "lab", id: control.dataset.id, started: false, zoom: 1 };
      render();
      break;
    case "start-lab":
      state.modal = { ...state.modal, started: true, zoom: Number(state.modal?.zoom) || 1 };
      render();
      break;
    case "portfolio-detail":
      state.modal = { type: "portfolio-detail", id: control.dataset.id };
      render();
      break;
    case "delete-portfolio":
      state.portfolio = state.portfolio.filter((item) => item.id !== control.dataset.id);
      state.modal = null;
      renderWorkspaceAndSave();
      showToast("Portfolio item removed.");
      break;
    case "quiz-start":
      startQuiz(control.dataset.id);
      break;
    case "quiz-answer":
      if (state.quizSession && !state.quizSession.result) {
        state.quizSession.selected = Number(control.dataset.answerIndex);
        render();
      }
      break;
    case "quiz-next": {
      const session = state.quizSession;
      const quiz = data.quizzes.find((item) => item.id === session?.id);
      if (!session || !quiz || session.selected === null) {
        showToast("Choose an answer before continuing.");
        break;
      }
      session.answers.push(session.selected);
      if (session.index < quiz.questions.length - 1) {
        session.index += 1;
        session.selected = null;
        render();
      } else {
        completeQuiz();
      }
      break;
    }
    case "quiz-retry":
      startQuiz(control.dataset.id);
      break;
    case "quiz-back":
      state.quizSession = null;
      state.currentView = "quizzes";
      history.replaceState({ view: "quizzes", navigationIndex }, "", "#quizzes");
      renderWorkspaceAndSave();
      break;
    case "filter":
      state.filters[control.dataset.filterKey] = control.dataset.filterValue;
      renderWorkspaceAndSave();
      break;
    case "toggle-download": {
      const item = state.downloads.find((entry) => entry.id === control.dataset.id);
      if (item) {
        item.downloaded = !item.downloaded;
        renderWorkspaceAndSave();
        showToast(item.downloaded ? "Saved for offline study." : "Removed from saved items.");
      }
      break;
    }
    case "select-language":
      state.selectedLanguageId = control.dataset.id;
      state.languageLessonTitle = "";
      state.languagePhraseIndex = 0;
      state.showTranslation = false;
      renderWorkspaceAndSave();
      break;
    case "language-lesson":
      state.languageLessonTitle = control.dataset.title;
      state.languagePhraseIndex = 0;
      state.showTranslation = false;
      render();
      break;
    case "toggle-translation":
      state.showTranslation = !state.showTranslation;
      render();
      break;
    case "next-phrase": {
      const language = data.languages.find((item) => item.id === state.selectedLanguageId);
      const lesson = language?.lessons.find((item) => item.title === state.languageLessonTitle);
      if (lesson?.phrases?.length) state.languagePhraseIndex = (state.languagePhraseIndex + 1) % lesson.phrases.length;
      state.showTranslation = false;
      render();
      break;
    }
    case "speak-phrase": {
      const language = data.languages.find((item) => item.id === state.selectedLanguageId);
      const lesson = language?.lessons.find((item) => item.title === state.languageLessonTitle);
      const text = lesson?.phrases?.[state.languagePhraseIndex]?.native;
      if (text && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
      } else showToast("Speech playback is not available in this browser.");
      break;
    }
    case "join-service": {
      const suggestion = data.service.suggested_projects.find((item) => item.title === control.dataset.id);
      if (suggestion && !state.serviceProjects.some((item) => item.title === suggestion.title)) {
        state.serviceProjects.unshift({ id: makeId(), title: suggestion.title, description: `Planned with ${suggestion.organization}.`, hours: 0, status: "planned", impact: suggestion.category, date: "Not scheduled" });
        renderWorkspaceAndSave();
        showToast("Opportunity added to your plan.");
      } else showToast("That opportunity is already in your plan.");
      break;
    }
    case "complete-project": {
      const project = state.serviceProjects.find((item) => item.id === control.dataset.id);
      if (project) {
        project.status = "completed";
        renderWorkspaceAndSave();
        showToast("Project marked complete — well done!");
      }
      break;
    }
    case "service-reflection":
      state.modal = { type: "reflection", id: control.dataset.id };
      render();
      break;
    case "certificate":
      window.print();
      break;
    case "parent-tab":
      state.parentTab = control.dataset.tab;
      renderWorkspaceAndSave();
      break;
    case "message-detail":
      state.modal = { type: "message", index: control.dataset.index };
      render();
      break;
    case "recording-detail":
      state.modal = { type: "recording", id: control.dataset.id };
      render();
      break;
    case "start-recording":
      startRecording();
      break;
    case "stop-recording":
      finishRecording(true);
      break;
    case "save-voice-note":
      saveVoiceNote();
      break;
    case "clear-transcript":
      state.liveTranscript = "";
      updateTranscript("");
      break;
    case "export-data":
      exportDemoData();
      break;
    case "reset-data":
      resetDemoData();
      break;
    case "reflection-prompt":
      state.modal = { type: "reflection", prompt: control.dataset.prompt || "" };
      render();
      break;
    default:
      break;
  }
}

function handleClick(event) {
  if (event.target.classList?.contains("modal-backdrop")) {
    state.modal = null;
    render();
    return;
  }
  const control = event.target.closest("[data-action], [data-view]");
  if (!control || !app.contains(control)) return;
  if (control.classList.contains("modal-backdrop") && event.target !== control) return;
  if (control.tagName === "A") event.preventDefault();
  if (control.dataset.view) {
    navigate(control.dataset.view);
    return;
  }
  handleAction(control.dataset.action, control);
}

function formValue(form, name) {
  return new FormData(form).get(name)?.toString().trim() || "";
}

function completeOnboarding(school) {
  state.profile = {
    id: makeId(),
    name: onboarding.name.trim(),
    school: school.trim(),
    grade: onboarding.grade,
    points: 0,
    streak: 1,
    level: 1,
  };
  onboarding = null;
  selectedLevelId = null;
  state.currentView = "dashboard";
  state.modal = null;
  resetNavigation("dashboard");
  renderWorkspaceAndSave();
  showToast(`Karibu, ${state.profile.name.split(/\s+/)[0]}! Your learning space is ready.`);
}

function handleSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form || !app.contains(form)) return;
  event.preventDefault();
  const kind = form.dataset.form;
  if (kind === "onboarding-name") {
    const name = formValue(form, "name");
    onboarding.name = name;
    if (name.length < 2) onboarding.error = "Please enter at least two characters for your name.";
    else if (!/^[\p{L}\p{M}\s'-]+$/u.test(name)) onboarding.error = "Use letters, spaces, hyphens, or apostrophes in your name.";
    else {
      onboarding.step = 2;
      onboarding.error = "";
    }
    render();
    if (onboarding?.step === 2) app.querySelector("#learner-school")?.focus();
    return;
  }
  if (kind === "onboarding-school") {
    const formData = new FormData(form);
    const school = (formData.get("school") || "").toString().trim();
    const customSchool = (formData.get("customSchool") || "").toString().trim();
    onboarding.school = school;
    onboarding.customSchool = customSchool;
    const finalSchool = school === "Other" ? customSchool : school;
    if (!finalSchool) onboarding.error = "Please choose or enter your school name.";
    else if (finalSchool.length < 3) onboarding.error = "School name must be at least three characters.";
    else {
      onboarding.error = "";
      completeOnboarding(finalSchool);
      return;
    }
    render();
    return;
  }
  if (kind === "profile") {
    const name = formValue(form, "name");
    const school = formValue(form, "school");
    if (name.length < 2) return showToast("Please enter at least two characters for your name.");
    if (!/^[\p{L}\p{M}\s'-]+$/u.test(name)) return showToast("Use letters, spaces, hyphens, or apostrophes in your name.");
    if (school.length < 3) return showToast("School name must be at least three characters.");
    state.profile.name = name.slice(0, 80);
    state.profile.school = school.slice(0, 100);
    renderWorkspaceAndSave();
    showToast("Profile changes saved in this browser.");
    return;
  }
  if (kind === "portfolio") {
    const title = formValue(form, "title");
    if (!title) return showToast("Add a title for this evidence item.");
    const formData = new FormData(form);
    const selectedCompetencies = formData.getAll("competencies").map(String);
    state.portfolio.unshift({
      id: makeId(),
      title: title.slice(0, 100),
      type: formValue(form, "type") || "document",
      uploadDate: new Date().toISOString().slice(0, 10),
      subject: formValue(form, "subject") || "Science",
      competencies: selectedCompetencies.length ? selectedCompetencies : ["Critical Thinking"],
      reflection: formValue(form, "reflection").slice(0, 600),
      size: "Details stored locally",
    });
    state.modal = null;
    renderWorkspaceAndSave();
    showToast("Evidence added to your local portfolio.");
    return;
  }
  if (kind === "service") {
    const title = formValue(form, "title");
    const hours = Number(formValue(form, "hours"));
    if (!title) return showToast("Add a title for the service project.");
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) return showToast("Enter between 0.25 and 24 service hours.");
    state.serviceProjects.unshift({
      id: makeId(),
      title: title.slice(0, 100),
      description: formValue(form, "description").slice(0, 500),
      hours,
      status: "in-progress",
      impact: formValue(form, "impact") || "Community",
      date: formValue(form, "date") || new Date().toISOString().slice(0, 10),
      reflection: "",
    });
    state.modal = null;
    renderWorkspaceAndSave();
    showToast("Service project saved.");
    return;
  }
  if (kind === "reflection") {
    const formData = new FormData(form);
    const id = String(formData.get("id") || "");
    const reflection = String(formData.get("reflection") || "").trim().slice(0, 1000);
    const project = state.serviceProjects.find((item) => item.id === id);
    if (project) project.reflection = reflection;
    else if (reflection) state.reflectionNotes.unshift({ id: makeId(), reflection, date: new Date().toISOString().slice(0, 10) });
    state.modal = null;
    renderWorkspaceAndSave();
    showToast("Reflection saved in this browser.");
    return;
  }
  if (kind === "ai-message") {
    sendTutorMessage(formValue(form, "message"));
    return;
  }
  if (kind === "search") {
    state.searchQuery = formValue(form, "query").slice(0, 120);
    navigate("search");
  }
}

function handleInput(event) {
  const target = event.target;
  if (target.matches("#custom-school") && onboarding) {
    onboarding.customSchool = target.value;
    onboarding.error = "";
    return;
  }
  if (target.matches('[data-action="competency-score"]')) {
    const item = state.competencies.find((competency) => competency.id === target.dataset.id);
    if (!item) return;
    item.score = Math.max(0, Math.min(100, Number(target.value) || 0));
    item.level = getCompetencyLevel(item.score);
    const card = target.closest(".competency-detail");
    if (card) {
      card.querySelector(".score-value").textContent = `${item.score}%`;
      const tag = card.querySelector(".level-tag");
      tag.textContent = item.level;
      tag.className = `level-tag level-tag--${item.level}`;
      const fill = card.querySelector(".progress-fill");
      fill.style.width = `${item.score}%`;
      fill.className = `progress-fill progress-fill--${item.level}`;
      card.querySelector(".progress-track").setAttribute("aria-valuenow", String(item.score));
    }
    saveState();
    return;
  }
  if (target.matches('[data-action="lab-zoom"]')) {
    if (state.modal) state.modal.zoom = Number(target.value);
    const label = app.querySelector("#lab-zoom-value");
    const lab = data.labs.find((item) => item.id === state.modal?.id);
    if (label) label.textContent = lab?.id === "virtual-microscope" ? `${target.value}×` : `${target.value} units`;
    const orbit = app.querySelector(".experiment-orbit");
    if (orbit) orbit.style.setProperty("--zoom", String(Math.min(3, Number(target.value))));
    return;
  }
  if (target.matches("#live-transcript")) {
    state.liveTranscript = target.value;
    const count = app.querySelector(".word-count");
    if (count) count.textContent = `${target.value.trim() ? target.value.trim().split(/\s+/).length : 0} words`;
  }
}

function handleChange(event) {
  const target = event.target;
  if (target.matches('[data-action="toggle-notifications"]')) {
    state.settings.notifications = target.checked;
    renderWorkspaceAndSave();
    showToast(target.checked ? "Learning reminders enabled." : "Learning reminders disabled.");
  } else if (target.matches('[data-action="setting-offline"]')) {
    state.isOffline = target.checked;
    renderWorkspaceAndSave();
  } else if (target.matches('[data-action="setting-language"]')) {
    state.settings.language = target.value;
    renderWorkspaceAndSave();
    showToast("Language preference saved.");
  } else if (target.matches('[data-action="competency-score"]')) {
    renderWorkspaceAndSave();
  } else if (target.matches('#learner-school[name="school"]')) {
    if (onboarding) {
      onboarding.school = target.value;
      onboarding.error = "";
      if (target.value === "Other") render();
    }
  }
}

function handleHistory(event) {
  if (!state?.profile) return;
  const view = location.hash.slice(1);
  if (!PAGE_IDS.has(view)) return;
  const targetIndex = event.state?.navigationIndex;
  if (Number.isInteger(targetIndex) && navigationTrail[targetIndex] === view) {
    navigationIndex = targetIndex;
  } else if (navigationIndex > 0 && navigationTrail[navigationIndex - 1] === view) {
    navigationIndex -= 1;
  } else if (navigationIndex < navigationTrail.length - 1 && navigationTrail[navigationIndex + 1] === view) {
    navigationIndex += 1;
  } else {
    navigationTrail = [view];
    navigationIndex = 0;
    history.replaceState({ view, navigationIndex }, "", `#${view}`);
  }
  state.currentView = view;
  state.modal = null;
  state.quizSession = null;
  state.menuOpen = false;
  renderWorkspaceAndSave();
}

async function boot() {
  if (!app) return;
  app.addEventListener("click", handleClick);
  app.addEventListener("submit", handleSubmit);
  app.addEventListener("input", handleInput);
  app.addEventListener("change", handleChange);
  window.addEventListener("popstate", handleHistory);
  window.addEventListener("beforeunload", () => {
    window.clearInterval(recordingTimer);
    window.clearInterval(transcriptTimer);
    try { speechRecognizer?.stop(); } catch { /* no active recognizer */ }
  });
  try {
    const [contentResponse, configResponse] = await Promise.all([
      fetch("./data/learning-content.json", { cache: "no-cache" }),
      fetch("./site-config.json", { cache: "no-cache" }),
    ]);
    if (!contentResponse.ok || !configResponse.ok) throw new Error("Static content files were not found.");
    data = await contentResponse.json();
    config = await configResponse.json();
    const importedLegacyProfile = await importLegacyProfile({ storageKey: config.storage_key, content: data });
    state = loadState(data, config);
    if (state.profile) {
      const route = location.hash.slice(1);
      if (PAGE_IDS.has(route)) state.currentView = route;
      resetNavigation(state.currentView);
      render();
      if (importedLegacyProfile) showToast("Your learner profile and saved progress were imported. API keys and chat history were not copied.");
    } else {
      render();
    }
  } catch (error) {
    console.error("Elimu Plus static preview failed to load", error);
    showToast("Learning content could not load. Please serve the generated site over HTTP.");
  }
}

boot();
