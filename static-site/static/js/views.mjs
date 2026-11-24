import {
  averageScore,
  escapeHtml as e,
  getCompetencyLevel,
  getEducationLevel,
  getServiceBadge,
  getServiceProgress,
  totalDownloadedMb,
} from "./logic.mjs";

export const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "🏠", group: "LEARN" },
  { id: "competencies", label: "Competency Radar", icon: "🎯", group: "LEARN" },
  { id: "quizzes", label: "Gamified Quizzes", icon: "🎮", group: "LEARN" },
  { id: "lessons", label: "KICD Video Lessons", icon: "🎬", group: "LEARN" },
  { id: "labs", label: "Virtual Labs (STEM)", icon: "🔬", group: "EXPLORE" },
  { id: "languages", label: "Indigenous Languages", icon: "🗣️", group: "EXPLORE" },
  { id: "community", label: "Community Service", icon: "🤝", group: "GROW" },
  { id: "portfolio", label: "Portfolio & Evidence", icon: "📁", group: "GROW" },
  { id: "offline", label: "Offline Content", icon: "📥", group: "GROW" },
  { id: "voice-notes", label: "Voice to Text", icon: "🎤", group: "TOOLS" },
  { id: "settings", label: "Settings", icon: "⚙️", group: "TOOLS" },
];

const SUBJECTS = ["All", "Mathematics", "Biology", "Chemistry", "Physics", "English", "Kiswahili", "History", "Computer Science", "Social Studies"];
const PORTFOLIO_SUBJECTS = ["All", "Science", "Mathematics", "English", "Kiswahili", "Creative Arts", "Life Skills", "Social Studies"];
const DOWNLOAD_TYPES = ["all", "curriculum", "notes", "worksheet"];

const iconForType = (type) => ({ curriculum: "📚", notes: "📝", worksheet: "📋" })[type] || "📄";
const iconForFile = (type) => ({ pdf: "📄", video: "🎬", image: "🖼️", document: "📁" })[type] || "📁";
const safePercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));
const firstName = (name) => String(name || "Learner").trim().split(/\s+/)[0] || "Learner";
const dateLabel = () => new Intl.DateTimeFormat("en-KE", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

export function renderFlowFrame(content, config) {
  return `
    <header class="landing-header">
      <a class="brand" href="./" data-action="back-to-levels" aria-label="${e(config.name)} home">
        <span class="brand-mark" aria-hidden="true">📚</span>
        <span class="brand-copy"><strong>${e(config.name)}</strong><small>CBC learning companion</small></span>
      </a>
      <div class="header-note"><span class="status-dot"></span> Made for learners in Kenya</div>
    </header>
    <main class="flow-main" id="view-root" aria-live="polite">${content}</main>
    <footer class="landing-footer">
      <span><span aria-hidden="true">🇰🇪</span> Republic of Kenya</span><span class="footer-separator" aria-hidden="true">•</span>
      <span>Aligned with KICD curriculum</span><span class="footer-separator" aria-hidden="true">•</span><span>Learning starts with you</span>
    </footer>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}

export function renderLandingContent(data) {
  const cards = data.grade_levels.map((level) => `
    <button class="level-card level-card--${e(level.theme)}" type="button" data-action="select-level" data-level="${e(level.id)}" aria-label="${e(level.name)}, ${e(level.subtitle)}">
      <span class="level-icon" aria-hidden="true">${e(level.icon)}</span>
      <span class="level-card-top"><span class="level-kicker">${e(level.subtitle)}</span><span class="level-arrow" aria-hidden="true">↗</span></span>
      <strong class="level-name">${e(level.name)}</strong>
      <span class="level-description">${e(level.description)}</span>
      <span class="level-features">${level.features.map((feature) => `<span><i aria-hidden="true">✓</i>${e(feature)}</span>`).join("")}</span>
      <span class="level-action">Explore this level <span aria-hidden="true">→</span></span>
    </button>`).join("");
  return `<section class="welcome" aria-labelledby="welcome-title"><p class="eyebrow"><span>🇰🇪</span> Kenya's CBC learning companion</p><h1 id="welcome-title">A brighter way<br>to <span>learn and grow.</span></h1><p class="welcome-copy">Choose your level to find lessons, practice, and tools made for your learning journey.</p><div class="welcome-badges" aria-label="Platform highlights"><span>📚 KICD aligned</span><span>🎓 Grades 4-12</span><span>✨ Learn at your pace</span></div></section><section class="level-section" aria-labelledby="level-title"><div class="section-heading"><div><h2 id="level-title">Choose Your Level</h2><p>Select your education level to get started</p></div><span class="section-count">01 <i>/ 03</i></span></div><div class="level-grid">${cards}</div></section>`;
}

export function renderGradeChoices(level) {
  const grades = level.grades.map((grade) => `
    <button class="grade-choice grade-choice--${e(level.theme)}" type="button" data-action="select-grade" data-grade="${grade}">
      <span class="grade-choice-number">${grade}</span><span class="grade-choice-label">Grade</span><span class="grade-choice-action">Start learning <b aria-hidden="true">→</b></span>
    </button>`).join("");
  const features = level.features.map((feature) => `<li><span aria-hidden="true">✓</span>${e(feature)}</li>`).join("");
  return `
    <section class="flow-wrap" aria-labelledby="grade-title">
      <button class="text-button flow-back" type="button" data-action="back-to-levels"><span aria-hidden="true">←</span> Back to levels</button>
      <div class="flow-heading">
        <span class="flow-icon flow-icon--${e(level.theme)}" aria-hidden="true">${e(level.icon)}</span>
        <p class="eyebrow">${e(level.subtitle)}</p>
        <h1 id="grade-title">${e(level.name)}</h1>
        <p>Choose your grade to continue your learning journey.</p>
      </div>
      <div class="grade-grid">${grades}</div>
      <aside class="level-detail"><div><span class="detail-sparkle">✦</span><h2>What you'll explore in ${e(level.name)}</h2><p>${e(level.description)}</p></div><ul>${features}</ul></aside>
    </section>`;
}

export function renderOnboarding(onboarding, data) {
  const isNameStep = onboarding.step === 1;
  const levelName = getEducationLevel(onboarding.grade);
  const level = data.grade_levels.find((item) => item.grades.includes(onboarding.grade));
  const error = onboarding.error ? `<p class="form-error" role="alert">⚠️ ${e(onboarding.error)}</p>` : "";
  const progress = `<div class="onboarding-steps"><span class="step-pill ${isNameStep ? "is-current" : "is-done"}"><b>1</b>Your name</span><i></i><span class="step-pill ${!isNameStep ? "is-current" : ""}"><b>2</b>Your school</span></div>`;
  const content = isNameStep ? `
    <form class="onboarding-form" data-form="onboarding-name" novalidate>
      <div class="onboarding-icon">👋</div><h2>What's your name?</h2><p>Let's personalize your learning experience.</p>
      <label for="learner-name">Full name</label>
      <input id="learner-name" name="name" type="text" autocomplete="name" maxlength="80" placeholder="e.g., Amani Wanjiku" value="${e(onboarding.name)}" required>
      ${error}<button class="button button--primary button--wide" type="submit">Continue <span aria-hidden="true">→</span></button>
    </form>` : `
    <form class="onboarding-form" data-form="onboarding-school" novalidate>
      <div class="onboarding-icon">🏫</div><h2>Which school do you attend?</h2><p>Your school helps us personalize the demo. You can change it later.</p>
      <label for="learner-school">School name</label>
      <select id="learner-school" name="school" required>
        <option value="">Choose your school</option>
        ${data.schools.map((school) => `<option value="${e(school)}" ${onboarding.school === school ? "selected" : ""}>${e(school)}</option>`).join("")}
      </select>
      ${onboarding.school === "Other" ? `<label for="custom-school">Enter your school</label><input id="custom-school" name="customSchool" type="text" maxlength="100" placeholder="School name" value="${e(onboarding.customSchool)}" required>` : ""}
      ${error}<div class="button-row"><button class="button button--quiet" type="button" data-action="onboarding-back">← Back</button><button class="button button--primary" type="submit">Start learning <span aria-hidden="true">→</span></button></div>
    </form>`;
  return `
    <section class="flow-wrap onboarding-wrap" aria-labelledby="onboarding-title">
      <button class="text-button flow-back" type="button" data-action="back-to-levels"><span aria-hidden="true">←</span> Change grade</button>
      <div class="onboarding-card">
        <div class="selected-grade selected-grade--${e(level?.theme || "green")}"><span>${e(level?.icon || "📚")}</span><div><small>Selected grade</small><strong>Grade ${onboarding.grade} · ${e(levelName)}</strong></div></div>
        ${progress}${content}
        <p class="privacy-note">🔒 Demo profile is stored only in this browser.</p>
      </div>
    </section>`;
}

function pageHeader(kicker, title, description, action = "") {
  return `<div class="page-heading"><div><p class="page-kicker">${e(kicker)}</p><h1>${e(title)}</h1><p>${e(description)}</p></div>${action}</div>`;
}

function metric(label, value, icon, tone = "green", foot = "") {
  return `<article class="metric-card metric-card--${e(tone)}"><div class="metric-icon">${e(icon)}</div><div><p class="metric-value">${e(value)}</p><p class="metric-label">${e(label)}</p>${foot ? `<small>${e(foot)}</small>` : ""}</div></article>`;
}

function progressBar(score, tone = "green") {
  const value = safePercent(score);
  return `<div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span class="progress-fill progress-fill--${e(tone)}" style="width:${value}%"></span></div>`;
}

function emptyState(icon, title, message, action = "") {
  return `<div class="empty-state"><span>${e(icon)}</span><h3>${e(title)}</h3><p>${e(message)}</p>${action}</div>`;
}

function renderDashboard(state, data) {
  const profile = state.profile;
  const competencies = state.competencies || [];
  const results = Object.values(state.quizResults || {});
  const quizCount = results.length;
  const average = averageScore(results);
  const serviceHours = (state.serviceProjects || []).reduce((total, project) => total + (Number(project.hours) || 0), 0);
  const actions = [
    ["quizzes", "🎮", "Take a quiz", "orange"], ["lessons", "🎬", "Explore lessons", "rose"],
    ["labs", "🔬", "Open STEM lab", "blue"], ["languages", "🗣️", "Learn a language", "amber"],
    ["portfolio", "📁", "My portfolio", "purple"], ["community", "🤝", "Community service", "teal"],
  ];
  const tasks = data.dashboard.upcoming_tasks.map((task) => `<li><span class="list-icon">${e(task.icon)}</span><span class="list-copy"><strong>${e(task.title)}</strong><small>${e(task.due)}</small></span><span class="task-dot task-dot--${e(task.type)}"></span></li>`).join("");
  const achievements = data.dashboard.achievements.map((achievement) => `<div class="achievement-row"><span>${e(achievement.icon)}</span><div><strong>${e(achievement.title)}</strong><small>${e(achievement.date)}</small></div></div>`).join("");
  const competencyRows = competencies.slice(0, 5).map((item) => {
    const level = getCompetencyLevel(item.score);
    return `<div class="competency-row"><span class="competency-icon">${e(item.icon)}</span><div class="competency-row-main"><div class="competency-row-label"><strong>${e(item.short_name)}</strong><span class="level-tag level-tag--${level}">${level}</span></div>${progressBar(item.score, level)}</div><b class="score-number">${safePercent(item.score)}%</b></div>`;
  }).join("");
  return `
    <section class="page page--dashboard">
      <div class="dashboard-hero"><div class="hero-spark hero-spark--one"></div><div class="hero-spark hero-spark--two"></div><div class="dashboard-hero-copy"><p class="hero-kicker">🇰🇪 Karibu, ${e(firstName(profile.name))}! <span>Grade ${profile.grade} · ${e(getEducationLevel(profile.grade))}</span></p><h1>Ready to learn today?</h1><p>You're on a ${e(profile.streak || 1)}-day streak. Choose a quick activity and keep growing.</p><div class="hero-actions"><button class="button button--white" data-view="quizzes">Start a quiz <span>🎮</span></button><button class="button button--glass" data-view="lessons">Browse lessons <span>🎬</span></button></div></div><div class="hero-emblem" aria-hidden="true">📚</div></div>
      <div class="quick-action-grid">${actions.map(([view, icon, label, tone]) => `<button class="quick-action quick-action--${tone}" data-view="${view}"><span>${icon}</span><strong>${e(label)}</strong><i aria-hidden="true">↗</i></button>`).join("")}</div>
      <div class="metric-grid">
        ${metric("Learning streak", `${profile.streak || 1} days`, "🔥", "orange", "Keep the rhythm going")}
        ${metric("Total points", Number(profile.points || 0).toLocaleString(), "⭐", "yellow", "Earned as you practice")}
        ${metric("Current level", `Level ${profile.level || 1}`, "🏆", "purple", "Your learning journey")}
        ${metric("Quizzes completed", String(quizCount), "✅", "green", quizCount ? `Average score ${average}%` : "Your first one is waiting")}
      </div>
      <div class="dashboard-grid">
        <section class="surface-card competency-overview"><div class="card-heading"><div><p class="card-kicker">YOUR GROWTH</p><h2>Competency progress</h2></div><button class="text-link" data-view="competencies">See all <span>→</span></button></div><div class="competency-list">${competencyRows}</div></section>
        <section class="surface-card task-card"><div class="card-heading"><div><p class="card-kicker">STAY ON TRACK</p><h2>Upcoming tasks</h2></div><span class="card-heading-icon">🗓️</span></div><ul class="task-list">${tasks}</ul><button class="subtle-button" data-view="quizzes">View learning activities <span>→</span></button></section>
        <section class="surface-card achievement-card"><div class="card-heading"><div><p class="card-kicker">LITTLE WINS</p><h2>Recent achievements</h2></div><span class="card-heading-icon">🏅</span></div><div class="achievement-list">${achievements}</div><button class="subtle-button" data-view="competencies">Explore your strengths <span>→</span></button></section>
        <section class="service-teaser"><div><span class="service-teaser-icon">🤝</span><div><p class="card-kicker">LEARN BY SERVING</p><h2>${serviceHours} community service hours</h2><p>Every small action can make a meaningful difference.</p></div></div><button class="button button--dark" data-view="community">Log service <span>→</span></button></section>
      </div>
    </section>`;
}

function buildRadar(competencies) {
  const centerX = 150;
  const centerY = 132;
  const radius = 90;
  const count = Math.max(competencies.length, 1);
  const point = (index, score) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const distance = (safePercent(score) / 100) * radius;
    return `${centerX + distance * Math.cos(angle)},${centerY + distance * Math.sin(angle)}`;
  };
  const rings = [25, 50, 75, 100].map((step) => `<circle cx="${centerX}" cy="${centerY}" r="${radius * step / 100}" class="radar-ring" />`).join("");
  const spokes = competencies.map((_, index) => {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" class="radar-spoke" />`;
  }).join("");
  const polygon = competencies.map((item, index) => point(index, item.score)).join(" ");
  const dots = competencies.map((item, index) => {
    const [x, y] = point(index, item.score).split(",");
    return `<circle cx="${x}" cy="${y}" r="3.5" class="radar-point" />`;
  }).join("");
  return `<svg class="radar-svg" viewBox="0 0 300 270" role="img" aria-label="Competency radar chart: average ${averageScore(competencies)} percent"><g>${rings}${spokes}<polygon points="${polygon}" class="radar-area"/>${dots}</g><text x="150" y="137" class="radar-center">${averageScore(competencies)}%</text><text x="150" y="154" class="radar-caption">AVERAGE</text></svg>`;
}

