import type { SubjectId } from '../app/types';
import { subjects } from '../curriculum/subjects';
import { SESSION_SIZE } from '../curriculum/session';
import { localizeCount } from '../i18n/digits';
import { localeTag, translateSkill, translateSubject } from '../i18n/translate';
import type { LearnLanguage } from '../i18n/types';
import { getLocalizedSkillsNeedingPractice, masteryPercent } from '../progress/mastery';
import type { ActivityResult, LearnStore } from '../storage/types';
import { localDateKey } from '../storage/dates';
import { renderStars } from '../rewards/stars';

export type AnalyticsRange = 'today' | '7d' | '30d' | 'all';

const ENGAGEMENT_MS_PER_ACTIVITY = 45_000;

function resultLocalDateKey(iso: string): string {
  return localDateKey(new Date(iso));
}

function resultsForDay(store: LearnStore, day: string): ActivityResult[] {
  return (store.activityResults ?? []).filter(
    (result) => resultLocalDateKey(result.completedAt) === day,
  );
}

function resultsInRange(store: LearnStore, range: AnalyticsRange): ActivityResult[] {
  const results = store.activityResults ?? [];
  if (range === 'all') return results;

  const now = new Date();
  const today = localDateKey(now);
  if (range === 'today') {
    return resultsForDay(store, today);
  }

  const days = range === '7d' ? 7 : 30;
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - (days - 1));
  const cutoffKey = localDateKey(cutoff);

  return results.filter((result) => {
    const key = resultLocalDateKey(result.completedAt);
    return key >= cutoffKey && key <= today;
  });
}

function previousRangeResults(store: LearnStore, range: AnalyticsRange): ActivityResult[] {
  if (range === 'all') return [];

  const now = new Date();
  const today = localDateKey(now);

  if (range === 'today') {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return resultsForDay(store, localDateKey(yesterday));
  }

  const days = range === '7d' ? 7 : 30;
  const periodEnd = new Date(now);
  periodEnd.setDate(now.getDate() - days);
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodEnd.getDate() - (days - 1));

  const startKey = localDateKey(periodStart);
  const endKey = localDateKey(periodEnd);

  return (store.activityResults ?? []).filter((result) => {
    const key = resultLocalDateKey(result.completedAt);
    return key >= startKey && key <= endKey;
  });
}

export interface RangeStats {
  minutes: number;
  activities: number;
  correct: number;
  accuracy: number;
  deltaMinutes: number;
  deltaActivities: number;
  deltaAccuracy: number;
  streak: number;
  bestStreak: number;
}

export function getRangeStats(store: LearnStore, range: AnalyticsRange): RangeStats {
  const current = resultsInRange(store, range);
  const previous = previousRangeResults(store, range);
  const currentAccuracy =
    current.length === 0 ? 0 : Math.round((current.filter((r) => r.correct).length / current.length) * 100);
  const previousAccuracy =
    previous.length === 0 ? 0 : Math.round((previous.filter((r) => r.correct).length / previous.length) * 100);

  return {
    minutes: estimateLearningMinutes(current),
    activities: current.length,
    correct: current.filter((result) => result.correct).length,
    accuracy: currentAccuracy,
    deltaMinutes: estimateLearningMinutes(current) - estimateLearningMinutes(previous),
    deltaActivities: current.length - previous.length,
    deltaAccuracy: currentAccuracy - previousAccuracy,
    streak: store.rewards?.dailyStreak ?? 0,
    bestStreak: store.rewards?.dailyStreak ?? 0,
  };
}

export interface DailySeriesPoint {
  day: string;
  label: string;
  showLabel: boolean;
  activities: number;
  accuracy: number;
}

export type ChartGranularity = 'day' | 'week';

export interface ChartSeries {
  points: DailySeriesPoint[];
  granularity: ChartGranularity;
}

const ALL_TIME_WEEKLY_THRESHOLD_DAYS = 45;
const MAX_WEEKLY_BUCKETS = 52;

function weekStartKey(day: string): string {
  const date = new Date(`${day}T12:00:00`);
  const weekday = date.getDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  date.setDate(date.getDate() + mondayOffset);
  return localDateKey(date);
}

