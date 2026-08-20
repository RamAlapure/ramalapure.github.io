import { initMermaid } from './mermaid-init';

const STORAGE_KEY = 'diagram-view';

export function initDiagramToggles() {
  const toggles = Array.from(document.querySelectorAll<HTMLElement>('.diagram-toggle'));
  const stored = readStoredView() ?? 'image';

  for (const toggle of toggles) {
    bindToggle(toggle);
    applyView(toggle, stored);
  }

  void initMermaid().catch((error) => {
    console.error('Mermaid render failed:', error);
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

function readStoredView(): 'image' | 'mermaid' | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'image' || value === 'mermaid') return value;
  } catch {
    return null;
  }
  return null;
}
