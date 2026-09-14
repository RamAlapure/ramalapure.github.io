import { useMemo, useState } from 'react';
import type { Activity } from '../../app/types';
import { useLearnI18n } from '../../context/LearnI18nContext';
import { digitLabel } from '../../i18n/letters';
import { ActivityFeedback } from '../ActivityFeedback';
import { completeWithFeedback } from '../complete-with-feedback';

interface CountingRendererProps {
  activity: Activity & { type: 'COUNTING' };
  onComplete: (correct: boolean) => void;
}

export function CountingRenderer({ activity, onComplete }: CountingRendererProps) {
  const { tUi, tUiDigits, language, formatCount } = useLearnI18n();
  const tapToCount = activity.content.count >= 7;
  const [tapped, setTapped] = useState<Set<number>>(() => new Set());
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const correct = selected === activity.content.count;
  const items = useMemo(
    () => Array.from({ length: activity.content.count }, (_, index) => index),
    [activity.content.count],
  );

  function handleTap(index: number) {
    if (!tapToCount || answered) return;
    setTapped((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function handleSelect(value: number) {
    if (answered) return;
    if (tapToCount && tapped.size < activity.content.count) {
      return;
    }
    setSelected(value);
    completeWithFeedback(value === activity.content.count, onComplete);
  }

  return (
    <>
      {tapToCount ? (
        <p className="learn-count-hint">{tUi('counting.tapEach')}</p>
      ) : null}
      <div
        className={`learn-count-display ${tapToCount ? 'is-tappable' : ''} ${
          activity.content.count >= 7 ? 'is-dense' : ''
        }`.trim()}
        aria-label={tUiDigits('counting.itemsAria', { count: activity.content.count })}
      >
        {items.map((index) => (
          <button
            key={index}
            type="button"
            className={`learn-count-item ${tapped.has(index) ? 'is-tapped' : ''}`.trim()}
            onClick={() => handleTap(index)}
            disabled={!tapToCount || answered}
            aria-label={tUiDigits('counting.itemAria', { index: index + 1 })}
          >
            {activity.content.itemEmoji}
          </button>
        ))}
      </div>
      {tapToCount ? (
        <p className="learn-count-tally" aria-live="polite">
          {tapped.size < activity.content.count
            ? tUi('counting.tapAllFirst')
            : tUi('counting.tapped', { count: digitLabel(tapped.size, language) })}
        </p>
      ) : null}
      <div className="learn-choices learn-count-choices">
        {activity.content.choices.map((value) => {
          const stateClass =
            answered && value === selected
              ? correct
                ? 'is-correct'
                : 'is-wrong'
              : '';

          return (
            <button
              key={value}
              type="button"
              className={`learn-choice ${stateClass}`.trim()}
              aria-label={formatCount(value)}
              onClick={() => handleSelect(value)}
              disabled={answered || (tapToCount && tapped.size < activity.content.count)}
            >
              {digitLabel(value, language)}
            </button>
          );
        })}
      </div>
      <ActivityFeedback answered={answered} correct={correct} />
    </>
  );
}
