import react from '@astrojs/react';
import AstroPWA from '@vite-pwa/astro';
import { defineConfig } from 'astro/config';
import { remarkDiagramToggle } from './src/plugins/remark-diagram-toggle.mjs';
import { remarkExternalLinks } from './src/plugins/remark-external-links.mjs';
import { remarkMermaidRow } from './src/plugins/remark-mermaid-row.mjs';
import { remarkMermaid } from './src/plugins/remark-mermaid.mjs';

export default defineConfig({
  site: 'https://alapureram.com',
  output: 'static',
  integrations: [
    react(),
    AstroPWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'learn/icon.svg'],
      manifest: {
        name: 'Learn Playground',
        short_name: 'Learn',
        description: 'Playful early-learning activities for nursery-age children.',
        start_url: '/learn/',
        scope: '/learn/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#fff8f0',
        background_color: '#fff8f0',
        lang: 'en',
        icons: [
          {
            src: '/learn/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/learn/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/learn/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/learn/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/learn/',
        navigateFallbackAllowlist: [/^\/learn(\/|$)/],
        navigateFallbackDenylist: [/^\/(writing|projects|about|404)/],
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,json}'],
        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.mode === 'navigate' && url.pathname.startsWith('/learn'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'learn-pages',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 8,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        navigateFallback: '/learn/',
        navigateFallbackAllowlist: [/^\/learn(\/|$)/],
      },
      experimental: {
        directoryAndTrailingSlashHandler: true,
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMermaid, remarkMermaidRow, remarkDiagramToggle, remarkExternalLinks],
    shikiConfig: {
      theme: 'github-dark',
      wrap: false,
    },
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['mermaid', 'math'],
    },
  },
});
