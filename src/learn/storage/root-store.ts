import type { LearnLanguage } from '../i18n/types';
import type {
  ActivityResult,
  ChildProfile,
  LearnRewards,
  LearnSessions,
  LearnSettings,
  LearnStore,
  SkillRecord,
} from './types';
import { normalizeLearnerAvatar, type LearnerAvatar } from './profile-avatar';

export type AgeGroup = 'nursery' | 'class1';

export interface ProfileData {
  profile: ChildProfile;
  activityResults: ActivityResult[];
  skills: Record<string, SkillRecord>;
  rewards: LearnRewards;
  sessions: LearnSessions;
}

export interface LearnRootStore {
  activeProfileId: string;
  settings: LearnSettings;
  profiles: Record<string, ProfileData>;
}

const ROOT_KEY = 'learn-store-v3';
const LEGACY_V2_KEY = 'learn-store-v2';

export const MAX_PROFILES = 6;
export const DEFAULT_LEARNER_NAME = 'Learner';

let lastStorageWriteError: string | null = null;

export function getLastStorageWriteError(): string | null {
  return lastStorageWriteError;
}

export function clearLastStorageWriteError(): void {
  lastStorageWriteError = null;
}

export function profileNeedsName(name?: string): boolean {
  const trimmed = (name ?? '').trim();
  return trimmed.length === 0 || trimmed === DEFAULT_LEARNER_NAME;
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `learner-${Date.now()}`;
}

export function emptyProfileData(
  name = 'Learner',
  ageGroup: AgeGroup = 'nursery',
  avatar?: LearnerAvatar,
  language: LearnLanguage = 'en',
): ProfileData {
  const id = createId();
  return {
    profile: {
      id,
      name,
      ageGroup,
      avatar,
      language,
      createdAt: new Date().toISOString(),
    },
    activityResults: [],
    skills: {},
    rewards: {
      points: 0,
      totalStars: 0,
      badges: [],
      dailyStreak: 0,
    },
    sessions: {
      sessionsCompleted: 0,
      bySubject: {},
    },
  };
}

export function emptyRootStore(): LearnRootStore {
  const profile = emptyProfileData();
  return {
    activeProfileId: profile.profile.id,
    settings: {
      soundEnabled: true,
      slowSpeech: false,
      highContrast: false,
      language: 'en',
    },
    profiles: {
      [profile.profile.id]: profile,
    },
  };
}

function normalizeSkills(skills: Record<string, SkillRecord> | undefined): Record<string, SkillRecord> {
  if (!skills) return {};
  return Object.fromEntries(
    Object.entries(skills).filter(
      ([, record]) =>
        record &&
        typeof record.skill === 'string' &&
        record.skill.length > 0 &&
        typeof record.attempts === 'number' &&
        typeof record.correct === 'number',
    ),
  );
}

function normalizeProfileData(parsed: Partial<ProfileData>, fallbackName: string): ProfileData {
  const base = emptyProfileData(fallbackName);
  const profile = parsed.profile ?? base.profile;
  return {
    profile: {
      ...profile,
      ageGroup: profile.ageGroup === 'class1' ? 'class1' : 'nursery',
      avatar: normalizeLearnerAvatar(profile.avatar),
      language: profile.language,
    },
    activityResults: parsed.activityResults ?? [],
    skills: normalizeSkills(parsed.skills),
    rewards: {
      points: parsed.rewards?.points ?? 0,
      totalStars: parsed.rewards?.totalStars ?? 0,
      badges: parsed.rewards?.badges ?? [],
      dailyStreak: parsed.rewards?.dailyStreak ?? 0,
      lastPlayedDate: parsed.rewards?.lastPlayedDate,
    },
    sessions: {
      sessionsCompleted: parsed.sessions?.sessionsCompleted ?? 0,
      bySubject: parsed.sessions?.bySubject ?? {},
      lastSubject: parsed.sessions?.lastSubject,
    },
  };
}

function migrateV2Store(parsed: Partial<LearnStore>): LearnRootStore {
  const profileId = parsed.profile?.id ?? createId();
  const profileData = normalizeProfileData(
    {
      profile: parsed.profile
        ? {
            ...parsed.profile,
            id: profileId,
            ageGroup: parsed.profile.ageGroup === 'class1' ? 'class1' : 'nursery',
          }
        : undefined,
      activityResults: parsed.activityResults,
      skills: parsed.skills,
      rewards: parsed.rewards,
      sessions: parsed.sessions,
    },
    parsed.profile?.name ?? 'Learner',
  );

  return {
    activeProfileId: profileId,
    settings: {
      soundEnabled: parsed.settings?.soundEnabled ?? true,
      slowSpeech: parsed.settings?.slowSpeech ?? false,
      highContrast: parsed.settings?.highContrast ?? false,
      language: parsed.settings?.language ?? 'en',
      parentPin: parsed.settings?.parentPin,
    },
    profiles: {
      [profileId]: profileData,
    },
  };
}

