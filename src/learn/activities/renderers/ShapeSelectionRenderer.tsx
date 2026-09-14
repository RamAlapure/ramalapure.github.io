import { useState } from 'react';
import type { Activity, ShapeKind } from '../../app/types';
import { ActivityFeedback } from '../ActivityFeedback';
import { completeWithFeedback } from '../complete-with-feedback';

interface ShapeSelectionRendererProps {
  activity: Activity & { type: 'SHAPE_SELECTION' };
  onComplete: (correct: boolean) => void;
}

function shapeClass(kind: ShapeKind) {
  return `learn-shape learn-shape-${kind}`;
}

export function ShapeSelectionRenderer({ activity, onComplete }: ShapeSelectionRendererProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const answered = selectedId !== null;
  const correct = selectedId === activity.content.targetId;

  function handleSelect(shapeId: string) {
    if (answered) return;
    setSelectedId(shapeId);
    completeWithFeedback(shapeId === activity.content.targetId, onComplete);
  }

  return (
    <>
      <div className="learn-shape-grid">
        {activity.content.shapes.map((shape) => {
          const stateClass =
            answered && shape.id === selectedId
              ? shape.id === activity.content.targetId
                ? 'is-correct'
                : 'is-wrong'
              : '';

          return (
            <button
              key={shape.id}
              type="button"
              className={`learn-shape-choice ${stateClass}`.trim()}
              aria-label={shape.label}
              onClick={() => handleSelect(shape.id)}
              disabled={answered}
            >
              <span className={shapeClass(shape.kind)} aria-hidden="true" />
              <span className="learn-shape-label">{shape.label}</span>
            </button>
          );
        })}
      </div>
      <ActivityFeedback answered={answered} correct={correct} />
    </>
  );
}
