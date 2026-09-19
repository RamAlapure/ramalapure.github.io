import type { SubjectId } from '../app/types';
import type { LearnLanguage } from '../i18n/types';
import type { LearnerAvatar } from './profile-avatar';

export interface ChildProfile {
  id: string;
  name: string;
  ageGroup: string;
  avatar?: LearnerAvatar;
  language?: LearnLanguage;
  createdAt: string;
}

export interface ActivityResult {
  activityId: string;
  subjectId: SubjectId;
  skill: string;
  correct: boolean;
  attempts: number;
  responseTimeMs: number;
  completedAt: string;
}

export interface SkillRecord {
  skill: string;
  subjectId: SubjectId;
  correct: number;
  attempts: number;
  lastPracticedAt?: string;
}

export type DifficultyMode = 'adaptive' | 'easier' | 'harder';

export interface LearnPreferences {
  sessionLength?: number;
  dailyGoal?: number;
  enabledSubjects?: SubjectId[];
  difficultyMode?: DifficultyMode;
  dailyLimitMinutes?: number;
}

export interface LearnSettings {
  soundEnabled: boolean;
  slowSpeech: boolean;
  highContrast: boolean;
  language: LearnLanguage;
  parentPin?: string;
}

export interface LearnRewards {
  points: number;
  totalStars: number;
  badges: SubjectId[];
  dailyStreak: number;
  lastPlayedDate?: string;
}

export interface LearnSessions {
  sessionsCompleted: number;
  bySubject: Partial<Record<SubjectId, number>>;
  lastSubject?: SubjectId;
}

export interface LearnStore {
  profile: ChildProfile | null;
  activityResults: ActivityResult[];
  skills: Record<string, SkillRecord>;
  rewards: LearnRewards;
  sessions: LearnSessions;
  preferences: LearnPreferences;
  settings: LearnSettings;
}

export interface ActivityAttemptInput {
  activityId: string;
  subjectId: SubjectId;
  skill: string;
  correct: boolean;
  responseTimeMs: number;
  completedAt: string;
}
