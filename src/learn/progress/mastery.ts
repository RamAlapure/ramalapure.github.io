import type { SubjectId } from '../app/types';
import { subjects } from '../curriculum/subjects';
import { translateMastery, translateSkill, translateSubject } from '../i18n/translate';
import type { LearnLanguage } from '../i18n/types';
import type { LearnStore, SkillRecord } from '../storage/types';

export type MasteryLevel = 'needs-practice' | 'learning' | 'good' | 'mastered';

const skillLabels: Record<string, string> = {
  'letter-recognition': 'Letter recognition',
  'picture-to-letter': 'Picture to letter',
  'count-objects': 'Counting objects',
  'color-recognition': 'Color recognition',
  'shape-recognition': 'Shape recognition',
  'animal-recognition': 'Animal recognition',
  'animal-sounds': 'Animal sounds',
  'matching-pairs': 'Matching pairs',
  'vocabulary-food': 'Food vocabulary',
  'vocabulary-toys': 'Toy vocabulary',
  'vocabulary-vehicles': 'Vehicle vocabulary',
  'vocabulary-objects': 'Object vocabulary',
  'tracing-patterns': 'Tracing patterns',
  'tracing-shapes': 'Tracing shapes',
  'tracing-letters': 'Tracing letters',
  'tracing-numbers': 'Tracing numbers',
};

export interface SkillSummary {
  key: string;
  skill: string;
  subjectId: SubjectId;
  label: string;
  subjectLabel: string;
  correct: number;
  attempts: number;
  masteryPercent: number;
  level: MasteryLevel;
  statusEmoji: string;
  statusLabel: string;
}

export function skillKey(subjectId: SubjectId, skill: string): string {
  return `${subjectId}:${skill}`;
}

export function formatSkillLabel(skill?: string): string {
  if (!skill) return 'Unknown skill';
  return skillLabels[skill] ?? skill.replace(/-/g, ' ');
}

function isValidSkillRecord(record: SkillRecord | undefined): record is SkillRecord {
  return Boolean(
    record &&
      typeof record.skill === 'string' &&
      record.skill.length > 0 &&
      typeof record.attempts === 'number' &&
      typeof record.correct === 'number',
  );
}

export function masteryPercent(correct: number, attempts: number): number {
  if (attempts === 0) return 0;
  return Math.round((correct / attempts) * 100);
}

export function masteryLevel(percent: number): MasteryLevel {
  if (percent >= 90) return 'mastered';
  if (percent >= 75) return 'good';
  if (percent >= 50) return 'learning';
  return 'needs-practice';
}

export function masteryStatus(level: MasteryLevel): { emoji: string; label: string } {
  switch (level) {
    case 'mastered':
      return { emoji: '🏆', label: 'Mastered' };
    case 'good':
      return { emoji: '🟢', label: 'Good' };
    case 'learning':
      return { emoji: '🟡', label: 'Learning' };
    case 'needs-practice':
      return { emoji: '🔴', label: 'Needs Practice' };
    default: {
      const unexpected: never = level;
      throw new Error(`Unhandled mastery level: ${unexpected}`);
    }
  }
}

const levelRank: Record<MasteryLevel, number> = {
  'needs-practice': 0,
  learning: 1,
  good: 2,
  mastered: 3,
};

function toSkillSummary(record: SkillRecord, key: string): SkillSummary {
  const percent = masteryPercent(record.correct, record.attempts);
  const level = masteryLevel(percent);
  const status = masteryStatus(level);
  const subjectLabel = subjects.find((subject) => subject.id === record.subjectId)?.label ?? record.subjectId;

  return {
    key,
    skill: record.skill,
    subjectId: record.subjectId,
    label: formatSkillLabel(record.skill),
    subjectLabel,
    correct: record.correct,
    attempts: record.attempts,
    masteryPercent: percent,
    level,
    statusEmoji: status.emoji,
    statusLabel: status.label,
  };
}

export function getSkillSummaries(store: LearnStore): SkillSummary[] {
  return Object.entries(store.skills ?? {})
    .filter(([, record]) => isValidSkillRecord(record))
    .map(([key, record]) => toSkillSummary(record, key))
    .sort((left, right) => {
      const levelDiff = levelRank[left.level] - levelRank[right.level];
      if (levelDiff !== 0) return levelDiff;
      return left.label.localeCompare(right.label);
    });
}

export function getSkillsNeedingPractice(store: LearnStore): SkillSummary[] {
  return getSkillSummaries(store).filter(
    (summary) => summary.attempts > 0 && summary.level === 'needs-practice',
  );
}

export function localizeSkillSummary(
  summary: SkillSummary,
  language: LearnLanguage,
): SkillSummary {
  const status = masteryStatus(summary.level);
  return {
    ...summary,
    label: translateSkill(language, summary.skill),
    subjectLabel: translateSubject(language, summary.subjectId),
    statusLabel: translateMastery(language, summary.level),
    statusEmoji: status.emoji,
    correct: summary.correct,
    attempts: summary.attempts,
    masteryPercent: summary.masteryPercent,
  };
}

export function getLocalizedSkillSummaries(
  store: LearnStore,
  language: LearnLanguage,
): SkillSummary[] {
  return getSkillSummaries(store).map((summary) => localizeSkillSummary(summary, language));
}

export function getLocalizedSkillsNeedingPractice(
  store: LearnStore,
  language: LearnLanguage,
): SkillSummary[] {
  return getLocalizedSkillSummaries(store, language).filter(
    (summary) => summary.attempts > 0 && summary.level === 'needs-practice',
  );
}

