import { useLearnI18n } from '../../../context/LearnI18nContext';
import { getActivityCount, getTotalActivityCount } from '../../../curriculum/nursery';
import { subjects } from '../../../curriculum/subjects';
import type { LearnStore } from '../../../storage/types';
import { FeedbackForm } from '../../FeedbackForm';

interface SupportPanelProps {
  store: LearnStore;
}

export function SupportPanel({ store }: SupportPanelProps) {
  const { tUi, tUiDigits, tSubject } = useLearnI18n();
  const sessions = store.sessions ?? { sessionsCompleted: 0, bySubject: {} };

  return (
    <>
      <div className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('parent.feedback.title')}</h2>
        <p className="learn-subtitle">{tUi('parent.feedback.subtitle')}</p>
        <FeedbackForm />
      </div>

      <div className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('parent.subjects')}</h2>
        <p className="learn-subtitle">
          {tUiDigits('parent.subjectsSummary', { count: getTotalActivityCount() })}
        </p>
        <ul className="learn-stat-list">
          {subjects.map((subject) => (
            <li key={subject.id}>
              <span>{tSubject(subject.id)}</span>
              <strong>
                {tUiDigits('parent.subjectRounds', {
                  rounds: sessions.bySubject[subject.id] ?? 0,
                  activities: getActivityCount(subject.id),
                })}
              </strong>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
