import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const contentRoot = join(root, 'src', 'learn', 'content', 'nursery');

const { validateAllPacks } = await import(
  pathToFileURL(join(root, 'src/learn/content/validate.ts')).href
);
const { localizeAuthoringList } = await import(
  pathToFileURL(join(root, 'src/learn/i18n/localize.ts')).href
);
const { compileActivities } = await import(
  pathToFileURL(join(root, 'src/learn/content/compile.ts')).href
);

function findActivityFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...findActivityFiles(fullPath));
    } else if (entry === 'activities.json') {
      files.push(fullPath);
    }
  }
  return files;
}

const packs = findActivityFiles(contentRoot).map((path) => ({
  path,
  pack: JSON.parse(readFileSync(path, 'utf8')),
}));

const issues = validateAllPacks(packs);
if (issues.length > 0) {
  console.error('Learn content validation failed:');
  for (const issue of issues) {
    console.error(`- ${issue.path}: ${issue.message}`);
  }
  process.exit(1);
}

const definitions = packs.flatMap((entry) => entry.pack.activities);
const activities = compileActivities(localizeAuthoringList(definitions, 'en'));
console.log(`Validated ${activities.length} activities across ${packs.length} subject packs.`);
