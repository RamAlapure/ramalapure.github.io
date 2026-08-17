# alapureram.com

Static portfolio site (Astro) for [alapureram.com](https://alapureram.com), deployed via GitHub Pages.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Build runs `scripts/split-posts.mjs` (reads `content-source/linkedin-post.md`) then `astro build`.

## Deploy

**Current:** push built output to the `gh-pages` branch (GitHub Pages serves that branch at `alapureram.com`).

```bash
node scripts/deploy-gh-pages.mjs
```

**Future (GitHub Actions):** after granting `workflow` scope to your GitHub token, push `.github/workflows/deploy.yml` and set Pages source to **GitHub Actions** in repo settings.

Push to `main` only updates source; run the deploy script above to publish.

## Content

- Writing: `src/content/writing/` (generated from `content-source/linkedin-post.md`)
- Projects: `src/content/projects/`
- Diagram images: `public/images/writing/`

Java/Spring AI agents are separate from this static site.
