import test from "node:test";
import assert from "node:assert/strict";
import {
  averageScore,
  calculateQuizResult,
  escapeHtml,
  filterBy,
  formatTime,
  getCompetencyLevel,
  getEducationLevel,
  getServiceBadge,
  getServiceProgress,
  totalDownloadedMb,
} from "../static/js/logic.mjs";

test("grade bands cover the CBC grade ranges", () => {
  assert.equal(getEducationLevel(4), "Upper Primary");
  assert.equal(getEducationLevel(6), "Upper Primary");
  assert.equal(getEducationLevel(7), "Junior Secondary");
  assert.equal(getEducationLevel(9), "Junior Secondary");
  assert.equal(getEducationLevel(10), "Senior School");
  assert.equal(getEducationLevel(12), "Senior School");
  assert.equal(getEducationLevel(3), "");
  assert.equal(getEducationLevel(13), "");
});

test("competency thresholds match the original CBC scale", () => {
  assert.equal(getCompetencyLevel(85), "exceeding");
  assert.equal(getCompetencyLevel(84), "meeting");
  assert.equal(getCompetencyLevel(65), "meeting");
  assert.equal(getCompetencyLevel(64), "approaching");
  assert.equal(getCompetencyLevel(45), "approaching");
  assert.equal(getCompetencyLevel(44), "below");
  assert.equal(getCompetencyLevel(120), "exceeding");
  assert.equal(getCompetencyLevel(-3), "below");
});

test("quiz score and earned points use the number of correct answers", () => {
  const questions = [{ correct: 1 }, { correct: 0 }, { correct: 2 }];
  assert.deepEqual(calculateQuizResult([1, 0, 2], questions, 120), {
    correct: 3, total: 3, percent: 100, points: 120,
  });
  assert.deepEqual(calculateQuizResult([1, 1, 2], questions, 120), {
    correct: 2, total: 3, percent: 67, points: 80,
  });
  assert.deepEqual(calculateQuizResult([], [], 120), {
    correct: 0, total: 0, percent: 0, points: 0,
  });
});

test("community-service badge and progress are bounded by the 40-hour goal", () => {
  assert.equal(getServiceBadge(0), "Getting started");
  assert.equal(getServiceBadge(10), "Bronze");
  assert.equal(getServiceBadge(20), "Silver");
  assert.equal(getServiceBadge(40), "Gold");
  assert.equal(getServiceProgress(12), 30);
  assert.equal(getServiceProgress(55), 100);
  assert.equal(getServiceProgress(-2), 0);
});

test("offline storage totals only downloaded, valid item sizes", () => {
  assert.equal(totalDownloadedMb([
    { size_mb: 15, downloaded: true },
    { size_mb: 8, downloaded: false },
    { size_mb: 3, downloaded: true },
    { size_mb: "bad", downloaded: true },
  ]), 18);
});

test("catalog filters and averages are stable for empty inputs", () => {
  const items = [{ subject: "Science", score: 80 }, { subject: "Mathematics", score: 90 }];
  assert.deepEqual(filterBy(items, "subject", "science"), [items[0]]);
  assert.equal(filterBy(items, "subject", "all").length, 2);
  assert.equal(averageScore(items), 85);
  assert.equal(averageScore([]), 0);
});

test("formatting and escaping handle ordinary and hostile values", () => {
  assert.equal(formatTime(125), "2:05");
  assert.equal(escapeHtml(`<img src=x onerror="bad()">`), "&lt;img src=x onerror=&quot;bad()&quot;&gt;");
});