function addDays(day: string, amount: number): string {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return localDateKey(date);
}

function daySpanInclusive(startDay: string, endDay: string): number {
  const start = new Date(`${startDay}T12:00:00`);
  const end = new Date(`${endDay}T12:00:00`);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1);
}

function summarizeResults(results: ActivityResult[]): Pick<DailySeriesPoint, 'activities' | 'accuracy'> {
  return {
    activities: results.length,
    accuracy:
      results.length === 0
        ? 0
        : Math.round((results.filter((result) => result.correct).length / results.length) * 100),
  };
}

function fillDailySeries(
  store: LearnStore,
  startDay: string,
  endDay: string,
  language: LearnLanguage,
  labelMode: 'weekday' | 'dayOfMonth' | 'monthDay',
): DailySeriesPoint[] {
  const points: DailySeriesPoint[] = [];
  let cursor = startDay;
  let index = 0;
  const totalDays = daySpanInclusive(startDay, endDay);

  while (cursor <= endDay) {
    const date = new Date(`${cursor}T12:00:00`);
    const label =
      labelMode === 'weekday'
        ? date.toLocaleDateString(localeTag(language), { weekday: 'short' })
        : labelMode === 'dayOfMonth'
          ? date.toLocaleDateString(localeTag(language), { day: 'numeric' })
          : date.toLocaleDateString(localeTag(language), { month: 'short', day: 'numeric' });
    const dayResults = resultsForDay(store, cursor);
    const summary = summarizeResults(dayResults);

    points.push({
      day: cursor,
      label,
      showLabel: totalDays <= 7 || index % 5 === 0 || index === totalDays - 1,
      ...summary,
    });

    cursor = addDays(cursor, 1);
    index += 1;
  }

  return points;
}

function getAllTimeWeeklySeries(store: LearnStore, language: LearnLanguage): DailySeriesPoint[] {
  const results = store.activityResults ?? [];
  if (results.length === 0) return [];

  const byWeek = new Map<string, ActivityResult[]>();
  for (const result of results) {
    const weekKey = weekStartKey(resultLocalDateKey(result.completedAt));
    const bucket = byWeek.get(weekKey) ?? [];
    bucket.push(result);
    byWeek.set(weekKey, bucket);
  }

  const weeks = [...byWeek.entries()].sort(([left], [right]) => left.localeCompare(right));
  const visibleWeeks = weeks.slice(-MAX_WEEKLY_BUCKETS);

  return visibleWeeks.map(([weekStart, weekResults], index, list) => ({
    day: weekStart,
    label: new Date(`${weekStart}T12:00:00`).toLocaleDateString(localeTag(language), {
      month: 'short',
      day: 'numeric',
    }),
    showLabel: list.length <= 8 || index % 4 === 0 || index === list.length - 1,
    ...summarizeResults(weekResults),
  }));
}

export function getChartSeries(
  store: LearnStore,
  range: AnalyticsRange,
  language: LearnLanguage,
): ChartSeries {
  if (range === 'all') {
    const results = store.activityResults ?? [];
    if (results.length === 0) return { points: [], granularity: 'day' };

    const sorted = [...results].sort((left, right) => left.completedAt.localeCompare(right.completedAt));
    const firstDay = resultLocalDateKey(sorted[0].completedAt);
    const today = localDateKey();
    const useWeekly = daySpanInclusive(firstDay, today) > ALL_TIME_WEEKLY_THRESHOLD_DAYS;

    return {
      points: useWeekly
        ? getAllTimeWeeklySeries(store, language)
        : fillDailySeries(store, firstDay, today, language, 'monthDay'),
      granularity: useWeekly ? 'week' : 'day',
    };
  }

  const days = range === 'today' ? 1 : range === '7d' ? 7 : 30;
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - (days - 1));
  const labelMode = range === '30d' ? 'dayOfMonth' : 'weekday';
  const points = fillDailySeries(store, localDateKey(start), localDateKey(now), language, labelMode);

  if (range === 'today' && points[0]) {
    points[0].label = tTodayLabel(language);
    points[0].showLabel = true;
  }

  return { points, granularity: 'day' };
}

