import { useLearnI18n } from '../context/LearnI18nContext';
import { getLocalizedSkillSummaries, getLocalizedSkillsNeedingPractice } from '../progress/mastery';
import type { LearnStore } from '../storage/types';

interface SkillProgressSectionProps {
  store: LearnStore;
}

function SkillRow({
  label,
  subjectLabel,
  correct,
  attempts,
  masteryPercent,
  statusEmoji,
  statusLabel,
  metaLabel,
}: {
  label: string;
  subjectLabel: string;
  correct: number;
  attempts: number;
  masteryPercent: number;
  statusEmoji: string;
  statusLabel: string;
  metaLabel: string;
}) {
  return (
    <li className="learn-skill-item">
      <div className="learn-skill-header">
        <div>
          <strong className="learn-skill-name">{label}</strong>
          <span className="learn-skill-subject">{subjectLabel}</span>
        </div>
        <span className="learn-skill-status">{statusEmoji} {statusLabel}</span>
      </div>
      <p className="learn-skill-meta">{metaLabel}</p>
      <div className="learn-skill-bar" aria-hidden="true">
        <span className="learn-skill-bar-fill" style={{ width: `${masteryPercent}%` }} />
      </div>
    </li>
  );
}

export function SkillProgressSection({ store }: SkillProgressSectionProps) {
  const { language, tUi, tUiDigits } = useLearnI18n();
  const needsPractice = getLocalizedSkillsNeedingPractice(store, language);
  const allSkills = getLocalizedSkillSummaries(store, language);

  function metaFor(skill: { correct: number; attempts: number; masteryPercent: number }) {
    return tUiDigits('skills.meta', {
      correct: skill.correct,
      attempts: skill.attempts,
      percent: skill.masteryPercent,
    });
  }

  if (allSkills.length === 0) {
    return (
      <section className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('skills.progress')}</h2>
        <p className="learn-subtitle">{tUi('skills.empty')}</p>
      </section>
    );
  }

  return (
    <>
      {needsPractice.length > 0 ? (
        <section className="learn-panel-section">
          <h2 className="learn-section-title">{tUi('skills.needsPractice')}</h2>
          <ul className="learn-skill-list">
            {needsPractice.map((skill) => (
              <SkillRow key={skill.key} {...skill} metaLabel={metaFor(skill)} />
            ))}
          </ul>
        </section>
      ) : null}

      <section className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('skills.all')}</h2>
        <ul className="learn-skill-list">
          {allSkills.map((skill) => (
            <SkillRow key={skill.key} {...skill} metaLabel={metaFor(skill)} />
          ))}
        </ul>
      </section>
    </>
  );
}
