import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = join(root, 'src', 'learn', 'content', 'nursery');

const { alphabetActivities } = await import(
  pathToFileURL(join(root, 'src/learn/curriculum/nursery/alphabet.ts')).href
);
const { numbersActivities } = await import(
  pathToFileURL(join(root, 'src/learn/curriculum/nursery/numbers.ts')).href
);
const { colorsActivities } = await import(
  pathToFileURL(join(root, 'src/learn/curriculum/nursery/colors.ts')).href
);
const { shapesActivities } = await import(
  pathToFileURL(join(root, 'src/learn/curriculum/nursery/shapes.ts')).href
);
const { animalsActivities } = await import(
  pathToFileURL(join(root, 'src/learn/curriculum/nursery/animals.ts')).href
);
const { gamesActivities } = await import(
  pathToFileURL(join(root, 'src/learn/curriculum/nursery/games.ts')).href
);
const { writingActivities } = await import(
  pathToFileURL(join(root, 'src/learn/curriculum/nursery/writing.ts')).href
);
const { serializeSubjectPack } = await import(
  pathToFileURL(join(root, 'src/learn/content/serialize.ts')).href
);

const packs = [
  ['alphabet', alphabetActivities],
  ['numbers', numbersActivities],
  ['colors', colorsActivities],
  ['shapes', shapesActivities],
  ['animals', animalsActivities],
  ['games', gamesActivities],
  ['writing', writingActivities],
];

for (const [subject, activities] of packs) {
  const dir = join(contentRoot, subject);
  mkdirSync(dir, { recursive: true });
  const pack = serializeSubjectPack(activities);
  writeFileSync(join(dir, 'activities.json'), `${JSON.stringify(pack, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${subject}: ${activities.length} activities`);
}
