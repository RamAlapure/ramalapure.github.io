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

const ENGAGEMENT_MS_PER_ACTIVITY = 45_000;

function resultLocalDateKey(iso: string): string {
  return localDateKey(new Date(iso));
}

function resultsForDay(store: LearnStore, day: string): ActivityResult[] {
  return (store.activityResults ?? []).filter(
    (result) => resultLocalDateKey(result.completedAt) === day,
  );
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