/** @deprecated Use getChartSeries — kept for any direct callers */
export function getDailySeries(store: LearnStore, range: AnalyticsRange, language: LearnLanguage): DailySeriesPoint[] {
  return getChartSeries(store, range, language).points;
}

function tTodayLabel(language: LearnLanguage): string {
  return new Date().toLocaleDateString(localeTag(language), { weekday: 'short' });
}

const TIME_OF_DAY_WINDOWS = [
  { start: 6, end: 9, rangeLabel: '6–9a', shortLabel: '6a' },
  { start: 9, end: 12, rangeLabel: '9a–12p', shortLabel: '9a' },
  { start: 12, end: 15, rangeLabel: '12–3p', shortLabel: '12p' },
  { start: 15, end: 18, rangeLabel: '3–6p', shortLabel: '3p' },
  { start: 18, end: 21, rangeLabel: '6–9p', shortLabel: '6p' },
  { start: 21, end: 24, rangeLabel: '9p+', shortLabel: '9p' },
] as const;

function bucketForHour(hour: number): (typeof TIME_OF_DAY_WINDOWS)[number] {
  if (hour < 6) {
    return TIME_OF_DAY_WINDOWS[0];
  }
  return (
    TIME_OF_DAY_WINDOWS.find((window) => hour >= window.start && hour < window.end) ??
    TIME_OF_DAY_WINDOWS[TIME_OF_DAY_WINDOWS.length - 1]
  );
}

export interface TimeOfDayBucket {
  hourBucket: number;
  label: string;
  rangeLabel: string;
  activities: number;
  correct: number;
  accuracy: number;
  sharePercent: number;
}

export interface TimeOfDayInsight {
  buckets: TimeOfDayBucket[];
  totalActivities: number;
  hasData: boolean;
  peakRangeLabel: string;
  peakActivities: number;
  peakSharePercent: number;
  peakAccuracy: number;
  eveningAccuracy: number | null;
  accuracyDropPercent: number | null;
}

export function getTimeOfDayInsight(store: LearnStore, range: AnalyticsRange): TimeOfDayInsight {
  const tallies = TIME_OF_DAY_WINDOWS.map((window) => ({
    window,
    activities: 0,
    correct: 0,
  }));

  for (const result of resultsInRange(store, range)) {
    const hour = new Date(result.completedAt).getHours();
    const window = bucketForHour(hour);
    const bucket = tallies.find((entry) => entry.window.start === window.start);
    if (!bucket) continue;
    bucket.activities += 1;
    if (result.correct) bucket.correct += 1;
  }

  const totalActivities = tallies.reduce((sum, bucket) => sum + bucket.activities, 0);
  const buckets: TimeOfDayBucket[] = tallies.map(({ window, activities, correct }) => ({
    hourBucket: window.start,
    label: window.shortLabel,
    rangeLabel: window.rangeLabel,
    activities,
    correct,
    accuracy: activities === 0 ? 0 : Math.round((correct / activities) * 100),
    sharePercent: totalActivities === 0 ? 0 : Math.round((activities / totalActivities) * 100),
  }));

  if (totalActivities === 0) {
    return {
      buckets,
      totalActivities: 0,
      hasData: false,
      peakRangeLabel: '',
      peakActivities: 0,
      peakSharePercent: 0,
      peakAccuracy: 0,
      eveningAccuracy: null,
      accuracyDropPercent: null,
    };
  }

  const peak = buckets.reduce((best, bucket) =>
    bucket.activities > best.activities ? bucket : best,
  );
  const eveningActivities = buckets
    .filter((bucket) => bucket.hourBucket >= 18)
    .reduce((sum, bucket) => sum + bucket.activities, 0);
  const eveningCorrect = buckets
    .filter((bucket) => bucket.hourBucket >= 18)
    .reduce((sum, bucket) => sum + bucket.correct, 0);
  const eveningAccuracy =
    eveningActivities > 0 ? Math.round((eveningCorrect / eveningActivities) * 100) : null;
  const accuracyDropPercent =
    eveningAccuracy !== null && peak.accuracy > eveningAccuracy
      ? peak.accuracy - eveningAccuracy
      : null;

  return {
    buckets,
    totalActivities,
    hasData: true,
    peakRangeLabel: peak.rangeLabel,
    peakActivities: peak.activities,
    peakSharePercent: peak.sharePercent,
    peakAccuracy: peak.accuracy,
    eveningAccuracy,
    accuracyDropPercent,
  };
}

