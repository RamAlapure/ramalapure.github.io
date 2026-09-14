import { useEffect } from 'react';
import { useLearnAudio } from '../context/LearnAudioContext';
import { useLearnI18n } from '../context/LearnI18nContext';
import { POINTS_PER_CORRECT } from '../rewards/constants';

interface ActivityFeedbackProps {
  answered: boolean;
  correct: boolean;
}

export function ActivityFeedback({ answered, correct }: ActivityFeedbackProps) {
  const { speakSuccess, speakTryAgain } = useLearnAudio();
  const { tUi, tUiDigits } = useLearnI18n();

  useEffect(() => {
    if (!answered) return;
    if (correct) {
      speakSuccess();
      return;
    }
    speakTryAgain();
  }, [answered, correct, speakSuccess, speakTryAgain]);

  if (!answered) return null;

  if (correct) {
    return (
      <div className="learn-feedback-block learn-pop" role="status" aria-live="polite">
        <p className="learn-feedback is-correct">🎉 {tUi('feedback.great')}</p>
        <p className="learn-points-earned">
          ⭐ {tUiDigits('feedback.points', { points: POINTS_PER_CORRECT })}
        </p>
      </div>
    );
  }

  return (
    <div className="learn-feedback-block learn-gentle" role="status" aria-live="polite">
      <p className="learn-feedback is-encourage">😊 {tUi('feedback.almost')}</p>
      <p className="learn-feedback-sub">{tUi('feedback.tryAgain')}</p>
    </div>
  );
}
