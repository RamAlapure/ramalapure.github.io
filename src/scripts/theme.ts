export type ThemePref = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';
export const THEME_CHANGE_EVENT = 'themechange';

export function initThemeControls() {
  const button = document.querySelector<HTMLButtonElement>('.theme-toggle');
  if (!button) return;

  syncToggle(button, resolvedTheme(document.documentElement));

  if (button.dataset.themeBound !== 'true') {
    button.dataset.themeBound = 'true';
    button.addEventListener('click', () => {
      const next: ResolvedTheme = resolvedTheme(document.documentElement) === 'dark' ? 'light' : 'dark';
      applyPref(next);
    });
  }

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', () => {
    if (readPref(document.documentElement) === 'system') applyPref('system');
  });
}

export function applyPref(pref: ThemePref) {
  const root = document.documentElement;
  const previous = resolvedTheme(root);
  const resolved = resolvePref(pref);

  root.dataset.theme = resolved;
  root.dataset.themePref = pref;
  root.style.colorScheme = resolved;
  writePref(pref);

  const button = document.querySelector<HTMLButtonElement>('.theme-toggle');
  if (button) syncToggle(button, resolved);

  if (previous !== resolved) {
    document.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, { detail: { pref, resolved } }),
    );
  }
}

function resolvePref(pref: ThemePref): ResolvedTheme {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref;
}

function resolvedTheme(root: HTMLElement): ResolvedTheme {
  return root.dataset.theme === 'light' ? 'light' : 'dark';
}

function readPref(root: HTMLElement): ThemePref {
  const fromDom = root.dataset.themePref;
  if (fromDom === 'light' || fromDom === 'dark' || fromDom === 'system') return fromDom;
  return 'system';
}

function writePref(pref: ThemePref) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    /* private mode */
  }
}

function syncToggle(button: HTMLButtonElement, resolved: ResolvedTheme) {
  const next = resolved === 'dark' ? 'light' : 'dark';
  button.setAttribute('aria-label', `Switch to ${next} theme`);
}