function renderCompetencies(state) {
  const competencies = state.competencies || [];
  const average = averageScore(competencies);
  const levelGroups = ["exceeding", "meeting", "approaching", "below"].map((level) => {
    const count = competencies.filter((item) => getCompetencyLevel(item.score) === level).length;
    return `<span class="legend-item"><i class="level-dot level-dot--${level}"></i>${level} <b>${count}</b></span>`;
  }).join("");
  const cards = competencies.map((item) => {
    const level = getCompetencyLevel(item.score);
    return `<article class="competency-detail"><div class="competency-detail-top"><span class="competency-detail-icon">${e(item.icon)}</span><span class="level-tag level-tag--${level}">${level}</span></div><h3>${e(item.name)}</h3><p class="competency-description">${e({ exceeding: "Consistently demonstrates strong understanding and application.", meeting: "Demonstrates solid understanding and applies knowledge effectively.", approaching: "Shows developing understanding with some practice needed.", below: "More practice and support can help build confidence." }[level])}</p><div class="competency-edit-row"><span>Progress</span><strong class="score-value">${safePercent(item.score)}%</strong></div>${progressBar(item.score, level)}<label class="visually-hidden" for="score-${e(item.id)}">Adjust ${e(item.short_name)} score</label><input class="score-slider" id="score-${e(item.id)}" type="range" min="0" max="100" value="${safePercent(item.score)}" data-action="competency-score" data-id="${e(item.id)}"></article>`;
  }).join("");
  return `<section class="page">${pageHeader("CBC CORE COMPETENCIES", "Competency radar", "Notice what you're already good at, and choose what to practice next.")}
    <div class="radar-layout"><article class="surface-card radar-card"><div class="card-heading"><div><p class="card-kicker">YOUR LEARNING PROFILE</p><h2>Seven ways to grow</h2></div><span class="score-chip">${average}% average</span></div><div class="radar-wrap">${buildRadar(competencies)}</div><div class="level-legend">${levelGroups}</div></article><article class="competency-tip"><span class="tip-illustration">🌱</span><p class="card-kicker">A GOOD NEXT STEP</p><h2>Growth happens one practice at a time.</h2><p>Adjust a score as a reflection exercise. Your changes are saved in this browser only.</p><button class="button button--dark" data-view="quizzes">Practice with a quiz <span>→</span></button></article></div>
    <div class="section-title-row"><div><p class="card-kicker">YOUR SEVEN STRENGTHS</p><h2>Core competencies</h2></div><p>Use the sliders to reflect on your progress.</p></div><div class="competency-detail-grid">${cards}</div></section>`;
}

