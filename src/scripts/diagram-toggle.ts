import { initMermaid } from './mermaid-init';

const STORAGE_KEY = 'diagram-view';

export function initDiagramToggles() {
  const toggles = Array.from(document.querySelectorAll<HTMLElement>('.diagram-toggle'));
  const stored = readStoredView() ?? 'image';

  if (toggles.length === 0) {
    void initMermaid().catch((error) => {
      console.error('Mermaid render failed:', error);
    });
    return;
  }

  for (const toggle of toggles) {
    prepareMermaidPanel(toggle);
  }

  void initMermaid()
    .catch((error) => {
      console.error('Mermaid render failed:', error);
    })
    .finally(() => {
      for (const toggle of toggles) {
        clearMeasureStyles(toggle);
        applyView(toggle, stored);
        bindToggle(toggle);
      }
    });
}

function bindToggle(toggle: HTMLElement) {
  if (toggle.dataset.bound === 'true') return;
  toggle.dataset.bound = 'true';

  toggle.querySelectorAll<HTMLButtonElement>('.diagram-toggle-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.view;
      if (view !== 'image' && view !== 'mermaid') return;
      applyView(toggle, view);
      localStorage.setItem(STORAGE_KEY, view);
      if (view === 'mermaid') {
        void initMermaid();
      }
    });
  });
}

function applyView(toggle: HTMLElement, view: 'image' | 'mermaid') {
  toggle.dataset.view = view;

  toggle.querySelectorAll<HTMLElement>('.diagram-toggle-panel').forEach((panel) => {
    panel.hidden = panel.dataset.panel !== view;
  });

  toggle.querySelectorAll<HTMLButtonElement>('.diagram-toggle-btn').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.view === view));
  });
}

function prepareMermaidPanel(toggle: HTMLElement) {
  const imagePanel = toggle.querySelector<HTMLElement>('[data-panel="image"]');
  const mermaidPanel = toggle.querySelector<HTMLElement>('[data-panel="mermaid"]');
  if (!mermaidPanel) return;

  const width = imagePanel?.getBoundingClientRect().width || toggle.getBoundingClientRect().width || 640;
  mermaidPanel.hidden = false;
  mermaidPanel.style.position = 'absolute';
  mermaidPanel.style.left = '0';
  mermaidPanel.style.top = '0';
  mermaidPanel.style.visibility = 'hidden';
  mermaidPanel.style.pointerEvents = 'none';
  mermaidPanel.style.width = `${width}px`;
  mermaidPanel.style.minHeight = '1px';

  const columns = mermaidPanel.querySelectorAll<HTMLElement>('.diagram-row > .mermaid');
  if (columns.length > 0) {
    const colWidth = Math.floor((width - 16 * (columns.length - 1)) / columns.length);
    columns.forEach((column) => {
      column.style.width = `${Math.max(colWidth, 220)}px`;
      column.style.flex = '0 0 auto';
    });
  }
}

function clearMeasureStyles(toggle: HTMLElement) {
  const mermaidPanel = toggle.querySelector<HTMLElement>('[data-panel="mermaid"]');
  if (!mermaidPanel) return;
  mermaidPanel.style.position = '';
  mermaidPanel.style.left = '';
  mermaidPanel.style.top = '';
  mermaidPanel.style.visibility = '';
  mermaidPanel.style.pointerEvents = '';
  mermaidPanel.style.width = '';
  mermaidPanel.style.minHeight = '';
  mermaidPanel.querySelectorAll<HTMLElement>('.diagram-row > .mermaid').forEach((column) => {
    column.style.width = '';
    column.style.flex = '';
  });
}

function readStoredView(): 'image' | 'mermaid' | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'image' || value === 'mermaid') return value;
  } catch {
    return null;
  }
  return null;
}
