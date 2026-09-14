import { digitLabel } from './letters';
import type { LearnLanguage } from './types';

export function localizeCount(value: number | string, language: LearnLanguage): string {
  return digitLabel(value, language);
}

export function localizeUiParams(
  language: LearnLanguage,
  params?: Record<string, string | number>,
): Record<string, string | number> | undefined {
  if (!params) {
    return params;
  }

  const localized: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
      localized[key] = digitLabel(value, language);
    } else {
      localized[key] = value;
    }
  }
  return localized;
}
