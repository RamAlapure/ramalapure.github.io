import { useLearnI18n } from '../../../context/LearnI18nContext';
import { getSubjectSkillViews } from '../../../parent/analytics';
import { badgesBySubject } from '../../../rewards/badges';
import type { LearnStore } from '../../../storage/types';
import { SkillProgressSection } from '../../SkillProgressSection';

interface ProgressPanelProps {
  store: LearnStore;
}

export function ProgressPanel({ store }: ProgressPanelProps) {
  const { language, tUi, tUiDigits, tBadge } = useLearnI18n();
  const subjectViews = getSubjectSkillViews(store, language);
  const badges = store.rewards?.badges ?? [];

  return (
    <>
      <div className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('parent.skillsBySubject')}</h2>
        <ul className="learn-subject-stars-list">
          {subjectViews.map((subject) => (
            <li key={subject.subjectId}>
              <span>{subject.emoji} {subject.label}</span>
              <strong aria-label={tUiDigits('parent.starsAria', { count: subject.stars })}>
                {subject.starsDisplay}
              </strong>
            </li>
          ))}
        </ul>
      </div>

      <SkillProgressSection store={store} />

      <div className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('parent.badges')}</h2>
        {badges.length > 0 ? (
          <div className="learn-badge-grid">
            {badges.map((badgeId) => {
              const badge = badgesBySubject[badgeId];
              if (!badge) return null;
              return (
                <div key={badgeId} className="learn-badge-card">
                  <span className="learn-badge-emoji" aria-hidden="true">{badge.emoji}</span>
                  <span className="learn-badge-name">{tBadge(badgeId)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="learn-subtitle">{tUi('parent.badgesEmpty')}</p>
        )}
      </div>
    </>
  );
}
