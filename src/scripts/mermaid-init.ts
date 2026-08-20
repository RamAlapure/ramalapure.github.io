import mermaid from 'mermaid';

let initialized = false;
let mermaidTheme: 'dark' | 'default' | null = null;
let renderCount = 0;
const sources = new WeakMap<HTMLElement, string>();

export async function initMermaid() {
  captureSources();

  const nextTheme = document.documentElement.dataset.theme === 'light' ? 'default' : 'dark';
  const themeChanged = mermaidTheme !== null && mermaidTheme !== nextTheme;

  if (!initialized || themeChanged) {
    mermaid.initialize({
      startOnLoad: false,
      theme: nextTheme,
      securityLevel: 'loose',
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: false,
        nodeSpacing: 20,
        rankSpacing: 24,
        padding: 8,
      },
    });
    initialized = true;
    mermaidTheme = nextTheme;
  }

  const diagrams = Array.from(document.querySelectorAll<HTMLElement>('.mermaid')).filter(
    (node) => themeChanged || needsRender(node),
  );
  if (diagrams.length === 0) return;

  for (const node of diagrams) {
    const source = sources.get(node) ?? readSource(node);
    if (!source) continue;
    sources.set(node, source);

    node.removeAttribute('data-processed');
    node.removeAttribute('id');
    renderCount += 1;
    const id = `mermaid-svg-${renderCount}`;
    try {
      const { svg, bindFunctions } = await mermaid.render(id, source);
      node.innerHTML = svg;
      bindFunctions?.(node);
    } catch (error) {
      console.error('Mermaid render failed:', error);
      node.textContent = source;
    }
  }
}

function needsRender(node: HTMLElement) {
  const svg = node.querySelector('svg');
  if (!svg) return true;
  return (node.textContent ?? '').includes('Syntax error');
}

function captureSources() {
  document.querySelectorAll<HTMLElement>('.mermaid').forEach((node) => {
    if (sources.has(node)) return;
    const source = readSource(node);
    if (!source) return;
    sources.set(node, source);
  });
}

function readSource(node: HTMLElement) {
  const attr = node.getAttribute('data-diagram');
  if (attr) {
    const decoded = decodeDiagramAttr(attr);
    if (decoded) return decoded;
  }

  return (node.textContent ?? '').trim();
}

function decodeDiagramAttr(attr: string) {
  if (attr.includes('%')) {
    try {
      return decodeURIComponent(attr).trim();
    } catch {
      return '';
    }
  }

  try {
    const fromBase64 = decodeBase64(attr).trim();
    if (
      fromBase64.startsWith('flowchart') ||
      fromBase64.startsWith('graph') ||
      fromBase64.includes('-->')
    ) {
      return fromBase64;
    }
  } catch {
    // Not base64.
  }

  try {
    return decodeURIComponent(attr).trim();
  } catch {
    return '';
  }
}

function decodeBase64(value: string) {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
