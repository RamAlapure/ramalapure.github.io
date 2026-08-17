import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');

execSync('npm run build', { cwd: root, stdio: 'inherit' });

if (fs.existsSync(path.join(dist, '.git'))) {
  fs.rmSync(path.join(dist, '.git'), { recursive: true, force: true });
}

execSync('git init -b gh-pages', { cwd: dist, stdio: 'inherit' });
execSync('git add -A', { cwd: dist, stdio: 'inherit' });
execSync('git commit -m "Deploy alapureram.com"', { cwd: dist, stdio: 'inherit' });
execSync('git remote add origin https://github.com/RamAlapure/ramalapure.github.io.git', {
  cwd: dist,
  stdio: 'inherit',
});
execSync('git push -f origin gh-pages', { cwd: dist, stdio: 'inherit' });

console.log('Deployed to gh-pages branch. Pages will update at https://alapureram.com/');
