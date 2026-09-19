import { useLearnI18n } from '../../../context/LearnI18nContext';
import { getSubjectMastery } from '../../../parent/analytics';
import { getLocalizedSkillSummaries } from '../../../progress/mastery';
import { badgesBySubject } from '../../../rewards/badges';
import type { LearnStore } from '../../../storage/types';

interface ProgressPanelProps {
  store: LearnStore;
}

function formatLastPracticed(iso?: string, language?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return '1d';
  return `${diffDays}d`;
}

export function ProgressPanel({ store }: ProgressPanelProps) {
  const { language, tUi, tBadge } = useLearnI18n();
  const subjectRows = getSubjectMastery(store, language);
  const skills = [...getLocalizedSkillSummaries(store, language)].sort(
    (left, right) => left.masteryPercent - right.masteryPercent,
  );
  const badges = store.rewards?.badges ?? [];

  return (
    <>
      <p className="learn-subtitle">{tUi('parent.progress.lifetimeHint')}</p>
      <div className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('parent.subjectMastery')}</h2>
        <table className="learn-data-table">
          <thead>
            <tr>
              <th>{tUi('parent.subject')}</th>
              <th>{tUi('parent.mastery')}</th>
              <th>{tUi('parent.last')}</th>
            </tr>
          </thead>
          <tbody>
            {subjectRows.map((row) => (
              <tr key={row.subjectId}>
                <td>{row.emoji} {row.label}</td>
                <td>{row.starsDisplay} {row.masteryPercent}%</td>
                <td>{formatLastPracticed(row.lastPracticedAt, language)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('parent.skillsWeakest')}</h2>
        {skills.length > 0 ? (
          <ul className="learn-skill-list">
            {skills.slice(0, 8).map((skill) => (
              <li key={skill.key} className="learn-skill-item">
                <div className="learn-skill-header">
                  <div>
                    <strong className="learn-skill-name">{skill.label}</strong>
                    <span className="learn-skill-subject">{skill.subjectLabel}</span>
                  </div>
                  <span className="learn-skill-status">{skill.masteryPercent}%</span>
                </div>
                <div className="learn-skill-bar" aria-hidden="true">
                  <span
                    className={`learn-skill-bar-fill ${skill.masteryPercent < 50 ? 'is-low' : skill.masteryPercent < 75 ? 'is-mid' : 'is-high'}`.trim()}
                    style={{ width: `${skill.masteryPercent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="learn-subtitle">{tUi('skills.empty')}</p>
        )}
      </div>

      <div className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('parent.badges')}</h2>
        <div className="learn-badge-grid">
          {Object.values(badgesBySubject).map((badge) => {
            const earned = badges.includes(badge.id);
            return (
              <div key={badge.id} className={`learn-badge-card ${earned ? '' : 'is-locked'}`.trim()}>
                <span className="learn-badge-emoji" aria-hidden="true">{badge.emoji}</span>
                <span className="learn-badge-name">{tBadge(badge.id)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
