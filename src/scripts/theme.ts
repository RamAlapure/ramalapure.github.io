export type ThemePref = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';
export const THEME_CHANGE_EVENT = 'themechange';

export function initThemeControls() {
  const root = document.documentElement;
  syncButtons(readPref(root));

  document.querySelectorAll<HTMLButtonElement>('[data-theme-pref]').forEach((button) => {
    if (button.dataset.themeBound === 'true') return;
    button.dataset.themeBound = 'true';
    button.addEventListener('click', () => {
      const pref = button.dataset.themePref;
      if (pref !== 'light' && pref !== 'dark' && pref !== 'system') return;
      applyPref(pref);
    });
  });

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const onSystemChange = () => {
    if (readPref(root) === 'system') applyPref('system');
  };
  media.addEventListener('change', onSystemChange);
}

export function applyPref(pref: ThemePref) {
  const root = document.documentElement;
  const previous = resolvedTheme(root);
  const resolved = resolvePref(pref);

  root.dataset.theme = resolved;
  root.dataset.themePref = pref;
  root.style.colorScheme = resolved;
  writePref(pref);
  syncButtons(pref);

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

function syncButtons(pref: ThemePref) {
  document.querySelectorAll<HTMLButtonElement>('[data-theme-pref]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.themePref === pref));
  });
}
