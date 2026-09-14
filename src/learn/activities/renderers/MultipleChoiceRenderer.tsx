import { useState } from 'react';
import type { Activity } from '../../app/types';
import { useLearnI18n } from '../../context/LearnI18nContext';
import { usesIndicScript } from '../../i18n/letters';
import { ActivityFeedback } from '../ActivityFeedback';
import { completeWithFeedback } from '../complete-with-feedback';

interface MultipleChoiceRendererProps {
  activity: Activity & { type: 'MULTIPLE_CHOICE' };
  onComplete: (correct: boolean) => void;
}

export function MultipleChoiceRenderer({ activity, onComplete }: MultipleChoiceRendererProps) {
  const { language } = useLearnI18n();
  const indicLetters =
    activity.subjectId === 'alphabet' &&
    activity.skill === 'letter-recognition' &&
    usesIndicScript(language);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const answered = selectedId !== null;
  const selected = activity.content.choices.find((choice) => choice.id === selectedId);
  const correct = selected?.correct ?? false;

  function handleSelect(choiceId: string, isCorrect: boolean) {
    if (answered) return;
    setSelectedId(choiceId);
    completeWithFeedback(isCorrect, onComplete);
  }

  return (
    <>
      <div className="learn-choices">
        {activity.content.choices.map((choice) => {
          const stateClass =
            answered && choice.id === selectedId
              ? choice.correct
                ? 'is-correct'
                : 'is-wrong'
              : '';

          return (
            <button
              key={choice.id}
              type="button"
              className={`learn-choice ${indicLetters ? 'is-indic-letter' : ''} ${stateClass}`.trim()}
              aria-label={choice.label}
              onClick={() => handleSelect(choice.id, choice.correct)}
              disabled={answered}
            >
              {choice.label}
            </button>
          );
        })}
      </div>
      <ActivityFeedback answered={answered} correct={correct} />
    </>
  );
}
