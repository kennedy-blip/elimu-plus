const COMPETENCY_LEVELS = [
  { min: 85, label: "exceeding" },
  { min: 65, label: "meeting" },
  { min: 45, label: "approaching" },
  { min: 0, label: "below" },
];

export function getEducationLevel(grade) {
  const value = Number(grade);
  if (!Number.isInteger(value) || value < 4 || value > 12) return "";
  if (value <= 6) return "Upper Primary";
  if (value <= 9) return "Junior Secondary";
  return "Senior School";
}

export function getCompetencyLevel(score) {
  const value = Math.max(0, Math.min(100, Number(score) || 0));
  return COMPETENCY_LEVELS.find((level) => value >= level.min)?.label ?? "below";
}

export function calculateQuizResult(answers, questions, maximumPoints = 0) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { correct: 0, total: 0, percent: 0, points: 0 };
  }
  const correct = questions.reduce(
    (count, question, index) => count + (answers?.[index] === question.correct ? 1 : 0),
    0,
  );
  return {
    correct,
    total: questions.length,
    percent: Math.round((correct / questions.length) * 100),
    points: Math.round((Math.max(0, Number(maximumPoints) || 0) * correct) / questions.length),
  };
}

export function getServiceBadge(hours) {
  const value = Math.max(0, Number(hours) || 0);
  if (value >= 40) return "Gold";
  if (value >= 20) return "Silver";
  if (value >= 10) return "Bronze";
  return "Getting started";
}

export function getServiceProgress(hours, goal = 40) {
  const target = Math.max(1, Number(goal) || 40);
  return Math.round((Math.min(target, Math.max(0, Number(hours) || 0)) / target) * 100);
}

export function totalDownloadedMb(items) {
  return (items || []).reduce((total, item) => {
    const size = Number(item.size_mb);
    return total + (item.downloaded && Number.isFinite(size) && size > 0 ? size : 0);
  }, 0);
}

export function filterBy(items, field, value) {
  if (!Array.isArray(items)) return [];
  if (!value || value === "all") return items;
  const normalized = String(value).trim().toLocaleLowerCase();
  return items.filter((item) => String(item?.[field] ?? "").trim().toLocaleLowerCase() === normalized);
}

export function averageScore(items) {
  const values = (items || []).map((item) => Number(item.score)).filter(Number.isFinite);
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

export function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
