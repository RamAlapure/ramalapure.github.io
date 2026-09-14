export type LearnLanguage = 'en' | 'hi' | 'mr';

export const LEARN_LANGUAGES: LearnLanguage[] = ['en', 'hi', 'mr'];

export const LANGUAGE_LABELS: Record<LearnLanguage, string> = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
};

/** BCP 47 tags for browser speech synthesis. */
export const SPEECH_LOCALES: Record<LearnLanguage, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  mr: 'mr-IN',
};

export interface TranslationCatalog {
  activities: Record<string, string>;
  ui: Record<string, string>;
  subjects: Record<string, string>;
  audio: Record<string, string>;
  skills: Record<string, string>;
  badges: Record<string, string>;
  mastery: Record<string, string>;
}
