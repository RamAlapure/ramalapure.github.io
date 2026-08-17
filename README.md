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

Push to `main`. GitHub Actions builds and publishes `dist/` to GitHub Pages.

In repo settings: Pages source = **GitHub Actions**. Custom domain `alapureram.com` (CNAME in `public/CNAME`).

## Content

- Writing: `src/content/writing/` (generated from `content-source/linkedin-post.md`)
- Projects: `src/content/projects/`
- Diagram images: `public/images/writing/`

Java/Spring AI agents are separate from this static site.
