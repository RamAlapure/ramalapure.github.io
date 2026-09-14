import { useEffect, useState } from 'react';
import { ActivityEngine } from '../activities/ActivityEngine';
import type { Activity } from '../app/types';
import { useLearnAudio } from '../context/LearnAudioContext';
import { useLearnI18n } from '../context/LearnI18nContext';
import { AudioControls } from './AudioControls';

interface ActivityScreenProps {
  activity: Activity;
  subjectLabel: string;
  sessionProgress: { current: number; total: number };
  answerStreak: number;
  onComplete: (correct: boolean) => void;
  onBack: () => void;
}

export function ActivityScreen({
  activity,
  subjectLabel,
  sessionProgress,
  answerStreak,
  onComplete,
  onBack,
}: ActivityScreenProps) {
  const { speakInstruction } = useLearnAudio();
  const { language, tUi, tUiDigits } = useLearnI18n();
  const [confirmExit, setConfirmExit] = useState(false);

  useEffect(() => {
    speakInstruction(activity.instruction);
  }, [activity.instruction, language, speakInstruction]);

  function handleBack() {
    setConfirmExit(true);
  }

  return (
    <>
      <header className="learn-header">
        <div>
          <h1 className="learn-title">{subjectLabel}</h1>
          <p className="learn-subtitle">
            {tUiDigits('activity.progress', {
              current: sessionProgress.current,
              total: sessionProgress.total,
            })}
          </p>
        </div>
        <button type="button" className="learn-icon-btn" aria-label={tUi('nav.backHome')} onClick={handleBack}>
          ←
        </button>
      </header>

      <AudioControls />

      <div className="learn-session-progress" aria-hidden="true">
        {Array.from({ length: sessionProgress.total }, (_, index) => (
          <span
            key={index}
            className={`learn-session-dot ${index < sessionProgress.current ? 'is-done' : ''}`.trim()}
          />
        ))}
      </div>

      {answerStreak >= 2 ? (
        <p className="learn-streak-banner learn-pop" role="status">
          {tUiDigits('activity.streak', { count: answerStreak })}
        </p>
      ) : null}

      <section className="learn-panel" aria-live="polite">
        <p className="learn-instruction" id="learn-current-instruction">{activity.instruction}</p>
        <ActivityEngine activity={activity} onComplete={onComplete} />
      </section>

      {confirmExit ? (
        <div className="learn-modal-overlay" role="dialog" aria-modal="true">
          <div className="learn-confirm-dialog">
            <p className="learn-confirm-text">{tUi('activity.confirmExit')}</p>
            <div className="learn-confirm-actions">
              <button type="button" className="learn-btn learn-btn-secondary" onClick={() => setConfirmExit(false)}>
                {tUi('activity.confirmStay')}
              </button>
              <button type="button" className="learn-btn" onClick={onBack}>
                {tUi('activity.confirmLeave')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
