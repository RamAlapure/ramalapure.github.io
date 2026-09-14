import type { LearnLanguage, TranslationCatalog } from './types';
import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';

const catalogs: Record<LearnLanguage, TranslationCatalog> = {
  en,
  hi,
  mr,
};

export function getCatalog(language: LearnLanguage): TranslationCatalog {
  return catalogs[language];
}

export function getAllCatalogs(): Record<LearnLanguage, TranslationCatalog> {
  return catalogs;
}