export function getTimeOfDayHistogram(store: LearnStore, range: AnalyticsRange): TimeOfDayBucket[] {
  return getTimeOfDayInsight(store, range).buckets;
}

export interface RecentSession {
  subjectId: SubjectId;
  subjectLabel: string;
  subjectEmoji: string;
  score: number;
  total: number;
  durationMs: number;
  at: string;
  timeLabel: string;
}

export function getRecentSessions(
  store: LearnStore,
  language: LearnLanguage,
  limit = 8,
): RecentSession[] {
  const results = [...(store.activityResults ?? [])].sort(
    (left, right) => right.completedAt.localeCompare(left.completedAt),
  );
  const sessions: RecentSession[] = [];
  let index = 0;

  while (index < results.length && sessions.length < limit) {
    const anchor = results[index];
    const batch: ActivityResult[] = [];
    let cursor = index;

    while (cursor < results.length && batch.length < SESSION_SIZE) {
      const candidate = results[cursor];
      if (candidate.subjectId !== anchor.subjectId) break;
      const gapMs =
        batch.length === 0
          ? 0
          : new Date(batch[batch.length - 1].completedAt).getTime() -
            new Date(candidate.completedAt).getTime();
      if (batch.length > 0 && gapMs > 20 * 60 * 1000) break;
      batch.push(candidate);
      cursor += 1;
    }

    if (batch.length > 0) {
      const subject = subjects.find((item) => item.id === anchor.subjectId);
      const correct = batch.filter((item) => item.correct).length;
      const durationMs = batch.reduce((sum, item) => sum + item.responseTimeMs, 0);
      const at = batch[0].completedAt;
      sessions.push({
        subjectId: anchor.subjectId,
        subjectLabel: translateSubject(language, anchor.subjectId),
        subjectEmoji: subject?.emoji ?? '📚',
        score: correct,
        total: batch.length,
        durationMs,
        at,
        timeLabel: formatRecentTime(at, language),
      });
    }

    index = cursor > index ? cursor : index + 1;
  }

  return sessions;
}

function formatRecentTime(iso: string, language: LearnLanguage): string {
  const date = new Date(iso);
  const now = new Date();
  const today = localDateKey(now);
  const key = localDateKey(date);
  const time = date.toLocaleTimeString(localeTag(language), { hour: 'numeric', minute: '2-digit' });
  if (key === today) return time;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (key === localDateKey(yesterday)) {
    return `${translateUiRelative('yesterday', language)} ${time}`;
  }
  return date.toLocaleDateString(localeTag(language), { month: 'short', day: 'numeric' });
}

function translateUiRelative(key: 'yesterday', language: LearnLanguage): string {
  if (language === 'hi') return 'कल';
  if (language === 'mr') return 'काल';
  return 'Yest';
}

export interface SubjectMasteryRow {
  subjectId: SubjectId;
  label: string;
  emoji: string;
  masteryPercent: number;
  stars: number;
  starsDisplay: string;
  rounds: number;
  lastPracticedAt?: string;
}

export function getSubjectMastery(store: LearnStore, language: LearnLanguage): SubjectMasteryRow[] {
  const sessions = store.sessions ?? { bySubject: {} };
  return subjects.map((subject) => {
    const skills = Object.values(store.skills ?? {}).filter((skill) => skill.subjectId === subject.id);
    const averageMastery =
      skills.length === 0
        ? 0
        : Math.round(
            skills.reduce((sum, skill) => sum + masteryPercent(skill.correct, skill.attempts), 0) /
              skills.length,
          );
    const stars = subjectStarRating(store, subject.id);
    const lastPracticedAt = skills
      .map((skill) => skill.lastPracticedAt)
      .filter(Boolean)
      .sort()
      .at(-1);

    return {
      subjectId: subject.id,
      label: translateSubject(language, subject.id),
      emoji: subject.emoji,
      masteryPercent: averageMastery,
      stars,
      starsDisplay: stars > 0 ? renderStars(stars) : '—',
      rounds: sessions.bySubject[subject.id] ?? 0,
      lastPracticedAt,
    };
  });
}

