import type { LearnLanguage } from './types';

/** Latin activity option ids (a–j) mapped to Devanagari nursery letters. */
const DEVANAGARI_LETTERS: Record<string, string> = {
  a: 'अ',
  b: 'ब',
  c: 'क',
  d: 'द',
  e: 'ए',
  f: 'फ',
  g: 'ग',
  h: 'ह',
  i: 'ई',
  j: 'ज',
};

const DEVANAGARI_DIGITS: Record<string, string> = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
};

export function usesIndicScript(language: LearnLanguage): boolean {
  return language === 'hi' || language === 'mr';
}

export function letterLabel(latinId: string, language: LearnLanguage): string {
  const key = latinId.toLowerCase();
  if (language === 'en') {
    return key.toUpperCase();
  }
  return DEVANAGARI_LETTERS[key] ?? latinId;
}

export function digitLabel(value: string | number, language: LearnLanguage): string {
  const text = String(value);
  if (language === 'en') {
    return text;
  }
  return text.replace(/\d/g, (digit) => DEVANAGARI_DIGITS[digit] ?? digit);
}

export function letterFromActivityKey(instructionKey: string): string | null {
  const match = instructionKey.match(/(?:alphabet-letter|alphabet-picture|writing-letter)-([a-j])$/);
  return match?.[1] ?? null;
}

export function numberFromWritingKey(instructionKey: string): string | null {
  const match = instructionKey.match(/writing-number-(\d+)$/);
  return match?.[1] ?? null;
}

export function tracePatternIdForLetter(
  latin: string,
  language: LearnLanguage,
): `letter-${string}` | `devanagari-${string}` {
  const key = latin.toLowerCase();
  if (language === 'en') {
    return `letter-${key}`;
  }
  return `devanagari-${key}`;
}

export function tracePatternIdForNumber(
  digit: string,
  language: LearnLanguage,
): `number-${string}` | `devanagari-${string}` {
  const key = digit.toLowerCase();
  if (language === 'en') {
    return `number-${key}`;
  }
  return `devanagari-${key}`;
}