function normalizeRoot(parsed: Partial<LearnRootStore>): LearnRootStore {
  const base = emptyRootStore();
  const profiles: Record<string, ProfileData> = {};

  for (const [id, data] of Object.entries(parsed.profiles ?? {})) {
    profiles[id] = normalizeProfileData(data, data?.profile?.name ?? 'Learner');
  }

  if (Object.keys(profiles).length === 0) {
    return base;
  }

  const activeProfileId =
    parsed.activeProfileId && profiles[parsed.activeProfileId]
      ? parsed.activeProfileId
      : Object.keys(profiles)[0];

  return {
    activeProfileId,
    settings: {
      soundEnabled: parsed.settings?.soundEnabled ?? true,
      slowSpeech: parsed.settings?.slowSpeech ?? false,
      highContrast: parsed.settings?.highContrast ?? false,
      language: parsed.settings?.language ?? 'en',
      parentPin: parsed.settings?.parentPin,
    },
    profiles,
  };
}

export function profileToLearnStore(root: LearnRootStore, profileId = root.activeProfileId): LearnStore {
  const profileData = root.profiles[profileId] ?? root.profiles[root.activeProfileId];
  if (!profileData) {
    return { ...emptyProfileData(), settings: root.settings };
  }
  return {
    ...profileData,
    settings: root.settings,
  };
}

export function readRootStore(): LearnRootStore {
  try {
    const rawV3 = localStorage.getItem(ROOT_KEY);
    if (rawV3) {
      return normalizeRoot(JSON.parse(rawV3) as Partial<LearnRootStore>);
    }

    const rawV2 = localStorage.getItem(LEGACY_V2_KEY);
    if (rawV2) {
      const migrated = migrateV2Store(JSON.parse(rawV2) as Partial<LearnStore>);
      writeRootStore(migrated);
      return migrated;
    }

    return writeRootStore(emptyRootStore());
  } catch {
    return emptyRootStore();
  }
}

export function writeRootStore(root: LearnRootStore): LearnRootStore {
  const normalized = normalizeRoot(root);
  try {
    localStorage.setItem(ROOT_KEY, JSON.stringify(normalized));
    lastStorageWriteError = null;
  } catch (error) {
    lastStorageWriteError =
      error instanceof DOMException && error.name === 'QuotaExceededError'
        ? 'quota'
        : 'unavailable';
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('learn-storage-write'));
  }

  return normalized;
}

export function profileCount(root: LearnRootStore): number {
  return Object.keys(root.profiles).length;
}

export function hasDuplicateProfileName(
  root: LearnRootStore,
  name: string,
  excludeProfileId?: string,
): boolean {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return false;
  return Object.values(root.profiles).some(
    (entry) =>
      entry.profile.id !== excludeProfileId &&
      entry.profile.name.trim().toLowerCase() === normalized,
  );
}

export function updateActiveProfile(
  root: LearnRootStore,
  updater: (profile: ProfileData) => ProfileData,
): LearnRootStore {
  const activeId = root.activeProfileId;
  const current = root.profiles[activeId];
  if (!current) return root;

  return writeRootStore({
    ...root,
    profiles: {
      ...root.profiles,
      [activeId]: updater(current),
    },
  });
}

export function listProfiles(root: LearnRootStore): ChildProfile[] {
  return Object.values(root.profiles).map((entry) => entry.profile);
}

export function switchProfile(root: LearnRootStore, profileId: string): LearnRootStore {
  if (!root.profiles[profileId]) return root;
  return writeRootStore({ ...root, activeProfileId: profileId });
}

export function createProfile(
  root: LearnRootStore,
  name: string,
  ageGroup: AgeGroup,
  avatar: LearnerAvatar = 'boy',
): LearnRootStore {
  if (profileCount(root) >= MAX_PROFILES) return root;
  const trimmed = name.trim() || 'Learner';
  const profile = emptyProfileData(
    trimmed,
    ageGroup,
    avatar,
    root.settings.language ?? 'en',
  );
  return writeRootStore({
    ...root,
    activeProfileId: profile.profile.id,
    profiles: {
      ...root.profiles,
      [profile.profile.id]: profile,
    },
  });
}

export function updateProfileSettings(
  root: LearnRootStore,
  settings: Partial<LearnSettings>,
): LearnRootStore {
  const { language, ...rest } = settings;
  const nextRoot: LearnRootStore = {
    ...root,
    settings: {
      ...root.settings,
      ...rest,
      ...(language ? { language } : {}),
    },
  };

  if (language) {
    const activeId = root.activeProfileId;
    const active = root.profiles[activeId];
    if (active) {
      nextRoot.profiles = {
        ...root.profiles,
        [activeId]: {
          ...active,
          profile: { ...active.profile, language },
        },
      };
    }
  }

  return writeRootStore(nextRoot);
}

export function deleteProfile(root: LearnRootStore, profileId: string): LearnRootStore {
  const profileIds = Object.keys(root.profiles);
  if (profileIds.length <= 1 || !root.profiles[profileId]) {
    return root;
  }

  const { [profileId]: _removed, ...remainingProfiles } = root.profiles;
  const nextActiveId =
    root.activeProfileId === profileId
      ? profileIds.find((id) => id !== profileId) ?? profileIds[0]
      : root.activeProfileId;

  return writeRootStore({
    ...root,
    activeProfileId: nextActiveId,
    profiles: remainingProfiles,
  });
}
