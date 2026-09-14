import { useLearnI18n } from '../context/LearnI18nContext';
import { LanguageSelector } from './LanguageSelector';
import { ThemeSelector } from './ThemeSelector';

interface LearnHeaderActionsProps {
  onOpenParent?: () => void;
}

export function LearnHeaderActions({ onOpenParent }: LearnHeaderActionsProps) {
  const { tUi } = useLearnI18n();

  return (
    <div className="learn-header-actions">
      <LanguageSelector />
      <ThemeSelector />
      {onOpenParent ? (
        <button
          type="button"
          className="learn-icon-btn"
          aria-label={tUi('home.parentMode')}
          onClick={onOpenParent}
        >
          🔒
        </button>
      ) : null}
    </div>
  );
}
