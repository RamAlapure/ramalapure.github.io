import type { SubjectId } from '../app/types';
import type { LearnLanguage } from '../i18n/types';
import { skillKey } from '../progress/mastery';
import type { Badge } from '../rewards/badges';
import { getBadge } from '../rewards/badges';
import { POINTS_PER_CORRECT } from '../rewards/constants';
import { starsForSession } from '../rewards/stars';
import type {
  ActivityAttemptInput,
  ActivityResult,
  ChildProfile,
  LearnSettings,
  LearnStore,
  SkillRecord,
} from './types';
import { localDateKey, localYesterdayKey } from './dates';
import {
  type AgeGroup,
  createProfile,
  deleteProfile,
  emptyProfileData,
  getLastStorageWriteError,
  hasDuplicateProfileName,
  listProfiles,
  MAX_PROFILES,
  profileCount,
  profileNeedsName,
  readRootStore,
  switchProfile,
  updateActiveProfile,
  updateProfileSettings,
  writeRootStore,
} from './root-store';
import type { LearnerAvatar } from './profile-avatar';

export type { AgeGroup };
export {
  clearLastStorageWriteError,
  DEFAULT_LEARNER_NAME,
  getLastStorageWriteError,
  hasDuplicateProfileName,
  MAX_PROFILES,
  profileCount,
  profileNeedsName,
} from './root-store';
export type { LearnerAvatar } from './profile-avatar';

export interface ProfileSummary {
  id: string;
  name: string;
  avatar?: LearnerAvatar;
  needsName: boolean;
  isActive: boolean;
  totalStars: number;
  points: number;
  sessionsCompleted: number;
  lastPlayedAt?: string;
}

export interface SessionCompletion {
  store: LearnStore;
  starsEarned: number;
  badgeUnlocked: Badge | null;
}

function todayKey(): string {
  return localDateKey();
}

function yesterdayKey(): string {
  return localYesterdayKey();
}

function updateDailyStreak(rewards: LearnStore['rewards']): Pick<LearnStore['rewards'], 'dailyStreak' | 'lastPlayedDate'> {
  const today = todayKey();
  if (rewards.lastPlayedDate === today) {
    return { dailyStreak: rewards.dailyStreak, lastPlayedDate: today };
  }
  if (rewards.lastPlayedDate === yesterdayKey()) {
    return { dailyStreak: rewards.dailyStreak + 1, lastPlayedDate: today };
  }
  return { dailyStreak: 1, lastPlayedDate: today };
}

export function emptyStore(): LearnStore {
  const profile = emptyProfileData();
  return {
    ...profile,
    settings: {
      soundEnabled: true,
      slowSpeech: false,
      highContrast: false,
      language: 'en',
    },
  };
}

export function readStore(): LearnStore {
  const root = readRootStore();
  return readStoreFromRoot(root);
}

function upsertSkill(
  skills: Record<string, SkillRecord>,
  input: ActivityAttemptInput,
): Record<string, SkillRecord> {
  const key = skillKey(input.subjectId, input.skill);
  const existing = skills[key] ?? {
    skill: input.skill,
    subjectId: input.subjectId,
    correct: 0,
    attempts: 0,
  };

  return {
    ...skills,
    [key]: {
      ...existing,
      correct: existing.correct + (input.correct ? 1 : 0),
      attempts: existing.attempts + 1,
      lastPracticedAt: input.completedAt,
    },
  };
}

export function recordActivityAttempt(input: ActivityAttemptInput): LearnStore {
  const root = readRootStore();
  const updated = updateActiveProfile(root, (profile) => {
    const result: ActivityResult = {
      activityId: input.activityId,
      subjectId: input.subjectId,
      skill: input.skill,
      correct: input.correct,
      attempts: 1,
      responseTimeMs: input.responseTimeMs,
      completedAt: input.completedAt,
    };

    return {
      ...profile,
      rewards: {
        ...profile.rewards,
        points: profile.rewards.points + (input.correct ? POINTS_PER_CORRECT : 0),
      },
      sessions: {
        ...profile.sessions,
        lastSubject: input.subjectId,
      },
      activityResults: [result, ...profile.activityResults].slice(0, 200),
      skills: upsertSkill(profile.skills, input),
    };
  });

  return readStoreFromRoot(updated);
}

