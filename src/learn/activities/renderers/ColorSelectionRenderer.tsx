import { useState } from 'react';
import type { Activity } from '../../app/types';
import { ActivityFeedback } from '../ActivityFeedback';
import { completeWithFeedback } from '../complete-with-feedback';

interface ColorSelectionRendererProps {
  activity: Activity & { type: 'COLOR_SELECTION' };
  onComplete: (correct: boolean) => void;
}

export function ColorSelectionRenderer({ activity, onComplete }: ColorSelectionRendererProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const answered = selectedId !== null;
  const correct = selectedId === activity.content.targetId;

  function handleSelect(swatcheId: string) {
    if (answered) return;
    setSelectedId(swatcheId);
    completeWithFeedback(swatcheId === activity.content.targetId, onComplete);
  }

  return (
    <>
      <div className="learn-color-grid">
        {activity.content.swatches.map((swatch) => {
          const stateClass =
            answered && swatch.id === selectedId
              ? swatch.id === activity.content.targetId
                ? 'is-correct'
                : 'is-wrong'
              : '';

          return (
            <button
              key={swatch.id}
              type="button"
              className={`learn-color-swatch ${stateClass}`.trim()}
              style={{ backgroundColor: swatch.color }}
              aria-label={swatch.label}
              onClick={() => handleSelect(swatch.id)}
              disabled={answered}
            />
          );
        })}
      </div>
      <ActivityFeedback answered={answered} correct={correct} />
    </>
  );
}
