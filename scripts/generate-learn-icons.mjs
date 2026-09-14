import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const outDir = join(root, 'public', 'learn');
const svgPath = join(outDir, 'icon.svg');

mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  const buffer = await sharp(svgPath).resize(size, size).png().toBuffer();
  writeFileSync(join(outDir, `icon-${size}.png`), buffer);
  console.log(`Wrote icon-${size}.png`);
}