function renderPortfolio(state) {
  const items = state.portfolio || [];
  const selected = state.filters?.portfolio || "all";
  const filtered = selected === "all" ? items : items.filter((item) => item.subject === selected);
  const imageCount = items.filter((item) => item.type === "image").length;
  const videoCount = items.filter((item) => item.type === "video").length;
  const documentCount = items.filter((item) => ["pdf", "document"].includes(item.type)).length;
  const filters = PORTFOLIO_SUBJECTS.map((subject) => `<button class="filter-pill ${selected === (subject === "All" ? "all" : subject) ? "is-active" : ""}" data-action="filter" data-filter-key="portfolio" data-filter-value="${subject === "All" ? "all" : e(subject)}">${subject === "All" ? "📚 All subjects" : e(subject)}</button>`).join("");
  const cards = filtered.map((item) => `<button class="portfolio-card" data-action="portfolio-detail" data-id="${e(item.id)}"><span class="portfolio-card-art portfolio-card-art--${e(item.type)}">${iconForFile(item.type)}</span><span class="portfolio-card-copy"><strong>${e(item.title)}</strong><small>${e(item.subject)} · ${e(item.uploadDate || "Today")}</small><span class="tag-row">${(item.competencies || []).slice(0, 2).map((value) => `<i>${e(value)}</i>`).join("")}</span><span class="portfolio-card-foot"><small>${e(item.fileName || item.size || "Local item")}</small><span>Open ↗</span></span></span></button>`).join("");
  const action = `<button class="button button--primary" data-action="open-modal" data-modal="portfolio">＋ Add evidence</button>`;
  return `<section class="page">${pageHeader("YOUR LEARNING, COLLECTED", "Digital portfolio", "Save evidence of the ideas, projects, and skills you build along the way.", action)}
    <div class="metric-grid metric-grid--compact">${metric("Total items", String(items.length), "📁", "blue")}${metric("Images", String(imageCount), "🖼️", "green")}${metric("Videos", String(videoCount), "🎬", "purple")}${metric("Documents", String(documentCount), "📄", "orange")}</div>
    <div class="filter-row">${filters}</div>
    ${cards ? `<div class="portfolio-grid">${cards}</div>` : emptyState("📂", selected === "all" ? "Your portfolio is ready" : "No items in this subject yet", "Add a reflection, project, or piece of evidence to start your collection.", `<button class="button button--primary" data-action="open-modal" data-modal="portfolio">＋ Add your first item</button>`)}
    <p class="privacy-note privacy-note--light">Files are not uploaded by this static demo; only item details are stored in this browser.</p></section>`;
}

function quizResultFor(quiz, state) {
  return state.quizResults?.[quiz.id] || (quiz.completed ? { percent: quiz.score, score: quiz.score, sample: true, completed: true } : null);
}

function renderQuizList(state, data) {
  const resultValues = Object.values(state.quizResults || {});
  const average = averageScore(resultValues);
  const cards = data.quizzes.map((quiz) => {
    const result = quizResultFor(quiz, state);
    const score = result?.percent ?? result?.score;
    return `<button class="quiz-card ${result ? "quiz-card--complete" : ""}" data-action="quiz-start" data-id="${e(quiz.id)}"><span class="quiz-icon">${e(quiz.icon)}</span><span class="quiz-card-main"><span class="quiz-card-subject">${e(quiz.subject)} · Grade ${quiz.grade}</span><strong>${e(quiz.title)}</strong><span class="quiz-meta">${quiz.questions.length} practice questions <i>·</i> ${quiz.duration_minutes} min <i>·</i> ⭐ ${quiz.points} pts</span>${result ? `<span class="quiz-score">✓ Previous score <b>${e(score)}%</b></span>` : `<span class="quiz-open-label">Start quick practice <b>→</b></span>`}</span><span class="quiz-card-corner">${result ? "✓" : "↗"}</span></button>`;
  }).join("");
  const leaderboard = [
    [1, "Learner A", 2890, "A"], [2, "Learner B", 2750, "B"], [3, "Learner C", 2680, "C"], [4, "Learner D", 2550, "D"], [5, firstName(state.profile.name), Number(state.profile.points || 0), firstName(state.profile.name).charAt(0).toUpperCase()],
  ].map(([rank, name, points, initial]) => `<div class="leader-row ${rank === 5 ? "leader-row--you" : ""}"><span class="leader-rank">${rank}</span><span class="leader-avatar">${e(initial)}</span><span class="leader-name">${e(name)}${rank === 5 ? " <i>(You)</i>" : ""}</span><strong>${Number(points).toLocaleString()} pts</strong></div>`).join("");
  return `<section class="page">${pageHeader("PRACTICE & PLAY", "Gamified quizzes", "Try a quick set of questions, check your understanding, and earn points.")}
    <div class="metric-grid metric-grid--compact">${metric("Quizzes completed", String(resultValues.length), "✅", "green")}${metric("Average score", `${average}%`, "📈", "blue")}${metric("Badges earned", String(Math.floor(resultValues.length / 2)), "🏅", "purple")}${metric("Your points", Number(state.profile.points || 0).toLocaleString(), "⭐", "orange")}</div>
    <div class="quiz-layout"><div><div class="section-title-row"><div><p class="card-kicker">PICK A TOPIC</p><h2>Available quizzes</h2></div><span class="soft-count">${data.quizzes.length} subjects</span></div><div class="quiz-grid">${cards}</div></div><aside class="surface-card leaderboard"><div class="card-heading"><div><p class="card-kicker">FRIENDLY MOTIVATION</p><h2>Class leaderboard</h2></div><span>🏆</span></div><p class="muted-small">Demo scores only — this is not a live class ranking.</p><div class="leader-list">${leaderboard}</div><div class="leader-note">⭐ Keep practicing to build your own points.</div></aside></div></section>`;
}

function renderQuizSession(state, data) {
  const session = state.quizSession;
  const quiz = data.quizzes.find((item) => item.id === session?.id);
  if (!quiz) return renderQuizList(state, data);
  if (session.result) {
    const result = session.result;
    const previous = state.quizResults?.[quiz.id];
    return `<section class="page quiz-session-page"><button class="text-button" data-action="quiz-back">← All quizzes</button><div class="quiz-result-card"><span class="result-confetti">🎉</span><p class="page-kicker">PRACTICE COMPLETE</p><h1>Great effort, ${e(firstName(state.profile.name))}!</h1><p>You got <strong>${result.correct} out of ${result.total}</strong> questions right.</p><div class="result-score">${result.percent}<span>%</span></div><div class="result-details"><span>⭐ ${result.points} practice points</span><span>${result.firstAttempt ? "Score saved in this browser" : previous?.sample ? "Example score updated" : "Best score saved"}</span></div><div class="result-actions"><button class="button button--primary" data-action="quiz-retry" data-id="${e(quiz.id)}">Try again</button><button class="button button--quiet" data-action="quiz-back">Back to quizzes</button></div></div></section>`;
  }
  const question = quiz.questions[session.index];
  const options = question.options.map((option, index) => `<button class="answer-option ${session.selected === index ? "is-selected" : ""}" data-action="quiz-answer" data-answer-index="${index}"><span>${String.fromCharCode(65 + index)}</span>${e(option)}</button>`).join("");
  const progress = Math.round((session.index / quiz.questions.length) * 100);
  return `<section class="page quiz-session-page"><button class="text-button" data-action="quiz-back">← Leave quiz</button><article class="quiz-question-card"><div class="quiz-session-top"><span class="quiz-icon">${e(quiz.icon)}</span><div><p class="page-kicker">${e(quiz.subject)} · GRADE ${quiz.grade}</p><h1>${e(quiz.title)}</h1></div><span class="question-count">${session.index + 1} <i>/ ${quiz.questions.length}</i></span></div><div class="progress-track quiz-progress"><span class="progress-fill progress-fill--blue" style="width:${progress}%"></span></div><p class="question-prompt">${e(question.question)}</p><div class="answer-grid">${options}</div><div class="quiz-question-footer"><span>${session.selected === null ? "Choose the answer you think is right." : "Answer selected — ready when you are."}</span><button class="button button--primary" data-action="quiz-next">${session.index === quiz.questions.length - 1 ? "Finish quiz" : "Next question"} <span>→</span></button></div></article></section>`;
}

