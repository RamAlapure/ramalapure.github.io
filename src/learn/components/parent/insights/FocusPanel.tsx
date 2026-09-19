import type { SubjectId } from '../../../app/types';
import { subjects } from '../../../curriculum/subjects';
import { buildAdaptiveSession } from '../../../curriculum/session';
import { useLearnI18n } from '../../../context/LearnI18nContext';
import { getPracticeRecommendations } from '../../../parent/analytics';
import type { LearnStore } from '../../../storage/types';

interface FocusPanelProps {
  store: LearnStore;
  onPracticeSubject: (subjectId: SubjectId) => void;
}

function difficultyLabel(target: number, tUi: (key: string) => string): string {
  if (target <= 2) return tUi('parent.focus.difficultyGentle');
  if (target >= 4) return tUi('parent.focus.difficultyChallenging');
  return tUi('parent.focus.difficultyBalanced');
}

export function FocusPanel({ store, onPracticeSubject }: FocusPanelProps) {
  const { language, tUi, tUiDigits, tSubject, tSkill } = useLearnI18n();
  const recommendations = getPracticeRecommendations(store, language);
  const focusSubjectId = recommendations[0]?.subjectId ?? store.sessions?.lastSubject;
  const subjectMeta = subjects.find((subject) => subject.id === focusSubjectId);
  const nextPlan = focusSubjectId ? buildAdaptiveSession(focusSubjectId, store) : null;
  const skillIds = nextPlan ? [...new Set(nextPlan.activities.map((activity) => activity.skill))] : [];
  const skillLabels = skillIds.map((skillId) => tSkill(skillId));
  const suggestedSubject = recommendations.length > 0;

  return (
    <>
      <p className="learn-subtitle">{tUi('parent.focus.lifetimeHint')}</p>

      {nextPlan && focusSubjectId && subjectMeta ? (
        <div className="learn-panel-section learn-focus-next">
          <h2 className="learn-section-title">{tUi('parent.focus.nextRound')}</h2>
          <p className="learn-focus-subject">
            <span className="learn-focus-subject-emoji" aria-hidden="true">{subjectMeta.emoji}</span>
            <strong>{tSubject(focusSubjectId)}</strong>
          </p>
          <p className="learn-subtitle">
            {suggestedSubject ? tUi('parent.focus.suggestedBecause') : tUi('parent.focus.basedOnLast')}
          </p>

          {skillLabels.length > 0 ? (
            <p className="learn-focus-detail">
              {tUi('parent.focus.skillsLine', { skills: skillLabels.join(', ') })}
            </p>
          ) : (
            <p className="learn-focus-detail">{tUi('parent.focus.allSkillsStrong')}</p>
          )}

          <p className="learn-focus-meta">
            {tUiDigits('parent.focus.activityCount', { count: nextPlan.activities.length })}
            {' · '}
            {tUi('parent.focus.difficultyLine', {
              level: difficultyLabel(nextPlan.targetDifficulty, tUi),
            })}
          </p>

          {nextPlan.reason ? <p className="learn-subtitle">{nextPlan.reason}</p> : null}

          <button
            type="button"
            className="learn-btn learn-btn-compact learn-focus-practice"
            onClick={() => onPracticeSubject(focusSubjectId)}
          >
            {tUi('parent.practiceNow')}
          </button>
        </div>
      ) : (
        <div className="learn-panel-section learn-focus-next">
          <p className="learn-subtitle">{tUi('parent.focus.noData')}</p>
        </div>
      )}

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

      <details className="learn-focus-how">
        <summary className="learn-focus-how-summary">{tUi('adaptive.title')}</summary>
        <p className="learn-subtitle">{tUi('adaptive.subtitle')}</p>
        <ul className="learn-adaptive-rules">
          <li>{tUi('adaptive.ruleLow')}</li>
          <li>{tUi('adaptive.ruleMid')}</li>
          <li>{tUi('adaptive.ruleHigh')}</li>
        </ul>
      </details>
    </>
  );
}
