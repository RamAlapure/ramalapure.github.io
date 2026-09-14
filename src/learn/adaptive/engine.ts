import type { Activity, SubjectId } from '../app/types';
import { shuffle } from '../curriculum/builders';
import { getActivitiesForSubject } from '../curriculum/nursery';
import { SESSION_SIZE } from '../curriculum/session';
import { buildSessionReason } from '../i18n/session-reasons';
import { translateUi } from '../i18n/translate';
import type { LearnLanguage } from '../i18n/types';
import {
  formatSkillLabel,
  masteryPercent,
  skillKey,
} from '../progress/mastery';
import type { LearnStore } from '../storage/types';
import {
  buildActivityAttemptStats,
  freshnessScore,
  sortByFreshness,
} from './freshness';
import {
  difficultyDistance,
  getEffectiveDifficulty,
  targetDifficultyForMastery,
} from './difficulty';

export interface AdaptiveSessionPlan {
  activities: Activity[];
  focusSkills: string[];
  targetDifficulty: number;
  reason: string;
}

interface ScoredActivity {
  activity: Activity;
  skill: string;
  targetDifficulty: number;
  priority: number;
}

function getSkillMastery(store: LearnStore, subjectId: SubjectId, skill: string): {
  percent: number;
  attempts: number;
} {
  const record = store.skills[skillKey(subjectId, skill)];
  const attempts = record?.attempts ?? 0;
  const correct = record?.correct ?? 0;
  return {
    percent: masteryPercent(correct, attempts),
    attempts,
  };
}

function ageGroupBoost(store: LearnStore): number {
  return store.profile?.ageGroup === 'class1' ? 1 : 0;
}

function scoreActivities(
  pool: Activity[],
  subjectId: SubjectId,
  store: LearnStore,
  focusSkills: string[],
  attemptStats: ReturnType<typeof buildActivityAttemptStats>,
): ScoredActivity[] {
  const targets = new Map<string, number>();
  const ageBoost = ageGroupBoost(store);

  for (const activity of pool) {
    if (!targets.has(activity.skill)) {
      const mastery = getSkillMastery(store, subjectId, activity.skill);
      let target = targetDifficultyForMastery(mastery.percent, mastery.attempts);
      if (store.profile?.ageGroup === 'class1' && mastery.percent >= 85) {
        target = Math.min(4, target + 1);
      }
      targets.set(activity.skill, target);
    }
  }

  return pool
    .map((activity) => {
      const targetDifficulty = targets.get(activity.skill) ?? 2 + ageBoost;
      const distance = difficultyDistance(activity, targetDifficulty);
      const isFocus = focusSkills.includes(activity.skill);
      const fresh = freshnessScore(activity.id, attemptStats);
      return {
        activity,
        skill: activity.skill,
        targetDifficulty,
        priority: fresh * 2 + (isFocus ? distance - 1.5 : distance),
      };
    })
    .sort((left, right) => left.priority - right.priority);
}

function pickActivities(
  scored: ScoredActivity[],
  size: number,
  focusSkills: string[],
  attemptStats: ReturnType<typeof buildActivityAttemptStats>,
): Activity[] {
  const freshPool = sortByFreshness(
    scored.map((item) => item.activity),
    attemptStats,
  );
  const selected: Activity[] = [];
  const usedIds = new Set<string>();
  const focusCount = focusSkills.length > 0 ? Math.min(Math.ceil(size * 0.5), size) : 0;

  for (const activity of freshPool) {
    if (selected.length >= size || focusCount === 0) break;
    if (!focusSkills.includes(activity.skill)) continue;
    if (usedIds.has(activity.id)) continue;
    selected.push(activity);
    usedIds.add(activity.id);
    if (selected.filter((item) => focusSkills.includes(item.skill)).length >= focusCount) {
      break;
    }
  }

  for (const activity of freshPool) {
    if (selected.length >= size) break;
    if (usedIds.has(activity.id)) continue;
    selected.push(activity);
    usedIds.add(activity.id);
  }

  if (selected.length < size) {
    for (const activity of shuffle(scored.map((item) => item.activity))) {
      if (selected.length >= size) break;
      if (!usedIds.has(activity.id)) {
        selected.push(activity);
        usedIds.add(activity.id);
      }
    }
  }

  return selected;
}

function pickMicroTracing(
  subjectId: SubjectId,
  store: LearnStore,
  attemptStats: ReturnType<typeof buildActivityAttemptStats>,
): Activity | null {
  const language = store.settings.language ?? 'en';
  const tracingPool = getActivitiesForSubject('writing', language).filter(
    (activity) => activity.type === 'TRACING',
  );
  if (tracingPool.length === 0) return null;

  const sorted = sortByFreshness(tracingPool, attemptStats);
  if (subjectId === 'alphabet') {
    return sorted.find((activity) => activity.id.includes('letter')) ?? sorted[0] ?? null;
  }
  if (subjectId === 'numbers') {
    return sorted.find((activity) => activity.id.includes('number')) ?? sorted[0] ?? null;
  }
  return null;
}

function injectMicroTracing(
  subjectId: SubjectId,
  activities: Activity[],
  store: LearnStore,
  attemptStats: ReturnType<typeof buildActivityAttemptStats>,
  size: number,
): Activity[] {
  if (subjectId !== 'alphabet' && subjectId !== 'numbers') {
    return activities;
  }

  const tracing = pickMicroTracing(subjectId, store, attemptStats);
  if (!tracing) return activities;

  const withoutTracing = activities.filter((activity) => activity.id !== tracing.id);
  const trimmed = withoutTracing.slice(0, Math.max(0, size - 1));
  const insertAt = Math.min(1, trimmed.length);
  const next = [...trimmed];
  next.splice(insertAt, 0, tracing);
  return next.slice(0, size);
}

export function buildAdaptiveSubjectSession(
  subjectId: SubjectId,
  store: LearnStore,
  size = SESSION_SIZE,
): AdaptiveSessionPlan {
  const language: LearnLanguage = store.settings.language ?? 'en';
  const pool = getActivitiesForSubject(subjectId, language);
  if (pool.length === 0) {
    return {
      activities: [],
      focusSkills: [],
      targetDifficulty: 2,
      reason: translateUi(language, 'session.none'),
    };
  }

  const attemptStats = buildActivityAttemptStats(store);
  const hasFresh = pool.some((activity) => freshnessScore(activity.id, attemptStats) === 0);

  const skills = [...new Set(pool.map((activity) => activity.skill))];
  const weakSkills = skills.filter((skill) => {
    const mastery = getSkillMastery(store, subjectId, skill);
    return mastery.attempts > 0 && mastery.percent < 70;
  });

  const focusSkills = weakSkills.length > 0
    ? weakSkills
    : skills.filter((skill) => getSkillMastery(store, subjectId, skill).percent < 90);

  const scored = scoreActivities(pool, subjectId, store, focusSkills, attemptStats);
  const sessionSize = Math.min(size, pool.length);
  let activities = shuffle(
    pickActivities(scored, sessionSize, focusSkills, attemptStats),
  );
  activities = injectMicroTracing(subjectId, activities, store, attemptStats, sessionSize);

  const targetDifficulty = Math.round(
    skills.reduce((sum, skill) => {
      const mastery = getSkillMastery(store, subjectId, skill);
      return sum + targetDifficultyForMastery(mastery.percent, mastery.attempts);
    }, 0) / skills.length,
  );

  return {
    activities,
    focusSkills: focusSkills.map(formatSkillLabel),
    targetDifficulty,
    reason: buildSessionReason(language, focusSkills, targetDifficulty, hasFresh),
  };
}