export function recordSubjectSession(
  subjectId: SubjectId,
  correctCount: number,
  totalCount: number,
): SessionCompletion {
  const root = readRootStore();
  const active = root.profiles[root.activeProfileId];
  if (!active) {
    return { store: emptyStore(), starsEarned: 0, badgeUnlocked: null };
  }

  const starsEarned = starsForSession(correctCount, totalCount);
  const hadBadge = active.rewards.badges.includes(subjectId);
  const badgeUnlocked = hadBadge ? null : getBadge(subjectId);
  const streakUpdate = updateDailyStreak(active.rewards);

  const updated = updateActiveProfile(root, (profile) => ({
    ...profile,
    rewards: {
      ...profile.rewards,
      ...streakUpdate,
      totalStars: profile.rewards.totalStars + starsEarned,
      badges: badgeUnlocked ? [...profile.rewards.badges, subjectId] : profile.rewards.badges,
    },
    sessions: {
      ...profile.sessions,
      sessionsCompleted: profile.sessions.sessionsCompleted + 1,
      lastSubject: subjectId,
      bySubject: {
        ...profile.sessions.bySubject,
        [subjectId]: (profile.sessions.bySubject[subjectId] ?? 0) + 1,
      },
    },
  }));

  return {
    store: readStoreFromRoot(updated),
    starsEarned,
    badgeUnlocked,
  };
}

export function updateChildProfile(
  name: string,
  ageGroup?: AgeGroup,
  avatar?: LearnerAvatar,
): LearnStore {
  const root = readRootStore();
  const updated = updateActiveProfile(root, (profile) => ({
    ...profile,
    profile: {
      ...profile.profile,
      name: name.trim() || profile.profile.name,
      ageGroup: ageGroup ?? profile.profile.ageGroup,
      avatar: avatar ?? profile.profile.avatar,
    },
  }));
  return readStoreFromRoot(updated);
}

export function updateSettings(settings: Partial<LearnSettings>): LearnStore {
  const { language, ...deviceSettings } = settings;
  const root = readRootStore();
  const updated = updateProfileSettings(root, deviceSettings);
  if (language) {
    return readStoreFromRoot(
      updateActiveProfile(updated, (profile) => ({
        ...profile,
        profile: { ...profile.profile, language },
      })),
    );
  }
  return readStoreFromRoot(updated);
}

export function updateProfileLanguage(language: LearnLanguage): LearnStore {
  const updated = updateActiveProfile(readRootStore(), (profile) => ({
    ...profile,
    profile: { ...profile.profile, language },
  }));
  return readStoreFromRoot(
    updateProfileSettings(updated, { language }),
  );
}

export function deleteChildProfile(profileId: string): LearnStore {
  return readStoreFromRoot(deleteProfile(readRootStore(), profileId));
}

export function canAddProfile(): boolean {
  return profileCount(readRootStore()) < MAX_PROFILES;
}

export function isDuplicateProfileName(name: string, excludeProfileId?: string): boolean {
  return hasDuplicateProfileName(readRootStore(), name, excludeProfileId);
}

export function setParentPin(pin: string, baseStore?: LearnStore): LearnStore {
  const root = readRootStore();
  const updated = updateProfileSettings(root, { parentPin: pin });
  if (baseStore) {
    writeRootStore(updated);
    return { ...baseStore, settings: { ...baseStore.settings, parentPin: pin } };
  }
  return readStoreFromRoot(updated);
}

export function getChildProfiles(): ChildProfile[] {
  return listProfiles(readRootStore());
}

/** Per-profile analytics summaries for the child profile picker. */
export function getProfileSummaries(): ProfileSummary[] {
  const root = readRootStore();
  return Object.values(root.profiles)
    .map((entry) => ({
      id: entry.profile.id,
      name: entry.profile.name,
      avatar: entry.profile.avatar,
      needsName: profileNeedsName(entry.profile.name),
      isActive: entry.profile.id === root.activeProfileId,
      totalStars: entry.rewards.totalStars,
      points: entry.rewards.points,
      sessionsCompleted: entry.sessions.sessionsCompleted,
      lastPlayedAt: entry.activityResults[0]?.completedAt ?? entry.rewards.lastPlayedDate,
    }))
    .sort((left, right) => (right.lastPlayedAt ?? '').localeCompare(left.lastPlayedAt ?? ''));
}

export function getActiveProfileId(): string {
  return readRootStore().activeProfileId;
}

export function switchChildProfile(profileId: string): LearnStore {
  return readStoreFromRoot(switchProfile(readRootStore(), profileId));
}

export function addChildProfile(
  name: string,
  ageGroup: AgeGroup,
  avatar: LearnerAvatar = 'boy',
): LearnStore {
  return readStoreFromRoot(createProfile(readRootStore(), name, ageGroup, avatar));
}

function readStoreFromRoot(root: ReturnType<typeof readRootStore>): LearnStore {
  const active = root.profiles[root.activeProfileId];
  if (!active) {
    return emptyStore();
  }
  const language = active.profile.language ?? root.settings.language ?? 'en';
  return {
    ...active,
    settings: {
      ...root.settings,
      language,
    },
  };
}
