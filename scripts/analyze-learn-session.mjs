/**
 * Analyze exported learn-store-v2 JSON from browser localStorage.
 *
 * Export (DevTools console on /learn/):
 *   copy(localStorage.getItem('learn-store-v2'))
 * Paste into learn-session-export.json, then:
 *   npm run analyze-session
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const EXPORT_PATH = resolve('learn-session-export.json');

function masteryPercent(correct, attempts) {
  if (attempts === 0) return 0;
  return Math.round((correct / attempts) * 100);
}

function loadStore() {
  const raw = readFileSync(EXPORT_PATH, 'utf8');
  return JSON.parse(raw);
}

function analyze(store) {
  const results = store.activityResults ?? [];
  const skills = Object.values(store.skills ?? {});
  const sessions = store.sessions ?? { sessionsCompleted: 0, bySubject: {} };

  const bySubject = {};
  const byActivity = {};
  const bySkill = {};
  let wrongCount = 0;

  for (const result of results) {
    bySubject[result.subjectId] = (bySubject[result.subjectId] ?? 0) + 1;
    byActivity[result.activityId] = byActivity[result.activityId] ?? {
      correct: 0,
      attempts: 0,
      subjectId: result.subjectId,
      skill: result.skill,
    };
    byActivity[result.activityId].attempts += 1;
    if (result.correct) byActivity[result.activityId].correct += 1;
    else wrongCount += 1;

    const skillKey = `${result.subjectId}:${result.skill}`;
    bySkill[skillKey] = bySkill[skillKey] ?? { correct: 0, attempts: 0, skill: result.skill, subjectId: result.subjectId };
    bySkill[skillKey].correct += result.correct ? 1 : 0;
    bySkill[skillKey].attempts += 1;
  }

  const strugglingSkills = skills
    .filter((s) => s.attempts >= 2 && masteryPercent(s.correct, s.attempts) < 60)
    .sort((a, b) => masteryPercent(a.correct, a.attempts) - masteryPercent(b.correct, b.attempts));

  const hardActivities = Object.entries(byActivity)
    .filter(([, v]) => v.attempts >= 2 && masteryPercent(v.correct, v.attempts) < 60)
    .sort((a, b) => masteryPercent(a[1].correct, a[1].attempts) - masteryPercent(b[1].correct, b[1].attempts));

  const favoriteSubjects = Object.entries(sessions.bySubject ?? {})
    .sort((a, b) => b[1] - a[1]);

  const dates = [...new Set(results.map((r) => r.completedAt.slice(0, 10)))].sort();

  return {
    profile: store.profile,
    summary: {
      learnerName: store.profile?.name ?? 'Learner',
      sessionsCompleted: sessions.sessionsCompleted,
      totalActivityAttempts: results.length,
      correctRate: results.length ? Math.round(((results.length - wrongCount) / results.length) * 100) : 0,
      points: store.rewards?.points ?? 0,
      stars: store.rewards?.totalStars ?? 0,
      streak: store.rewards?.dailyStreak ?? 0,
      activeDays: dates.length,
      dateRange: dates.length ? `${dates[0]} → ${dates.at(-1)}` : '—',
      language: store.settings?.language ?? 'en',
    },
    favoriteSubjects,
    attemptsBySubject: Object.entries(bySubject).sort((a, b) => b[1] - a[1]),
    strugglingSkills: strugglingSkills.map((s) => ({
      subject: s.subjectId,
      skill: s.skill,
      mastery: masteryPercent(s.correct, s.attempts),
      attempts: s.attempts,
    })),
    hardActivities: hardActivities.map(([id, v]) => ({
      activityId: id,
      subject: v.subjectId,
      skill: v.skill,
      mastery: masteryPercent(v.correct, v.attempts),
      attempts: v.attempts,
    })),
  };
}

try {
  const store = loadStore();
  const report = analyze(store);
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  console.error(`Could not read ${EXPORT_PATH}`);
  console.error('Export from /learn/ DevTools console:');
  console.error("  copy(localStorage.getItem('learn-store-v2'))");
  console.error('Save clipboard to learn-session-export.json in repo root.');
  process.exit(1);
}
