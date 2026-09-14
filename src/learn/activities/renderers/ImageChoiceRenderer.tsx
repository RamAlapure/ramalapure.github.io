import { useState } from 'react';
import type { Activity } from '../../app/types';
import { ActivityFeedback } from '../ActivityFeedback';
import { completeWithFeedback } from '../complete-with-feedback';

interface ImageChoiceRendererProps {
  activity: Activity & { type: 'IMAGE_CHOICE' };
  onComplete: (correct: boolean) => void;
}

export function ImageChoiceRenderer({ activity, onComplete }: ImageChoiceRendererProps) {
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
      <div className="learn-image-grid">
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
              className={`learn-image-choice ${stateClass}`.trim()}
              aria-label={choice.label}
              onClick={() => handleSelect(choice.id, choice.correct)}
              disabled={answered}
            >
              <span className="learn-image-choice-symbol" aria-hidden="true">{choice.image}</span>
              <span className="learn-image-choice-label">{choice.label}</span>
            </button>
          );
        })}
      </div>
      <ActivityFeedback answered={answered} correct={correct} />
    </>
  );
}
