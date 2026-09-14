import type { Activity } from '../app/types';

export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 4;

/** Derive a stable 1–4 difficulty from activity content. */
export function getEffectiveDifficulty(activity: Activity): number {
  if (activity.type === 'COUNTING') {
    const count = activity.content.count;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 8) return 3;
    return 4;
  }

  if (activity.skill === 'letter-recognition' || activity.skill === 'picture-to-letter') {
    const match = activity.id.match(/-([a-j])$/);
    if (!match) return clampDifficulty(activity.difficulty);
    const index = match[1].charCodeAt(0) - 'a'.charCodeAt(0);
    if (index <= 2) return 1;
    if (index <= 5) return 2;
    if (index <= 7) return 3;
    return 4;
  }

  if (activity.type === 'TRACING') {
    return clampDifficulty(activity.difficulty);
  }

  if (activity.skill === 'animal-sounds' || activity.skill === 'matching-pairs') {
    return 2;
  }

  if (activity.skill === 'color-challenge' || activity.skill === 'compare-quantity') {
    return clampDifficulty(activity.difficulty);
  }

  if (activity.skill === 'color-recognition') {
    if (activity.id.includes('brown') || activity.id.includes('pink')) {
      return 3;
    }
    if (activity.id.includes('purple') || activity.id.includes('black') || activity.id.includes('white')) {
      return 2;
    }
    return 1;
  }

  if (activity.skill === 'number-sequence') {
    return 3;
  }

  return clampDifficulty(activity.difficulty);
}

export function clampDifficulty(level: number): number {
  return Math.min(MAX_DIFFICULTY, Math.max(MIN_DIFFICULTY, level));
}

/**
 * Map mastery to the difficulty band the child should practice next.
 * >=90% harder, 70–89% steady, <70% easier.
 */
export function targetDifficultyForMastery(masteryPercent: number, attempts: number): number {
  if (attempts === 0) return 2;
  if (masteryPercent >= 90) return 4;
  if (masteryPercent >= 70) return 3;
  if (masteryPercent >= 50) return 2;
  return 1;
}

export function difficultyDistance(activity: Activity, targetDifficulty: number): number {
  return Math.abs(getEffectiveDifficulty(activity) - targetDifficulty);
}