function renderQuizzes(state, data) {
  return state.quizSession ? renderQuizSession(state, data) : renderQuizList(state, data);
}

function renderLessons(state, data) {
  const selected = state.filters?.lessons || "All";
  const filtered = selected === "All" ? data.lessons : data.lessons.filter((lesson) => lesson.subject === selected);
  const filters = SUBJECTS.map((subject) => `<button class="filter-pill ${selected === subject ? "is-active" : ""}" data-action="filter" data-filter-key="lessons" data-filter-value="${e(subject)}">${e(subject)}</button>`).join("");
  const cards = filtered.map((lesson) => {
    const completed = (state.completedLessons || []).includes(lesson.id);
    return `<article class="lesson-card"><button class="lesson-art" data-action="open-lesson" data-id="${e(lesson.id)}" aria-label="Open ${e(lesson.title)}"><span>${e(lesson.icon)}</span><i>${completed ? "✓ Watched" : "▶ Lesson"}</i></button><div class="lesson-card-copy"><span class="lesson-grade">Grade ${lesson.grade} · KICD aligned</span><h3>${e(lesson.title)}</h3><p>${e(lesson.description)}</p><div class="lesson-card-foot"><span>⏱ ${e(lesson.duration)}</span><span>👁 ${Number(lesson.views).toLocaleString()}</span><button class="text-link" data-action="open-lesson" data-id="${e(lesson.id)}">${completed ? "Review" : "Explore"} →</button></div></div></article>`;
  }).join("");
  return `<section class="page">${pageHeader("KICD-ALIGNED LEARNING", "Video lessons", "Browse short, focused lessons across subjects and continue at your own pace.")}
    <div class="lesson-highlight"><div><span class="highlight-label">FEATURED THIS WEEK</span><h2>Small steps make big ideas easier.</h2><p>Explore a lesson, note a new idea, and mark it complete when you're ready.</p></div><span aria-hidden="true">✨</span></div>
    <div class="filter-row filter-row--scroll">${filters}</div><div class="lesson-grid">${cards || emptyState("🎬", "No lessons in this subject", "Choose another subject to see more learning content.")}</div>
    <p class="privacy-note privacy-note--light">The original app's video entries used a shared sample clip. This sidecar provides lesson previews without relying on that placeholder media.</p></section>`;
}

function renderLabs(state, data) {
  const selected = state.filters?.labs || "all";
  const filtered = selected === "all" ? data.labs : data.labs.filter((lab) => lab.subject === selected);
  const subjects = [["all", "🌟 All labs"], ["biology", "🌱 Biology"], ["chemistry", "⚗️ Chemistry"], ["physics", "🚀 Physics"], ["mathematics", "📐 Mathematics"]];
  const filters = subjects.map(([id, label]) => `<button class="filter-pill ${selected === id ? "is-active" : ""}" data-action="filter" data-filter-key="labs" data-filter-value="${id}">${label}</button>`).join("");
  const cards = filtered.map((lab) => `<button class="lab-card lab-card--${e(lab.subject)}" data-action="open-lab" data-id="${e(lab.id)}"><span class="lab-card-top"><span class="lab-icon">${e(lab.icon)}</span><span class="difficulty difficulty--${e(lab.difficulty)}">${e(lab.difficulty)}</span></span><span class="lab-subject">${e(lab.subject)}</span><strong>${e(lab.title)}</strong><span class="lab-description">${e(lab.description)}</span><span class="lab-foot"><small>⏱ ${e(lab.duration)}</small><b>Open lab →</b></span></button>`).join("");
  return `<section class="page">${pageHeader("SAFE, CURIOUS, HANDS-ON", "Virtual STEM labs", "Explore science concepts in a browser-based learning sandbox — no equipment needed.")}
    <div class="lab-banner"><div><p class="card-kicker">EXPERIMENT SAFELY</p><h2>Ask a question. Try an idea. Notice what changes.</h2><p>These mini simulations are learning activities, not substitutes for a supervised physical lab.</p></div><span>🧪</span></div><div class="filter-row">${filters}</div><div class="lab-grid">${cards}</div></section>`;
}

function renderLanguages(state, data) {
  const selected = data.languages.find((language) => language.id === state.selectedLanguageId) || data.languages[0];
  const lesson = selected.lessons.find((item) => item.title === state.languageLessonTitle);
  const languages = data.languages.map((language) => `<button class="language-card ${selected.id === language.id ? "is-selected" : ""}" data-action="select-language" data-id="${e(language.id)}"><span>${e(language.icon)}</span><strong>${e(language.name)}</strong><small>${e(language.region)}</small><i>${e(language.speakers)} speakers</i></button>`).join("");
  const lessonCards = selected.lessons.length ? selected.lessons.map((item) => `<button class="language-lesson ${lesson?.title === item.title ? "is-active" : ""}" data-action="language-lesson" data-title="${e(item.title)}"><span class="level-tag level-tag--${item.level === "beginner" ? "meeting" : "approaching"}">${e(item.level)}</span><strong>${e(item.title)}</strong><small>${item.phrases.length} phrases · Start a flashcard round →</small></button>`).join("") : emptyState("📚", "Lessons coming soon", `We're working on adding ${selected.name} lessons. Check back soon.`);
  const phrase = lesson?.phrases?.[state.languagePhraseIndex || 0];
  const flashcard = lesson && phrase ? `<article class="flashcard"><p class="card-kicker">${e(selected.name)} · ${e(lesson.title)}</p><strong>${e(phrase.native)}</strong><p class="flashcard-translation ${state.showTranslation ? "is-shown" : ""}">${state.showTranslation ? e(phrase.translation) : "Tap to reveal the meaning"}</p><div class="button-row"><button class="button button--quiet" data-action="toggle-translation">${state.showTranslation ? "Hide meaning" : "Reveal meaning"}</button><button class="button button--quiet" data-action="speak-phrase">🔊 Speak</button><button class="button button--primary" data-action="next-phrase">Next phrase →</button></div></article>` : "";
  const stories = data.cultural_content.map((item) => `<article class="culture-card"><span>${e(item.type)}</span><h3>${e(item.title)}</h3><p>${e(item.description)}</p><small>${e(item.language)}</small></article>`).join("");
  return `<section class="page">${pageHeader("LANGUAGE, CULTURE & CONNECTION", "Indigenous languages", "Celebrate Kenya's linguistic heritage through greetings, useful phrases, and cultural stories.")}
    <div class="heritage-banner"><span class="heritage-emoji">🇰🇪</span><div><p class="card-kicker">KENYAN HERITAGE</p><h2>Learn a phrase. Carry a story.</h2><p>Start with a greeting, then explore the people and traditions behind the words.</p></div><span class="heritage-count">8 languages<br><small>in this demo library</small></span></div>
    <div class="language-grid">${languages}</div><div class="language-study-layout"><section class="surface-card"><div class="card-heading"><div><p class="card-kicker">${e(selected.region)}</p><h2>${e(selected.name)} lessons</h2></div><span>${e(selected.icon)}</span></div><div class="language-lesson-list">${lessonCards}</div>${flashcard}</section><aside class="culture-aside"><div class="card-heading"><div><p class="card-kicker">STORIES & SONGS</p><h2>Cultural corner</h2></div><span>🎭</span></div><div class="culture-list">${stories}</div></aside></div></section>`;
}

