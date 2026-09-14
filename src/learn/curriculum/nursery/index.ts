import type { Activity, SubjectId } from '../../app/types';
import { loadAuthoredActivities } from '../../content/load';
import type { LearnLanguage } from '../../i18n/types';

export function getNurseryActivities(language: LearnLanguage = 'en'): Activity[] {
  return loadAuthoredActivities(language);
}

export function getActivitiesForSubject(
  subjectId: SubjectId,
  language: LearnLanguage = 'en',
): Activity[] {
  return getNurseryActivities(language).filter((activity) => activity.subjectId === subjectId);
}

export function getActivityCount(subjectId: SubjectId): number {
  return getActivitiesForSubject(subjectId, 'en').length;
}

export function getTotalActivityCount(): number {
  return getNurseryActivities('en').length;
}

/** @deprecated Use getNurseryActivities(language) */
export const nurseryActivities: Activity[] = getNurseryActivities('en');
