import type { ActivityType, SubjectId } from '../app/types';
import { localizeAuthoring } from '../i18n/localize';
import { getCatalog } from '../i18n/catalog';
import { compileActivity } from './compile';
import type { ActivityAuthoring, ContentValidationIssue, SubjectActivityPack } from './types';

const ACTIVITY_TYPES: ActivityType[] = [
  'MULTIPLE_CHOICE',
  'IMAGE_CHOICE',
  'COUNTING',
  'MATCHING',
  'COLOR_SELECTION',
  'SHAPE_SELECTION',
  'TRACING',
];

const SUBJECT_IDS: SubjectId[] = [
  'alphabet',
  'numbers',
  'colors',
  'shapes',
  'animals',
  'games',
  'writing',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pushIfMissing(
  issues: ContentValidationIssue[],
  path: string,
  value: unknown,
  label: string,
): void {
  if (value === undefined || value === null || value === '') {
    issues.push({ path, message: `${label} is required.` });
  }
}

function validateAuthoring(definition: unknown, path: string): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  if (!isRecord(definition)) {
    return [{ path, message: 'Activity must be an object.' }];
  }

  pushIfMissing(issues, `${path}.id`, definition.id, 'id');
  pushIfMissing(issues, `${path}.type`, definition.type, 'type');
  pushIfMissing(issues, `${path}.subjectId`, definition.subjectId, 'subjectId');
  pushIfMissing(issues, `${path}.skill`, definition.skill, 'skill');
  pushIfMissing(issues, `${path}.instructionKey`, definition.instructionKey, 'instructionKey');

  if (typeof definition.instructionKey === 'string' && !getCatalog('en').activities[definition.instructionKey]) {
    issues.push({
      path: `${path}.instructionKey`,
      message: `Missing English translation for activity key: ${definition.instructionKey}`,
    });
  }

  if (definition.type && !ACTIVITY_TYPES.includes(definition.type as ActivityType)) {
    issues.push({ path: `${path}.type`, message: `Unknown activity type: ${definition.type}` });
  }

  if (definition.subjectId && !SUBJECT_IDS.includes(definition.subjectId as SubjectId)) {
    issues.push({ path: `${path}.subjectId`, message: `Unknown subject: ${definition.subjectId}` });
  }

  if (issues.length > 0) return issues;

  try {
    const localized = localizeAuthoring(definition as ActivityAuthoring, 'en');
    compileActivity(localized);
  } catch (error) {
    issues.push({
      path,
      message: error instanceof Error ? error.message : 'Failed to compile activity.',
    });
  }

  return issues;
}

export function validateSubjectPack(pack: unknown, filePath: string): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];
  if (!isRecord(pack)) {
    return [{ path: filePath, message: 'Pack must be an object.' }];
  }

  if (!Array.isArray(pack.activities)) {
    return [{ path: filePath, message: 'Pack must include an activities array.' }];
  }

  const ids = new Set<string>();
  pack.activities.forEach((activity, index) => {
    const activityPath = `${filePath}.activities[${index}]`;
    issues.push(...validateAuthoring(activity, activityPath));

    if (isRecord(activity) && typeof activity.id === 'string') {
      if (ids.has(activity.id)) {
        issues.push({ path: activityPath, message: `Duplicate activity id: ${activity.id}` });
      }
      ids.add(activity.id);
    }
  });

  return issues;
}

export function validateAllPacks(packs: Array<{ path: string; pack: SubjectActivityPack }>): ContentValidationIssue[] {
  const globalIds = new Set<string>();
  const issues: ContentValidationIssue[] = [];

  for (const { path, pack } of packs) {
    issues.push(...validateSubjectPack(pack, path));
    for (const activity of pack.activities) {
      if (globalIds.has(activity.id)) {
        issues.push({ path, message: `Duplicate activity id across packs: ${activity.id}` });
      }
      globalIds.add(activity.id);
    }
  }

  return issues;
}
