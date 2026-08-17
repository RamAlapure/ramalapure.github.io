import mermaid from 'mermaid';

let initialized = false;
const sources = new WeakMap<HTMLElement, string>();

export async function initMermaid() {
  captureSources();

  const diagrams = Array.from(document.querySelectorAll<HTMLElement>('.mermaid')).filter(
    (node) => !node.closest('[hidden]') && needsRender(node),
  );
  if (diagrams.length === 0) return;

  if (!initialized) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      securityLevel: 'loose',
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        nodeSpacing: 20,
        rankSpacing: 24,
        padding: 8,
      },
    });
    initialized = true;
  }

  for (const node of diagrams) {
    restoreSource(node);
  }

  await mermaid.run({ nodes: diagrams });
}

function needsRender(node: HTMLElement) {
  const svg = node.querySelector('svg');
  if (!svg) return true;
  return (node.textContent ?? '').includes('Syntax error');
}

function captureSources() {
  document.querySelectorAll<HTMLElement>('.mermaid').forEach((node) => {
    if (sources.has(node) || node.querySelector('svg')) return;
    sources.set(node, node.textContent ?? '');
  });
}

function restoreSource(node: HTMLElement) {
  const source = sources.get(node);
  if (source === undefined) return;
  node.removeAttribute('data-processed');
  node.removeAttribute('id');
  node.textContent = source;
}
