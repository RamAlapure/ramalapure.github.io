import type { AdaptiveSessionPlan } from '../adaptive/engine';
import { buildAdaptiveSubjectSession } from '../adaptive/engine';
import type { Activity, SubjectId } from '../app/types';
import type { LearnLanguage } from '../i18n/types';
import type { LearnStore } from '../storage/types';
import { shuffle } from './builders';
import { getActivitiesForSubject } from './nursery';

export const SESSION_SIZE = 4;

export type { AdaptiveSessionPlan };

/** Random session — kept for tests or fallback. */
export function buildSubjectSession(
  subjectId: SubjectId,
  size = SESSION_SIZE,
  language: LearnLanguage = 'en',
): Activity[] {
  const pool = getActivitiesForSubject(subjectId, language);
  if (pool.length === 0) return [];
  return shuffle(pool).slice(0, Math.min(size, pool.length));
}

/** Adaptive session based on local skill mastery. */
export function buildAdaptiveSession(
  subjectId: SubjectId,
  store: LearnStore,
  size = SESSION_SIZE,
): AdaptiveSessionPlan {
  return buildAdaptiveSubjectSession(subjectId, store, size);
}
