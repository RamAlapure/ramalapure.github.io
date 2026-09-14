import { LANGUAGE_LABELS, useLearnI18n } from '../context/LearnI18nContext';
import type { LearnLanguage } from '../i18n/types';

export function LanguageSelector() {
  const { language, languages, setLanguage, tUi } = useLearnI18n();

  return (
    <select
      className="learn-language-select"
      aria-label={tUi('home.language')}
      value={language}
      onChange={(event) => setLanguage(event.target.value as LearnLanguage)}
    >
      {languages.map((code) => (
        <option key={code} value={code}>
          {LANGUAGE_LABELS[code]}
        </option>
      ))}
    </select>
  );
}
