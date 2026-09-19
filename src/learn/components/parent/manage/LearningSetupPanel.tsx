import { useEffect, useState } from 'react';
import type { SubjectId } from '../../../app/types';
import { getActivityCount, getTotalActivityCount } from '../../../curriculum/nursery';
import { subjects } from '../../../curriculum/subjects';
import { useLearnI18n } from '../../../context/LearnI18nContext';
import {
  DAILY_LIMIT_OPTIONS,
  getLearnPreferences,
  SESSION_LENGTH_OPTIONS,
} from '../../../storage/preferences';
import type { DifficultyMode, LearnPreferences, LearnStore } from '../../../storage/types';

interface LearningSetupPanelProps {
  store: LearnStore;
  onUpdatePreferences: (preferences: Partial<LearnPreferences>) => void;
}

export function LearningSetupPanel({ store, onUpdatePreferences }: LearningSetupPanelProps) {
  const { tUi, tUiDigits, tSubject } = useLearnI18n();
  const current = getLearnPreferences(store);
  const [sessionLength, setSessionLength] = useState(current.sessionLength ?? 4);
  const [dailyGoal, setDailyGoal] = useState(current.dailyGoal ?? 12);
  const [difficultyMode, setDifficultyMode] = useState<DifficultyMode>(current.difficultyMode ?? 'adaptive');
  const [dailyLimitMinutes, setDailyLimitMinutes] = useState(current.dailyLimitMinutes ?? 0);
  const [enabledSubjects, setEnabledSubjects] = useState<SubjectId[]>(
    current.enabledSubjects ?? subjects.map((subject) => subject.id),
  );
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const prefs = getLearnPreferences(store);
    setSessionLength(prefs.sessionLength ?? 4);
    setDailyGoal(prefs.dailyGoal ?? 12);
    setDifficultyMode(prefs.difficultyMode ?? 'adaptive');
    setDailyLimitMinutes(prefs.dailyLimitMinutes ?? 0);
    setEnabledSubjects(prefs.enabledSubjects ?? subjects.map((subject) => subject.id));
    setSaveMessage('');
  }, [store.profile?.id, store.preferences]);

  function toggleSubject(subjectId: SubjectId) {
    setEnabledSubjects((currentSubjects) => {
      if (currentSubjects.includes(subjectId)) {
        if (currentSubjects.length <= 1) return currentSubjects;
        return currentSubjects.filter((id) => id !== subjectId);
      }
      return [...currentSubjects, subjectId];
    });
    setSaveMessage('');
  }

  function save() {
    onUpdatePreferences({
      sessionLength,
      dailyGoal: Math.max(1, Math.min(30, dailyGoal)),
      difficultyMode,
      dailyLimitMinutes,
      enabledSubjects,
    });
    setSaveMessage(tUi('parent.saved'));
  }

  return (
    <div className="learn-panel-section">
      <h2 className="learn-section-title">{tUi('parent.manage.learning')}</h2>

      <div className="learn-dashboard-card learn-form-stack">
        <h3 className="learn-dashboard-heading">{tUi('parent.learning.roundGoal')}</h3>

        <label className="learn-field" htmlFor="learning-session-length">
          <span className="learn-field-label">{tUi('parent.learning.sessionLength')}</span>
          <select
            id="learning-session-length"
            className="learn-text-input"
            value={sessionLength}
            onChange={(event) => {
              setSessionLength(Number(event.target.value));
              setSaveMessage('');
            }}
          >
            {SESSION_LENGTH_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {tUi('parent.learning.sessionOption', { count: size })}
              </option>
            ))}
          </select>
        </label>

        <label className="learn-field" htmlFor="learning-daily-goal">
          <span className="learn-field-label">{tUi('parent.learning.dailyGoal')}</span>
          <input
            id="learning-daily-goal"
            className="learn-text-input"
            type="number"
            min={1}
            max={30}
            value={dailyGoal}
            onChange={(event) => {
              setDailyGoal(Number(event.target.value));
              setSaveMessage('');
            }}
          />
        </label>

        <label className="learn-field" htmlFor="learning-difficulty">
          <span className="learn-field-label">{tUi('parent.learning.difficulty')}</span>
          <select
            id="learning-difficulty"
            className="learn-text-input"
            value={difficultyMode}
            onChange={(event) => {
              setDifficultyMode(event.target.value as DifficultyMode);
              setSaveMessage('');
            }}
          >
            <option value="adaptive">{tUi('parent.learning.difficultyAdaptive')}</option>
            <option value="easier">{tUi('parent.learning.difficultyEasier')}</option>
            <option value="harder">{tUi('parent.learning.difficultyHarder')}</option>
          </select>
        </label>

        <label className="learn-field" htmlFor="learning-time-limit">
          <span className="learn-field-label">{tUi('parent.learning.dailyLimit')}</span>
          <select
            id="learning-time-limit"
            className="learn-text-input"
            value={dailyLimitMinutes}
            onChange={(event) => {
              setDailyLimitMinutes(Number(event.target.value));
              setSaveMessage('');
            }}
          >
            {DAILY_LIMIT_OPTIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {minutes === 0 ? tUi('parent.learning.limitOff') : tUi('parent.learning.limitMinutes', { count: minutes })}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="learn-dashboard-card">
        <h3 className="learn-dashboard-heading">{tUi('parent.learning.subjects')}</h3>
        <p className="learn-subtitle">
          {tUiDigits('parent.subjectsSummary', { count: getTotalActivityCount() })}
        </p>
        <table className="learn-data-table learn-subject-table">
          <thead>
            <tr>
              <th>{tUi('parent.subject')}</th>
              <th className="is-num">{tUi('parent.learning.activityColumn')}</th>
              <th className="is-check">{tUi('parent.learning.show')}</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => {
              const enabled = enabledSubjects.includes(subject.id);
              return (
                <tr key={subject.id}>
                  <td>{subject.emoji} {tSubject(subject.id)}</td>
                  <td className="is-num">{getActivityCount(subject.id)}</td>
                  <td className="is-check">
                    <input
                      type="checkbox"
                      checked={enabled}
                      aria-label={tUi('parent.learning.showSubject', { subject: tSubject(subject.id) })}
                      onChange={() => toggleSubject(subject.id)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button type="button" className="learn-btn" onClick={save}>
        {tUi('parent.learning.save')}
      </button>
      {saveMessage ? <p className="learn-subtitle" role="status">{saveMessage}</p> : null}
    </div>
  );
}