function renderCommunity(state, data) {
  const projects = state.serviceProjects || [];
  const hours = projects.reduce((sum, project) => sum + Math.max(0, Number(project.hours) || 0), 0);
  const completed = projects.filter((project) => project.status === "completed").length;
  const badge = getServiceBadge(hours);
  const progress = getServiceProgress(hours, 40);
  const action = `<button class="button button--primary button--teal" data-action="open-modal" data-modal="service">＋ Log service</button>`;
  const projectCards = projects.map((project) => `<article class="service-project"><div class="service-project-icon">${project.status === "completed" ? "✅" : project.status === "in-progress" ? "🔄" : "📅"}</div><div class="service-project-main"><div class="service-project-heading"><h3>${e(project.title)}</h3><span class="status-tag status-tag--${e(project.status)}">${e(project.status)}</span></div><p>${e(project.description || "Community service activity")}</p><div class="service-meta"><span>⏱ ${Number(project.hours) || 0} hours</span><span>📅 ${e(project.date || "Date not set")}</span><span>🌿 ${e(project.impact || "Community")}</span></div>${project.reflection ? `<details class="reflection-note"><summary>Reflection saved</summary><p>${e(project.reflection)}</p></details>` : ""}<div class="service-actions"><button class="text-link" data-action="service-reflection" data-id="${e(project.id)}">✍️ ${project.reflection ? "Edit reflection" : "Add reflection"}</button>${project.status !== "completed" ? `<button class="text-link text-link--green" data-action="complete-project" data-id="${e(project.id)}">✓ Mark complete</button>` : "<span class='complete-label'>✓ Completed</span>"}</div></div></article>`).join("");
  const suggestions = data.service.suggested_projects.map((project) => `<article class="suggestion-card"><span class="suggestion-type">${e(project.category)}</span><h3>${e(project.title)}</h3><p>${e(project.organization)}</p><div class="suggestion-meta"><span>⏱ ${e(project.duration)}</span><span>👥 ${project.spots} spots</span></div><button class="text-link" data-action="join-service" data-id="${e(project.title)}">Add to my plan →</button></article>`).join("");
  const prompt = data.service.reflection_prompts[0];
  return `<section class="page">${pageHeader("CBC SERVICE LEARNING", "Community service", "Make a difference close to home while building citizenship and collaboration skills.", action)}
    <div class="service-metrics">${metric("Total hours", `${hours}`, "⏱️", "teal", "Logged in this browser")}${metric("Projects", String(projects.length), "📋", "blue")}${metric("Completed", String(completed), "✅", "green")}${metric("Service badge", badge, "🏅", "purple", "Next goal: 40 hours")}</div>
    <div class="service-progress-card"><div><p class="card-kicker">YOUR SERVICE JOURNEY</p><h2>${hours} / 40 hours toward your Gold badge</h2><p>${hours < 20 ? `${20 - hours} more hours to reach the Silver milestone.` : hours < 40 ? `${40 - hours} more hours to reach Gold.` : "Amazing work — you have reached the 40-hour goal!"}</p></div><div class="service-progress-ring" style="--progress:${progress}%"><span>${progress}%</span></div></div>
    <div class="service-layout"><div><div class="section-title-row"><div><p class="card-kicker">YOUR CONTRIBUTION</p><h2>My projects</h2></div><button class="text-link" data-action="open-modal" data-modal="reflection" data-prompt="${e(prompt)}">Need inspiration? <span>→</span></button></div>${projectCards ? `<div class="service-project-list">${projectCards}</div>` : emptyState("🌱", "Your first project starts here", "Log a service activity or add a suggested opportunity to your plan.", `<button class="button button--primary button--teal" data-action="open-modal" data-modal="service">＋ Log a project</button>`)}<div class="section-title-row section-title-row--spaced"><div><p class="card-kicker">GET INVOLVED</p><h2>Suggested opportunities</h2></div></div><div class="suggestion-grid">${suggestions}</div></div>
      <aside class="service-sidebar"><article class="service-badge-card"><span>🏅</span><p class="card-kicker">SERVICE BADGE</p><h2>${badge}</h2><p>${hours} / 40 hours toward Gold</p>${progressBar(progress, "teal")}</article><article class="surface-card reflection-card"><p class="card-kicker">REFLECT & GROW</p><h2>A few questions to think about</h2><ul>${data.service.reflection_prompts.slice(0, 3).map((value) => `<li>${e(value)}</li>`).join("")}</ul></article><article class="surface-card certificate-card"><span>📜</span><h3>Service certificate</h3><p>Log 20 or more service hours to unlock your certificate.</p><button class="button button--quiet button--wide" data-action="certificate" ${hours < 20 ? "disabled" : ""}>${hours >= 20 ? "Print certificate" : `${20 - hours} more hours needed`}</button></article></aside></div></section>`;
}

function renderOffline(state) {
  const selected = state.filters?.downloads || "all";
  const downloads = state.downloads || [];
  const filtered = selected === "all" ? downloads : downloads.filter((item) => item.type === selected);
  const downloadedCount = downloads.filter((item) => item.downloaded).length;
  const totalSize = totalDownloadedMb(downloads);
  const filters = DOWNLOAD_TYPES.map((type) => `<button class="filter-pill ${selected === type ? "is-active" : ""}" data-action="filter" data-filter-key="downloads" data-filter-value="${type}">${type === "all" ? "All content" : `${iconForType(type)} ${type}`}</button>`).join("");
  const cards = filtered.map((item) => `<article class="download-card"><span class="download-icon download-icon--${e(item.type)}">${iconForType(item.type)}</span><div class="download-copy"><span>${e(item.type)} · Grade ${item.grade}</span><h3>${e(item.title)}</h3><small>${e(item.subject)} · ${item.size_mb} MB</small></div><button class="button ${item.downloaded ? "button--downloaded" : "button--quiet"}" data-action="toggle-download" data-id="${e(item.id)}">${item.downloaded ? "✓ Saved · Remove" : "↓ Save for offline"}</button></article>`).join("");
  return `<section class="page">${pageHeader("STUDY ANYWHERE", "Offline content", "Keep useful curriculum notes and worksheets ready when your connection is limited.")}
    <div class="offline-hero ${state.isOffline ? "offline-hero--active" : ""}"><div><p class="card-kicker">${state.isOffline ? "YOU'RE IN OFFLINE MODE" : "YOUR STUDY KIT"}</p><h2>${state.isOffline ? "Your saved learning is close at hand." : "Build a small library for later."}</h2><p>${state.isOffline ? "Online-only features may be unavailable until you reconnect." : "Choose the materials you want to keep on this device."}</p></div><button class="button ${state.isOffline ? "button--white" : "button--dark"}" data-action="toggle-offline">${state.isOffline ? "🌐 Go online" : "📴 Try offline mode"}</button></div>
    <div class="metric-grid metric-grid--compact">${metric("Saved items", String(downloadedCount), "📥", "blue")}${metric("Estimated size", `${totalSize} MB`, "💾", "purple", "Browser demo estimate")}${metric("Available items", String(downloads.length - downloadedCount), "📚", "green")}${metric("Connection", state.isOffline ? "Offline" : "Online", state.isOffline ? "📴" : "🌐", state.isOffline ? "orange" : "teal")}</div>
    <div class="section-title-row"><div><p class="card-kicker">YOUR MATERIALS</p><h2>Learning library</h2></div><span class="soft-count">${downloads.length} items</span></div><div class="filter-row">${filters}</div><div class="download-list">${cards}</div><p class="privacy-note privacy-note--light">This demo toggles saved status only — it does not download copyrighted curriculum files.</p></section>`;
}

function renderVoiceNotes(state, data) {
  const recordings = state.voiceNotes || [];
  const isRecording = state.isRecording;
  const count = recordings.length;
  const cards = recordings.map((recording) => `<button class="recording-card" data-action="recording-detail" data-id="${e(recording.id)}"><span>🎙️</span><div><strong>${e(recording.title)}</strong><small>${e(recording.subject || "General")} · ${e(recording.date || "Saved")}</small><p>${e(recording.transcript).slice(0, 105)}${String(recording.transcript).length > 105 ? "…" : ""}</p></div><i>${e(recording.duration || "—")}</i></button>`).join("");
  return `<section class="page">${pageHeader("CAPTURE YOUR IDEAS", "Voice to text", "Practice speaking your thoughts, edit the transcript, and save a learning note.")}
    <div class="voice-layout"><section class="surface-card recorder-card"><div class="recorder-status ${isRecording ? "is-recording" : ""}"><span class="mic-orb">${isRecording ? "🔴" : "🎤"}</span><div><p class="card-kicker">${isRecording ? "RECORDING IN PROGRESS" : "YOUR RECORDING SPACE"}</p><h2>${isRecording ? "Speak clearly and take your time." : "Turn your voice into a note."}</h2><p>${isRecording ? "Use the live transcript below. Stop when you're ready to save." : "Allow microphone access for speech recognition, or try the local demo transcript."}</p></div><span class="recording-time">${e(state.recordingTimeLabel || "0:00")}</span></div><div class="transcript-box"><label for="live-transcript">Live transcription / note</label><textarea id="live-transcript" name="transcript" rows="7" placeholder="Your words will appear here. You can also type a note directly…">${e(state.liveTranscript || "")}</textarea><div class="transcript-footer"><span class="word-count">${(state.liveTranscript || "").trim() ? (state.liveTranscript || "").trim().split(/\s+/).length : 0} words</span><span>🔒 Stays in this browser</span></div></div><div class="recorder-actions"><button class="button ${isRecording ? "button--danger" : "button--primary"}" data-action="${isRecording ? "stop-recording" : "start-recording"}">${isRecording ? "⏹ Stop recording" : "🎙 Start recording"}</button><button class="button button--quiet" data-action="save-voice-note">Save note</button><button class="text-link" data-action="clear-transcript">Clear</button></div><p class="privacy-note privacy-note--light">${isRecording ? "Speech recognition support depends on your browser. If unavailable, a short local sample transcript appears." : "No audio is uploaded or retained by this static demo."}</p></section>
      <aside class="voice-aside"><div class="card-heading"><div><p class="card-kicker">YOUR NOTES</p><h2>Saved recordings</h2></div><span class="soft-count">${count}</span></div>${cards ? `<div class="recording-list">${cards}</div>` : emptyState("🎤", "No saved notes yet", "Start a recording or type a short note to see it here.")}<div class="voice-tips"><h3>💡 A few helpful tips</h3><ul><li>Speak clearly at a comfortable pace.</li><li>Find a quiet place to record.</li><li>Pause between your ideas.</li></ul></div></aside></div></section>`;
}

