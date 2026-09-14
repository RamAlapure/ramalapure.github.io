import { useEffect, useState } from 'react';
import { applyPref, THEME_CHANGE_EVENT, type ResolvedTheme } from '../../scripts/theme';
import { useLearnI18n } from '../context/LearnI18nContext';

function readResolvedTheme(): ResolvedTheme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function ThemeSelector() {
  const { tUi } = useLearnI18n();
  const [theme, setTheme] = useState<ResolvedTheme>('light');

  useEffect(() => {
    setTheme(readResolvedTheme());

    function handleThemeChange() {
      setTheme(readResolvedTheme());
    }

    document.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => document.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  }, []);

  function selectTheme(next: ResolvedTheme) {
    if (next === theme) return;
    applyPref(next);
    setTheme(next);
  }

  return (
    <div className="learn-theme-select" role="group" aria-label={tUi('settings.theme')}>
      <button
        type="button"
        className={`learn-theme-option ${theme === 'light' ? 'is-active' : ''}`.trim()}
        aria-pressed={theme === 'light'}
        aria-label={tUi('settings.themeLight')}
        onClick={() => selectTheme('light')}
      >
        ☀️
      </button>
      <button
        type="button"
        className={`learn-theme-option ${theme === 'dark' ? 'is-active' : ''}`.trim()}
        aria-pressed={theme === 'dark'}
        aria-label={tUi('settings.themeDark')}
        onClick={() => selectTheme('dark')}
      >
        🌙
      </button>
    </div>
  );
}
