import type { Activity, SubjectId } from '../app/types';
import { localizeAuthoringList } from '../i18n/localize';
import type { LearnLanguage } from '../i18n/types';
import { compileActivities } from './compile';
import type { ActivityAuthoring, SubjectActivityPack } from './types';
import { validateAllPacks } from './validate';

const packModules = import.meta.glob<SubjectActivityPack>('./nursery/**/activities.json', {
  eager: true,
  import: 'default',
});

function loadPacks(): Array<{ path: string; pack: SubjectActivityPack }> {
  return Object.entries(packModules).map(([path, pack]) => ({ path, pack }));
}

function loadDefinitions(): ActivityAuthoring[] {
  const definitions: ActivityAuthoring[] = [];
  for (const { pack } of loadPacks()) {
    definitions.push(...pack.activities);
  }
  return definitions;
}

export function loadAuthoredActivities(language: LearnLanguage = 'en'): Activity[] {
  const packs = loadPacks();
  const issues = validateAllPacks(packs);
  if (issues.length > 0) {
    const detail = issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n');
    throw new Error(`Learn content validation failed:\n${detail}`);
  }

  const localized = localizeAuthoringList(loadDefinitions(), language);
  return compileActivities(localized);
}

export function getAuthoredActivityCount(subjectId: SubjectId): number {
  return loadDefinitions().filter((activity) => activity.subjectId === subjectId).length;
}
