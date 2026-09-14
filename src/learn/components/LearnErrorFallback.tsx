import { useLearnI18n } from '../context/LearnI18nContext';

interface LearnErrorFallbackProps {
  onReset: () => void;
}

export function LearnErrorFallback({ onReset }: LearnErrorFallbackProps) {
  const { tUi } = useLearnI18n();

  return (
    <div className="learn-panel learn-error-panel" role="alert">
      <h1 className="learn-title">{tUi('error.title')}</h1>
      <p className="learn-subtitle">{tUi('error.subtitle')}</p>
      <button type="button" className="learn-btn" onClick={onReset}>
        {tUi('error.backHome')}
      </button>
    </div>
  );
}
