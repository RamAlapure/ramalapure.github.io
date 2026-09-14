import type { LearnLanguage } from './types';
import { translateSkill, translateUi } from './translate';

export function buildSessionReason(
  language: LearnLanguage,
  focusSkillIds: string[],
  targetDifficulty: number,
  hasFresh: boolean,
): string {
  if (hasFresh) {
    return translateUi(language, 'session.freshRound');
  }

  if (focusSkillIds.length > 0) {
    const skills = focusSkillIds.map((skill) => translateSkill(language, skill)).join(', ');
    return translateUi(language, 'session.extraPractice', { skills });
  }

  if (targetDifficulty >= 4) {
    return translateUi(language, 'session.harder');
  }

  if (targetDifficulty <= 2) {
    return translateUi(language, 'session.gentler');
  }

  return translateUi(language, 'session.balanced');
}
