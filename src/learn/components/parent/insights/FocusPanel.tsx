import type { SubjectId } from '../../../app/types';
import { useLearnI18n } from '../../../context/LearnI18nContext';
import { getPracticeRecommendations } from '../../../parent/analytics';
import type { LearnStore } from '../../../storage/types';
import { AdaptiveInfoSection } from '../../AdaptiveInfoSection';

interface FocusPanelProps {
  store: LearnStore;
  onPracticeSubject: (subjectId: SubjectId) => void;
}

export function FocusPanel({ store, onPracticeSubject }: FocusPanelProps) {
  const { language, tUi, tUiDigits } = useLearnI18n();
  const recommendations = getPracticeRecommendations(store, language);

  return (
    <>
      {recommendations.length > 0 ? (
        <div className="learn-panel-section">
          <h2 className="learn-section-title">{tUi('parent.recommended')}</h2>
          <p className="learn-subtitle">{tUi('parent.needsPractice')}</p>
          <ul className="learn-recommendation-list">
            {recommendations.map((item) => (
              <li key={`${item.subjectId}-${item.skillLabel}`} className="learn-recommendation-item">
                <strong>{item.subjectEmoji} {item.subjectLabel}</strong>
                <span>{item.skillLabel}</span>
                <span className="learn-recommendation-suggestion">
                  {tUiDigits('parent.suggestedActivities', { count: item.suggestedCount })}
                </span>
                <button
                  type="button"
                  className="learn-btn learn-btn-compact"
                  onClick={() => onPracticeSubject(item.subjectId)}
                >
                  {tUi('parent.practiceNow')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <AdaptiveInfoSection store={store} />
    </>
  );
}
