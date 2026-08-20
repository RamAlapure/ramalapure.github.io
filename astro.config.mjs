import { defineConfig } from 'astro/config';
import { remarkDiagramToggle } from './src/plugins/remark-diagram-toggle.mjs';
import { remarkExternalLinks } from './src/plugins/remark-external-links.mjs';
import { remarkMermaidRow } from './src/plugins/remark-mermaid-row.mjs';
import { remarkMermaid } from './src/plugins/remark-mermaid.mjs';

export default defineConfig({
  site: 'https://alapureram.com',
  output: 'static',
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
