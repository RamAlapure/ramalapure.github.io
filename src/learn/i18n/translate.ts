import { getCatalog } from './catalog';
import type { LearnLanguage } from './types';

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

function lookupSection(
  catalog: ReturnType<typeof getCatalog>,
  section: keyof ReturnType<typeof getCatalog>,
  key: string,
): string | undefined {
  const value = catalog[section][key];
  return typeof value === 'string' ? value : undefined;
}

export function translate(
  language: LearnLanguage,
  section: keyof ReturnType<typeof getCatalog>,
  key: string,
  params?: Record<string, string | number>,
): string {
  const primary = lookupSection(getCatalog(language), section, key);
  if (primary) return interpolate(primary, params);

  if (language !== 'en') {
    const fallback = lookupSection(getCatalog('en'), section, key);
    if (fallback) return interpolate(fallback, params);
  }

  return key;
}

export function translateActivity(
  language: LearnLanguage,
  instructionKey: string,
  params?: Record<string, string | number>,
): string {
  return translate(language, 'activities', instructionKey, params);
}

export function translateUi(
  language: LearnLanguage,
  key: string,
  params?: Record<string, string | number>,
): string {
  return translate(language, 'ui', key, params);
}

export function translateSubject(language: LearnLanguage, subjectId: string): string {
  return translate(language, 'subjects', subjectId);
}

export function translateAudio(
  language: LearnLanguage,
  key: string,
  params?: Record<string, string | number>,
): string {
  return translate(language, 'audio', key, params);
}

export function translateSkill(language: LearnLanguage, skillId: string): string {
  return translate(language, 'skills', skillId);
}

export function translateBadge(language: LearnLanguage, subjectId: string): string {
  return translate(language, 'badges', subjectId);
}

export function translateMastery(language: LearnLanguage, level: string): string {
  return translate(language, 'mastery', level);
}

export function translateTracePattern(
  language: LearnLanguage,
  patternId: string,
): string | undefined {
  const key = `tracing.pattern.${patternId}`;
  const translated = translateUi(language, key);
  return translated === key ? undefined : translated;
}

export function localeTag(language: LearnLanguage): string {
  switch (language) {
    case 'hi':
      return 'hi-IN';
    case 'mr':
      return 'mr-IN';
    default:
      return 'en-US';
  }
}