function renderParent(state, data) {
  const tab = state.parentTab || "overview";
  const parentData = data.dashboard.parent;
  const tabs = [["overview", "📊 Overview"], ["progress", "📈 Academic progress"], ["reports", "📋 Reports"], ["messages", "💬 Messages"]].map(([id, label]) => `<button class="parent-tab ${tab === id ? "is-active" : ""}" data-action="parent-tab" data-tab="${id}">${label}</button>`).join("");
  const attendance = parentData.attendance.map((day) => `<div class="attendance-day"><span class="attendance-mark ${day.present ? "is-present" : "is-absent"}">${day.present ? "✓" : "–"}</span><small>${e(day.day)}</small></div>`).join("");
  let body = "";
  if (tab === "overview") {
    body = `<div class="parent-overview-grid"><article class="surface-card parent-student-card"><span class="parent-avatar">${e(firstName(state.profile.name).charAt(0).toUpperCase())}</span><p class="card-kicker">LEARNER PROFILE</p><h2>${e(state.profile.name)}</h2><p>Grade ${state.profile.grade} · ${e(state.profile.school)}</p><div class="parent-mini-stats"><span><b>${state.profile.level || 1}</b>Level</span><span><b>${state.profile.streak || 1}</b>Day streak</span><span><b>${state.profile.points || 0}</b>Points</span></div></article><article class="surface-card attendance-card"><div class="card-heading"><div><p class="card-kicker">THIS WEEK</p><h2>Attendance snapshot</h2></div><span>📅</span></div><div class="attendance-row">${attendance}</div><p class="attendance-summary">${Math.round(parentData.attendance.filter((day) => day.present).length / parentData.attendance.length * 100)}% demo attendance rate</p><small class="muted-small">Illustrative sample data; not connected to a school record.</small></article><article class="surface-card parent-activities"><div class="card-heading"><div><p class="card-kicker">A FEW RECENT WINS</p><h2>Recent activities</h2></div><span>🕐</span></div>${parentData.activities.map((activity) => `<div class="activity-row"><span>${e(activity.icon)}</span><div><strong>${e(activity.action)}</strong><small>${e(activity.time)}</small></div><b>${e(activity.score || "")}</b></div>`).join("")}</article><article class="surface-card"><div class="card-heading"><div><p class="card-kicker">LEARNING BY DOING</p><h2>Community service</h2></div><span>🤝</span></div><p class="parent-note">${(state.serviceProjects || []).reduce((total, project) => total + Number(project.hours || 0), 0)} hours logged in this browser.</p><button class="text-link" data-view="community">Explore service learning →</button></article></div>`;
  } else if (tab === "progress") {
    body = `<div class="parent-progress-grid"><article class="surface-card"><div class="card-heading"><div><p class="card-kicker">SUBJECT SNAPSHOT</p><h2>Learning progress</h2></div><span>📚</span></div>${parentData.subject_performance.map((item) => `<div class="subject-performance"><div><strong>${e(item.subject)}</strong><span>${e(item.grade)} · ${item.score}%</span></div>${progressBar(item.score, "blue")}</div>`).join("")}</article><article class="surface-card"><div class="card-heading"><div><p class="card-kicker">CBC CORE SKILLS</p><h2>Competency progress</h2></div><span>🎯</span></div>${(state.competencies || []).map((item) => `<div class="subject-performance"><div><strong>${e(item.short_name)}</strong><span>${safePercent(item.score)}%</span></div>${progressBar(item.score, getCompetencyLevel(item.score))}</div>`).join("")}</article></div><p class="privacy-note privacy-note--light">Subject scores are illustrative demo data, not official school grades.</p>`;
  } else if (tab === "reports") {
    body = `<div class="report-grid"><article class="report-card"><span>📈</span><h2>Term progress summary</h2><p>Review quiz practice, portfolio evidence, and competency reflections from this browser.</p><button class="button button--quiet" data-action="export-data">Export demo report</button></article><article class="report-card"><span>🌱</span><h2>Service learning record</h2><p>See logged activities and total hours contributed to your community.</p><button class="button button--quiet" data-view="community">Open service record</button></article><article class="report-card"><span>📁</span><h2>Learning portfolio</h2><p>Browse the work and reflections saved to your local demo profile.</p><button class="button button--quiet" data-view="portfolio">Open portfolio</button></article></div>`;
  } else {
    body = `<div class="message-list">${parentData.messages.map((message, index) => `<article class="message-card ${message.unread ? "is-unread" : ""}"><span class="message-avatar">${message.unread ? "✉️" : "💬"}</span><div><p class="card-kicker">${e(message.from)} · ${e(message.time)}</p><h2>${e(message.subject)}</h2><p>${e(message.preview)}</p></div><button class="text-link" data-action="message-detail" data-index="${index}">Read note →</button></article>`).join("")}</div><p class="privacy-note privacy-note--light">These are illustrative sample messages, not messages from your school.</p>`;
  }
  return `<section class="page">${pageHeader("FAMILY & SCHOOL PARTNERSHIP", "Parent / teacher portal", `A simple overview of ${e(firstName(state.profile.name))}'s demo learning journey.`)}<div class="parent-banner"><span>👨‍👩‍👧</span><div><p class="card-kicker">GUARDIAN VIEW</p><h2>Celebrate progress, one step at a time.</h2><p>Sample information is shown for preview only; this page isn't connected to school records.</p></div><button class="button button--white" data-view="dashboard">← Student view</button></div><div class="parent-tabs">${tabs}</div>${body}</section>`;
}

function renderSettings(state) {
  const prefs = state.settings || { notifications: true, language: "English" };
  return `<section class="page">${pageHeader("MAKE THIS SPACE YOURS", "Settings", "Manage this demo profile and the preferences saved on this device.")}
    <div class="settings-layout"><div class="settings-main"><article class="surface-card settings-card"><div class="card-heading"><div><p class="card-kicker">YOUR PROFILE</p><h2>Personal information</h2></div><span>👤</span></div><div class="settings-profile"><span class="profile-avatar profile-avatar--large">${e(firstName(state.profile.name).charAt(0).toUpperCase())}</span><div><strong>${e(state.profile.name)}</strong><small>Grade ${state.profile.grade} · ${e(getEducationLevel(state.profile.grade))}</small><small>${e(state.profile.school)}</small></div><button type="button" class="text-link" data-action="change-grade">Change grade →</button></div><form class="profile-edit-form" data-form="profile"><label for="profile-name">Full name</label><input id="profile-name" name="name" type="text" maxlength="80" required value="${e(state.profile.name)}"><label for="profile-school">School name</label><input id="profile-school" name="school" type="text" maxlength="100" required value="${e(state.profile.school)}"><p class="muted-small">Profile changes are stored only in this browser.</p><button class="button button--primary" type="submit">Save profile changes</button></form></article>
      <article class="surface-card settings-card"><div class="card-heading"><div><p class="card-kicker">YOUR PREFERENCES</p><h2>Learning preferences</h2></div><span>🎨</span></div><label class="setting-toggle"><span><strong>Learning reminders</strong><small>Show gentle reminders in this browser.</small></span><input type="checkbox" data-action="toggle-notifications" ${prefs.notifications ? "checked" : ""}><i></i></label><label class="setting-select"><span><strong>Language</strong><small>Interface language for this demo.</small></span><select data-action="setting-language"><option ${prefs.language === "English" ? "selected" : ""}>English</option><option ${prefs.language === "Kiswahili" ? "selected" : ""}>Kiswahili</option></select></label><label class="setting-toggle"><span><strong>Offline mode</strong><small>Preview the app with limited-connectivity status.</small></span><input type="checkbox" data-action="setting-offline" ${state.isOffline ? "checked" : ""}><i></i></label></article>
      <article class="surface-card settings-card"><div class="card-heading"><div><p class="card-kicker">DEMO DATA</p><h2>Your privacy matters</h2></div><span>🔒</span></div><p class="settings-copy">Profile details, quiz progress, notes, and preferences stay in your browser's local storage. This static demo sends no learning data to a server.</p><div class="settings-actions"><button class="button button--quiet" data-action="export-data">Download my demo data</button><button class="button button--danger" data-action="reset-data">Clear local demo data</button></div></article></div>
      <aside class="settings-aside"><div class="safe-ai-card"><span>🤖</span><p class="card-kicker">ELIMU TUTOR</p><h2>Safe, local demo mode</h2><p>The tutor uses built-in example responses. No API key is embedded in this static site.</p><button class="button button--white" data-action="open-ai">Open demo tutor →</button></div><div class="privacy-callout"><span>🛡️</span><div><strong>Keep personal information private</strong><p>Use demo details only. Avoid adding passwords or sensitive student records.</p></div></div><div class="version-note"><span>Build mode</span><strong>Independent static preview</strong><small>Python + Jinja2 · No backend</small></div></aside></div></section>`;
}

function renderSearch(state, data) {
  const query = String(state.searchQuery || "").trim();
  const needle = query.toLocaleLowerCase();
  const results = [
    ...data.lessons.filter((item) => `${item.title} ${item.subject} ${item.description}`.toLocaleLowerCase().includes(needle)).map((item) => ({ type: "lesson", icon: item.icon, title: item.title, summary: `${item.subject} · Grade ${item.grade}`, action: "open-lesson", id: item.id })),
    ...data.quizzes.filter((item) => `${item.title} ${item.subject}`.toLocaleLowerCase().includes(needle)).map((item) => ({ type: "quiz", icon: item.icon, title: item.title, summary: `${item.subject} · ${item.questions.length} practice questions`, action: "quiz-start", id: item.id })),
    ...data.labs.filter((item) => `${item.title} ${item.subject} ${item.description}`.toLocaleLowerCase().includes(needle)).map((item) => ({ type: "lab", icon: item.icon, title: item.title, summary: `${item.subject} · ${item.difficulty}`, action: "open-lab", id: item.id })),
  ];
  return `<section class="page">${pageHeader("FIND YOUR NEXT STEP", "Search learning content", query ? `Results for “${query}”` : "Search lesson titles, quizzes, and virtual labs.")}${query ? `<div class="search-results">${results.length ? results.map((item) => `<button class="search-result" data-action="${item.action}" data-id="${e(item.id)}"><span>${e(item.icon)}</span><div><strong>${e(item.title)}</strong><small>${e(item.summary)}</small></div><b>Open →</b></button>`).join("") : emptyState("🔎", "No matching content", "Try a subject such as Mathematics, Biology, or Kiswahili.")}</div>` : emptyState("🔎", "What would you like to learn?", "Use the search field above to explore the lesson, quiz, and lab catalogs.")}</section>`;
}

function renderPage(state, data) {
  switch (state.currentView) {
    case "dashboard": return renderDashboard(state, data);
    case "competencies": return renderCompetencies(state);
    case "quizzes": return renderQuizzes(state, data);
    case "lessons": return renderLessons(state, data);
    case "labs": return renderLabs(state, data);
    case "languages": return renderLanguages(state, data);
    case "community": return renderCommunity(state, data);
    case "portfolio": return renderPortfolio(state);
    case "offline": return renderOffline(state);
    case "voice-notes": return renderVoiceNotes(state, data);
    case "parent": return renderParent(state, data);
    case "settings": return renderSettings(state);
    case "search": return renderSearch(state, data);
    default: return renderDashboard(state, data);
  }
}

function renderModal(state, data) {
  const modal = state.modal;
  if (!modal) return "";
  if (modal.type === "lesson") {
    const lesson = data.lessons.find((item) => item.id === modal.id);
    if (!lesson) return "";
    const completed = (state.completedLessons || []).includes(lesson.id);
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><span class="modal-art">${e(lesson.icon)}</span><p class="page-kicker">${e(lesson.subject)} · GRADE ${lesson.grade} · KICD-ALIGNED</p><h2 id="modal-title">${e(lesson.title)}</h2><p>${e(lesson.description)}</p><div class="lesson-preview-note"><span>📖</span><div><strong>Lesson preview</strong><small>This static build keeps the original catalog and learning goals, without bundling the old shared sample video.</small></div></div><h3>Learning objectives</h3><ul class="modal-list">${lesson.objectives.map((objective) => `<li>${e(objective)}</li>`).join("")}</ul><button class="button button--primary button--wide" data-action="complete-lesson" data-id="${e(lesson.id)}">${completed ? "✓ Marked complete" : "Mark lesson complete"}</button></section></div>`;
  }
  if (modal.type === "lab") {
    const lab = data.labs.find((item) => item.id === modal.id);
    if (!lab) return "";
    const started = Boolean(modal.started);
    const zoom = Number(modal.zoom || 1);
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal-card modal-card--wide" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><span class="modal-art">${e(lab.icon)}</span><p class="page-kicker">${e(lab.subject)} · ${e(lab.difficulty)} · ${e(lab.duration)}</p><h2 id="modal-title">${e(lab.title)}</h2><p>${e(lab.description)}</p><h3>Learning objectives</h3><ul class="modal-list">${lab.objectives.map((objective) => `<li>${e(objective)}</li>`).join("")}</ul>${started ? `<div class="experiment-surface"><div class="experiment-orbit" style="--zoom:${Math.min(3, zoom)}"><span>${e(lab.icon)}</span></div><div><p class="card-kicker">INTERACTIVE DEMO</p><h3>${lab.id === "virtual-microscope" ? "Adjust your magnification" : "Change a variable and observe"}</h3><p>${lab.id === "virtual-microscope" ? "Use the slider to zoom in on the sample." : "This simple sandbox illustrates how changing one input can affect an observation."}</p><label class="range-row">${lab.id === "virtual-microscope" ? "Magnification" : "Experiment setting"}<input type="range" min="1" max="10" value="${zoom}" data-action="lab-zoom"><strong id="lab-zoom-value">${zoom}${lab.id === "virtual-microscope" ? "×" : " units"}</strong></label></div></div><p class="privacy-note privacy-note--light">Simulation is illustrative; follow your teacher's instructions for real experiments.</p>` : ""}<div class="button-row"><button class="button button--quiet" data-action="close-modal">Close</button><button class="button button--primary" data-action="start-lab">${started ? "Restart experiment" : "Start safe simulation"} →</button></div></section></div>`;
  }
  if (modal.type === "portfolio") {
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><p class="page-kicker">SAVE A LEARNING MOMENT</p><h2 id="modal-title">Add portfolio evidence</h2><p>Save a title and reflection. Files are not uploaded by this demo.</p><form data-form="portfolio"><label for="evidence-title">Evidence title</label><input id="evidence-title" name="title" maxlength="100" required placeholder="e.g., Plant growth observation"><label for="evidence-subject">Subject</label><select id="evidence-subject" name="subject">${PORTFOLIO_SUBJECTS.slice(1).map((subject) => `<option>${e(subject)}</option>`).join("")}</select><label for="evidence-kind">Type</label><select id="evidence-kind" name="type"><option value="document">Document / reflection</option><option value="image">Image</option><option value="video">Video</option><option value="pdf">PDF</option></select><fieldset class="competency-checkboxes"><legend>Link to competencies</legend>${(state.competencies || []).map((item) => `<label><input type="checkbox" name="competencies" value="${e(item.short_name)}"><span>${e(item.icon)} ${e(item.short_name)}</span></label>`).join("")}</fieldset><label for="evidence-reflection">Short reflection (optional)</label><textarea id="evidence-reflection" name="reflection" rows="3" maxlength="600" placeholder="What did you learn?"></textarea><div class="button-row"><button class="button button--quiet" type="button" data-action="close-modal">Cancel</button><button class="button button--primary" type="submit">Save item</button></div></form></section></div>`;
  }
  if (modal.type === "service") {
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><p class="page-kicker">LOG A COMMUNITY CONTRIBUTION</p><h2 id="modal-title">Add a service project</h2><form data-form="service"><label for="service-title">Project title</label><input id="service-title" name="title" maxlength="100" required placeholder="e.g., Community garden clean-up"><label for="service-description">What did you do?</label><textarea id="service-description" name="description" rows="3" maxlength="500" placeholder="Describe the activity"></textarea><div class="form-grid"><div><label for="service-hours">Hours</label><input id="service-hours" name="hours" type="number" min="0.25" max="24" step="0.25" required placeholder="2"></div><div><label for="service-date">Date</label><input id="service-date" name="date" type="date" value="${new Date().toISOString().slice(0, 10)}"></div></div><label for="service-impact">Impact area</label><select id="service-impact" name="impact"><option>Environment</option><option>Education</option><option>Health</option><option>Elder Care</option><option>Other</option></select><div class="button-row"><button class="button button--quiet" type="button" data-action="close-modal">Cancel</button><button class="button button--primary button--teal" type="submit">Save project</button></div></form></section></div>`;
  }
  if (modal.type === "reflection") {
    const project = (state.serviceProjects || []).find((item) => item.id === modal.id);
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><p class="page-kicker">REFLECT ON YOUR IMPACT</p><h2 id="modal-title">A moment to think</h2><p>${e(modal.prompt || data.service.reflection_prompts[0])}</p><form data-form="reflection"><input type="hidden" name="id" value="${e(project?.id || "")}"><textarea name="reflection" rows="5" maxlength="1000" placeholder="Write a few thoughts…">${e(project?.reflection || "")}</textarea><div class="button-row"><button class="button button--quiet" type="button" data-action="close-modal">Cancel</button><button class="button button--primary button--teal" type="submit">Save reflection</button></div></form></section></div>`;
  }
  if (modal.type === "recording") {
    const recording = (state.voiceNotes || []).find((item) => item.id === modal.id);
    if (!recording) return "";
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><span class="modal-art">🎙️</span><p class="page-kicker">${e(recording.subject || "General")} · ${e(recording.duration || "")}</p><h2 id="modal-title">${e(recording.title)}</h2><p class="recording-transcript">${e(recording.transcript)}</p><button class="button button--quiet button--wide" data-action="close-modal">Close note</button></section></div>`;
  }
  if (modal.type === "message") {
    const message = data.dashboard.parent.messages[Number(modal.index)];
    if (!message) return "";
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><p class="page-kicker">${e(message.from)} · ${e(message.time)}</p><h2 id="modal-title">${e(message.subject)}</h2><p>${e(message.preview)} This sample note is for preview only; it is not a real school message.</p><button class="button button--quiet button--wide" data-action="close-modal">Close</button></section></div>`;
  }
  if (modal.type === "portfolio-detail") {
    const item = (state.portfolio || []).find((entry) => entry.id === modal.id);
    if (!item) return "";
    return `<div class="modal-backdrop" data-action="close-modal"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button class="modal-close" data-action="close-modal" aria-label="Close">×</button><span class="modal-art">${iconForFile(item.type)}</span><p class="page-kicker">${e(item.subject)} · ${e(item.uploadDate || "")}</p><h2 id="modal-title">${e(item.title)}</h2><p>${e(item.reflection || "Saved locally in this demo profile.")}</p><p class="privacy-note privacy-note--light">${e(item.fileName || item.size || "No file uploaded")}</p><button class="button button--danger button--wide" data-action="delete-portfolio" data-id="${e(item.id)}">Remove item</button></section></div>`;
  }
  return "";
}

function renderAiTutor(state) {
  const messages = state.aiMessages || [];
  const suggestions = ["Explain photosynthesis simply", "Help me with algebra", "What are CBC competencies?", "Kenya's independence story"];
  return `<div class="ai-backdrop" data-action="close-ai"></div><aside class="ai-panel" role="dialog" aria-label="Elimu demo tutor"><header class="ai-panel-header"><span>🤖</span><div><strong>Elimu Tutor</strong><small>Local demo mode · Grade ${state.profile.grade}</small></div><button data-action="close-ai" aria-label="Close tutor">×</button></header><div class="ai-panel-note">No API key or external AI service is used in this static preview.</div><div class="ai-messages" id="ai-messages">${messages.map((message) => `<div class="ai-message ai-message--${e(message.role)}"><span>${message.role === "assistant" ? "🤖" : "🙂"}</span><p>${e(message.content).replaceAll("\n", "<br>")}</p></div>`).join("")}</div><div class="ai-suggestions">${suggestions.map((question) => `<button data-action="ai-suggest" data-question="${e(question)}">${e(question)}</button>`).join("")}</div><form class="ai-compose" data-form="ai-message"><label class="visually-hidden" for="ai-input">Ask Elimu</label><input id="ai-input" name="message" maxlength="500" autocomplete="off" placeholder="Ask a learning question…" required><button type="submit" aria-label="Send message">➤</button></form></aside>`;
}

export function renderWorkspace(state, data, config) {
  const profile = state.profile;
  const view = ["parent", "search"].includes(state.currentView) || NAV_ITEMS.some((item) => item.id === state.currentView) ? state.currentView : "dashboard";
  const current = NAV_ITEMS.find((item) => item.id === view)
    || (view === "search" ? { label: "Search learning content", icon: "🔎" } : { label: "Parent / teacher portal", icon: "👨‍👩‍👧" });
  const navGroups = [...new Set(NAV_ITEMS.map((item) => item.group))];
  const sidebar = navGroups.map((group) => `<div class="nav-group"><p>${group}</p>${NAV_ITEMS.filter((item) => item.group === group).map((item) => `<button class="nav-item ${view === item.id ? "is-active" : ""}" data-view="${item.id}" ${view === item.id ? 'aria-current="page"' : ""}><span>${item.icon}</span><span>${e(item.label)}</span>${view === item.id ? "<i></i>" : ""}</button>`).join("")}</div>`).join("");
  return `<div class="workspace-layout">
    <aside class="workspace-sidebar ${state.menuOpen ? "is-open" : ""}"><div class="sidebar-brand"><span class="brand-mark">📚</span><span><strong>${e(config.name)}</strong><small>CBC learning companion</small></span><button class="sidebar-close" data-action="toggle-menu" aria-label="Close menu">×</button></div><button class="grade-switcher" data-action="change-grade"><span>Currently learning</span><strong>Grade ${profile.grade} · ${e(getEducationLevel(profile.grade))}</strong><i>↻</i></button><div class="sidebar-profile"><span class="profile-avatar">${e(firstName(profile.name).charAt(0).toUpperCase())}</span><span><strong>${e(profile.name)}</strong><small>Level ${profile.level || 1} · ${Number(profile.points || 0).toLocaleString()} pts</small></span><b>🔥 ${profile.streak || 1}</b></div><nav class="sidebar-nav" aria-label="Learning tools">${sidebar}<div class="nav-group nav-group--family"><p>FAMILY</p><button class="nav-item ${view === "parent" ? "is-active" : ""}" data-view="parent"><span>👨‍👩‍👧</span><span>Parent / teacher portal</span>${view === "parent" ? "<i></i>" : ""}</button></div></nav><div class="sidebar-bottom"><button class="offline-switch ${state.isOffline ? "is-on" : ""}" data-action="toggle-offline"><span>${state.isOffline ? "📴" : "🌐"}</span><span>${state.isOffline ? "Offline mode" : "Online mode"}</span><i></i></button><button class="sidebar-change" data-action="change-grade">🏫 Change grade / level</button></div></aside>
    <div class="workspace-main"><header class="workspace-topbar"><button class="menu-toggle" data-action="toggle-menu" aria-label="Open navigation">☰</button><div class="history-controls" aria-label="Page navigation"><button type="button" data-action="history-back" aria-label="Go back" title="Go back" ${state.canGoBack ? "" : "disabled"}>←</button><button type="button" data-action="history-forward" aria-label="Go forward" title="Go forward" ${state.canGoForward ? "" : "disabled"}>→</button></div><div class="breadcrumb"><span>Elimu Plus</span><i>/</i><strong>${e(current.icon)} ${e(current.label)}</strong></div><div class="topbar-tools"><span class="topbar-date">${e(dateLabel())}</span>${state.isOffline ? `<span class="offline-badge">📴 Offline</span>` : ""}<form class="search-form" data-form="search"><label class="visually-hidden" for="global-search">Search lessons and quizzes</label><input id="global-search" name="query" type="search" value="${e(state.searchQuery || "")}" placeholder="Search learning…"><button type="submit" aria-label="Search">⌕</button></form><button class="icon-button notification-button" data-action="notifications" aria-label="Notifications">🔔<i></i></button><span class="topbar-avatar" title="${e(profile.name)}">${e(firstName(profile.name).charAt(0).toUpperCase())}</span></div></header><main class="workspace-content"><div class="page-container">${renderPage({ ...state, currentView: view }, data)}</div><footer class="workspace-footer"><span>🇰🇪</span><span>Aligned with Kenya Institute of Curriculum Development (KICD)</span><i>·</i><span>Elimu Plus demo</span></footer></main></div>
  </div>${state.aiOpen ? renderAiTutor(state) : view !== "parent" ? `<button class="ai-fab" data-action="open-ai" title="Ask Elimu Tutor" aria-label="Open Elimu Tutor">🤖</button>` : ""}<div id="modal-root">${renderModal(state, data)}</div><div class="toast" id="toast" role="status" aria-live="polite"></div>`;
}
