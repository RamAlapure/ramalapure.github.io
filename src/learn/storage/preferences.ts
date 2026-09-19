import type { SubjectId } from '../app/types';
import { subjects } from '../curriculum/subjects';
import type { DifficultyMode, LearnPreferences, LearnStore } from './types';

export const DEFAULT_DAILY_GOAL = 12;
export const DEFAULT_SESSION_LENGTH = 4;

export const SESSION_LENGTH_OPTIONS = [4, 6, 8] as const;
export const DAILY_LIMIT_OPTIONS = [0, 15, 30] as const;

export function defaultLearnPreferences(): LearnPreferences {
  return {
    sessionLength: DEFAULT_SESSION_LENGTH,
    dailyGoal: DEFAULT_DAILY_GOAL,
    enabledSubjects: subjects.map((subject) => subject.id),
    difficultyMode: 'adaptive',
    dailyLimitMinutes: 0,
  };
}

export function getLearnPreferences(store: LearnStore): LearnPreferences {
  const defaults = defaultLearnPreferences();
  const prefs = store.preferences ?? {};
  return {
    sessionLength: prefs.sessionLength ?? defaults.sessionLength,
    dailyGoal: prefs.dailyGoal ?? defaults.dailyGoal,
    enabledSubjects: prefs.enabledSubjects ?? defaults.enabledSubjects,
    difficultyMode: prefs.difficultyMode ?? defaults.difficultyMode,
    dailyLimitMinutes: prefs.dailyLimitMinutes ?? defaults.dailyLimitMinutes,
  };
}

export function getSessionLength(store: LearnStore): number {
  return getLearnPreferences(store).sessionLength ?? DEFAULT_SESSION_LENGTH;
}

export function getDailyGoal(store: LearnStore): number {
  return getLearnPreferences(store).dailyGoal ?? DEFAULT_DAILY_GOAL;
}

export function getDifficultyMode(store: LearnStore): DifficultyMode {
  return getLearnPreferences(store).difficultyMode ?? 'adaptive';
}

export function getEnabledSubjects(store: LearnStore): SubjectId[] {
  const enabled = getLearnPreferences(store).enabledSubjects;
  if (!enabled || enabled.length === 0) {
    return subjects.map((subject) => subject.id);
  }
  return enabled;
}

export function isSubjectEnabled(store: LearnStore, subjectId: SubjectId): boolean {
  return getEnabledSubjects(store).includes(subjectId);
}

export function applyDifficultyOverride(target: number, mode: DifficultyMode): number {
  switch (mode) {
    case 'easier':
      return Math.min(target, 2);
    case 'harder':
      return Math.max(target, 3);
    default:
      return target;
  }
}
