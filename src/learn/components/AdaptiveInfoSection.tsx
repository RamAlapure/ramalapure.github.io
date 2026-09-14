import { useLearnI18n } from '../context/LearnI18nContext';
import { getLocalizedSkillsNeedingPractice, getLocalizedSkillSummaries } from '../progress/mastery';
import type { LearnStore } from '../storage/types';

interface AdaptiveInfoSectionProps {
  store: LearnStore;
}

export function AdaptiveInfoSection({ store }: AdaptiveInfoSectionProps) {
  const { language, tUi } = useLearnI18n();
  const needsPractice = getLocalizedSkillsNeedingPractice(store, language);
  const summaries = getLocalizedSkillSummaries(store, language);

  return (
    <section className="learn-panel-section">
      <h2 className="learn-section-title">{tUi('adaptive.title')}</h2>
      <p className="learn-subtitle">{tUi('adaptive.subtitle')}</p>
      <ul className="learn-adaptive-rules">
        <li>{tUi('adaptive.ruleLow')}</li>
        <li>{tUi('adaptive.ruleMid')}</li>
        <li>{tUi('adaptive.ruleHigh')}</li>
      </ul>

      {needsPractice.length > 0 ? (
        <p className="learn-adaptive-next">
          {tUi('adaptive.focusNext', {
            skills: needsPractice.map((skill) => skill.label).join(', '),
          })}
        </p>
      ) : summaries.length > 0 ? (
        <p className="learn-adaptive-next">{tUi('adaptive.progressing')}</p>
      ) : (
        <p className="learn-adaptive-next">{tUi('adaptive.start')}</p>
      )}
    </section>
  );
}
