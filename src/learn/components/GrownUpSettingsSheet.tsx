import { useEffect, useState } from 'react';
import { applyPref, THEME_CHANGE_EVENT, type ResolvedTheme } from '../../scripts/theme';
import { LANGUAGE_LABELS, useLearnI18n } from '../context/LearnI18nContext';
interface GrownUpSettingsSheetProps {
  onOpenParentHub: () => void;
  onClose: () => void;
}

function readResolvedTheme(): ResolvedTheme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function GrownUpSettingsSheet({ onOpenParentHub, onClose }: GrownUpSettingsSheetProps) {
  const { language, languages, setLanguage, tUi } = useLearnI18n();
  const [theme, setTheme] = useState<ResolvedTheme>(readResolvedTheme());

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
    <div
      className="learn-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={tUi('settings.grownUpTitle')}
      onClick={onClose}
    >
      <div className="learn-grownup-sheet" onClick={(event) => event.stopPropagation()}>
        <div className="learn-grownup-sheet-head">
          <h2 className="learn-section-title">{tUi('settings.grownUpTitle')}</h2>
          <button type="button" className="learn-icon-btn" aria-label={tUi('pin.cancel')} onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="learn-subtitle">{tUi('settings.grownUpHint')}</p>

        <div className="learn-grownup-field">
          <span className="learn-field-label">{tUi('parent.language')}</span>
          <div className="learn-setting-chips" role="group" aria-label={tUi('parent.language')}>
            {languages.map((code) => (
              <button
                key={code}
                type="button"
                className={`learn-profile-chip ${language === code ? 'is-active' : ''}`.trim()}
                aria-pressed={language === code}
                onClick={() => setLanguage(code)}
              >
                {LANGUAGE_LABELS[code]}
              </button>
            ))}
          </div>
        </div>

        <div className="learn-grownup-field">
          <span className="learn-field-label">{tUi('settings.theme')}</span>
          <div className="learn-setting-chips" role="group" aria-label={tUi('settings.theme')}>
            <button
              type="button"
              className={`learn-profile-chip ${theme === 'light' ? 'is-active' : ''}`.trim()}
              aria-pressed={theme === 'light'}
              onClick={() => selectTheme('light')}
            >
              ☀️ {tUi('settings.themeLight')}
            </button>
            <button
              type="button"
              className={`learn-profile-chip ${theme === 'dark' ? 'is-active' : ''}`.trim()}
              aria-pressed={theme === 'dark'}
              onClick={() => selectTheme('dark')}
            >
              🌙 {tUi('settings.themeDark')}
            </button>
          </div>
        </div>

        <button type="button" className="learn-btn learn-btn-secondary learn-grownup-parent-link" onClick={onOpenParentHub}>
          🔒 {tUi('home.openParentHub')}
        </button>
      </div>
    </div>
  );
}
