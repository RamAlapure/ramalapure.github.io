import type { Activity } from '../app/types';
import type { LearnStore } from '../storage/types';

export interface ActivityAttemptStats {
  attempts: number;
  wrong: number;
  lastAttemptAt?: string;
}

export function buildActivityAttemptStats(store: LearnStore): Map<string, ActivityAttemptStats> {
  const stats = new Map<string, ActivityAttemptStats>();

  for (const result of store.activityResults) {
    const existing = stats.get(result.activityId);
    if (!existing) {
      stats.set(result.activityId, {
        attempts: 1,
        wrong: result.correct ? 0 : 1,
        lastAttemptAt: result.completedAt,
      });
      continue;
    }

    stats.set(result.activityId, {
      attempts: existing.attempts + 1,
      wrong: existing.wrong + (result.correct ? 0 : 1),
      lastAttemptAt:
        !existing.lastAttemptAt || result.completedAt > existing.lastAttemptAt
          ? result.completedAt
          : existing.lastAttemptAt,
    });
  }

  return stats;
}

/** Lower score = higher priority. Unattempted activities win. */
export function freshnessScore(activityId: string, stats: Map<string, ActivityAttemptStats>): number {
  const record = stats.get(activityId);
  if (!record || record.attempts === 0) {
    return 0;
  }

  if (record.wrong > 0) {
    return 1;
  }

  const lastAttemptMs = record.lastAttemptAt ? Date.parse(record.lastAttemptAt) : 0;
  const hoursSince = lastAttemptMs > 0 ? (Date.now() - lastAttemptMs) / 3_600_000 : 999;

  if (hoursSince < 2) {
    return 4;
  }
  if (hoursSince < 24) {
    return 3;
  }
  return 2;
}

export function sortByFreshness(activities: Activity[], stats: Map<string, ActivityAttemptStats>): Activity[] {
  return [...activities].sort((left, right) => {
    const leftScore = freshnessScore(left.id, stats);
    const rightScore = freshnessScore(right.id, stats);
    if (leftScore !== rightScore) {
      return leftScore - rightScore;
    }
    return Math.random() - 0.5;
  });
}