export function getActivitiesToday(store: LearnStore): number {
  return resultsForDay(store, localDateKey()).length;
}

export function getStarsToday(store: LearnStore): number {
  const today = localDateKey();
  const todayResults = resultsForDay(store, today);
  if (todayResults.length === 0) return 0;
  const correct = todayResults.filter((result) => result.correct).length;
  return Math.min(5, Math.max(1, Math.round((correct / todayResults.length) * 5)));
}

export function estimateLearningMinutes(results: ActivityResult[]): number {
  if (results.length === 0) return 0;
  const responseMs = results.reduce((sum, result) => sum + result.responseTimeMs, 0);
  const totalMs = responseMs + results.length * ENGAGEMENT_MS_PER_ACTIVITY;
  return Math.max(1, Math.round(totalMs / 60_000));
}

export interface TodayStats {
  minutes: number;
  activities: number;
  correct: number;
}

export function getTodayStats(store: LearnStore): TodayStats {
  const today = localDateKey();
  const todayResults = resultsForDay(store, today);
  return {
    minutes: estimateLearningMinutes(todayResults),
    activities: todayResults.length,
    correct: todayResults.filter((result) => result.correct).length,
  };
}

export interface SubjectSkillView {
  subjectId: SubjectId;
  label: string;
  emoji: string;
  stars: number;
  starsDisplay: string;
}

function subjectStarRating(store: LearnStore, subjectId: SubjectId): number {
  const skills = Object.values(store.skills ?? {}).filter((skill) => skill.subjectId === subjectId);
  if (skills.length === 0) return 0;

  const averageMastery =
    skills.reduce((sum, skill) => sum + masteryPercent(skill.correct, skill.attempts), 0) /
    skills.length;

  if (averageMastery >= 90) return 5;
  if (averageMastery >= 75) return 4;
  if (averageMastery >= 60) return 3;
  if (averageMastery >= 40) return 2;
  return 1;
}

export function getSubjectSkillViews(
  store: LearnStore,
  language: LearnLanguage,
): SubjectSkillView[] {
  return subjects.map((subject) => {
    const stars = subjectStarRating(store, subject.id);
    return {
      subjectId: subject.id,
      label: translateSubject(language, subject.id),
      emoji: subject.emoji,
      stars,
      starsDisplay: stars > 0 ? renderStars(stars) : '—',
    };
  });
}

export interface PracticeRecommendation {
  subjectId: SubjectId;
  subjectLabel: string;
  subjectEmoji: string;
  skillLabel: string;
  suggestedCount: number;
}

export function getPracticeRecommendations(
  store: LearnStore,
  language: LearnLanguage,
): PracticeRecommendation[] {
  return getLocalizedSkillsNeedingPractice(store, language).map((skill) => {
    const subject = subjects.find((item) => item.id === skill.subjectId);
    return {
      subjectId: skill.subjectId,
      subjectLabel: translateSubject(language, skill.subjectId),
      subjectEmoji: subject?.emoji ?? '📚',
      skillLabel: translateSkill(language, skill.skill),
      suggestedCount: SESSION_SIZE,
    };
  });
}

export interface WeeklyDaySummary {
  label: string;
  count: number;
}

export function getWeeklySummary(store: LearnStore, language: LearnLanguage): WeeklyDaySummary[] {
  const days: WeeklyDaySummary[] = [];
  const now = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    const key = localDateKey(date);
    const label = date.toLocaleDateString(localeTag(language), { weekday: 'short' });
    days.push({
      label,
      count: resultsForDay(store, key).length,
    });
  }

  return days;
}

export function formatLocalizedCount(value: number, language: LearnLanguage): string {
  return localizeCount(value, language);
}
