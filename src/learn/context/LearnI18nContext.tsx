import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { localizeCount, localizeUiParams } from '../i18n/digits';
import {
  translateAudio,
  translateBadge,
  translateMastery,
  translateSkill,
  translateSubject,
  translateUi,
} from '../i18n/translate';
import type { LearnLanguage } from '../i18n/types';
import { LANGUAGE_LABELS, LEARN_LANGUAGES } from '../i18n/types';
import type { LearnSettings } from '../storage/types';

interface LearnI18nContextValue {
  language: LearnLanguage;
  languages: LearnLanguage[];
  languageLabel: string;
  tUi: (key: string, params?: Record<string, string | number>) => string;
  tUiDigits: (key: string, params?: Record<string, string | number>) => string;
  tSubject: (subjectId: string) => string;
  tSkill: (skillId: string) => string;
  tBadge: (subjectId: string) => string;
  tMastery: (level: string) => string;
  tAudio: (key: string, params?: Record<string, string | number>) => string;
  formatCount: (value: number | string) => string;
  setLanguage: (language: LearnLanguage) => void;
}

const LearnI18nContext = createContext<LearnI18nContextValue | null>(null);

interface LearnI18nProviderProps {
  settings: LearnSettings;
  onSettingsChange: (settings: Partial<LearnSettings>) => void;
  children: ReactNode;
}

export function LearnI18nProvider({
  settings,
  onSettingsChange,
  children,
}: LearnI18nProviderProps) {
  const language = settings.language ?? 'en';

  const value = useMemo<LearnI18nContextValue>(
    () => ({
      language,
      languages: LEARN_LANGUAGES,
      languageLabel: LANGUAGE_LABELS[language],
      tUi: (key, params) => translateUi(language, key, params),
      tUiDigits: (key, params) =>
        translateUi(language, key, localizeUiParams(language, params)),
      tSubject: (subjectId) => translateSubject(language, subjectId),
      tSkill: (skillId) => translateSkill(language, skillId),
      tBadge: (subjectId) => translateBadge(language, subjectId),
      tMastery: (level) => translateMastery(language, level),
      formatCount: (value) => localizeCount(value, language),
      tAudio: (key, params) =>
        translateAudio(language, key, localizeUiParams(language, params)),
      setLanguage: (nextLanguage) => onSettingsChange({ language: nextLanguage }),
    }),
    [language, onSettingsChange],
  );

  return <LearnI18nContext.Provider value={value}>{children}</LearnI18nContext.Provider>;
}

export function useLearnI18n(): LearnI18nContextValue {
  const context = useContext(LearnI18nContext);
  if (!context) {
    throw new Error('useLearnI18n must be used within LearnI18nProvider');
  }
  return context;
}

export { LANGUAGE_LABELS, LEARN_LANGUAGES };
