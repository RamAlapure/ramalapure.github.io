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
  const [tapOrder, setTapOrder] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const correct = selected === activity.content.count;
  const items = useMemo(
    () => Array.from({ length: activity.content.count }, (_, index) => index),
    [activity.content.count],
  );

  function handleTap(index: number) {
    if (!tapToCount || answered || tapOrder.includes(index)) return;
    setTapOrder((current) => [...current, index]);
  }

  function handleSelect(value: number) {
    if (answered) return;
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
        {items.map((index) => {
          const order = tapOrder.indexOf(index);
          const isTapped = order >= 0;
          return (
            <button
              key={index}
              type="button"
              className={`learn-count-item ${isTapped ? 'is-tapped' : ''}`.trim()}
              onClick={() => handleTap(index)}
              disabled={!tapToCount || answered || isTapped}
              aria-label={tUiDigits('counting.itemAria', { index: index + 1 })}
            >
              <span className="learn-count-emoji" aria-hidden="true">{activity.content.itemEmoji}</span>
              {isTapped ? (
                <span className="learn-count-order" aria-hidden="true">
                  {digitLabel(order + 1, language)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {tapToCount && tapOrder.length > 0 ? (
        <p className="learn-count-tally" aria-live="polite">
          {tUi('counting.tapped', { count: digitLabel(tapOrder.length, language) })}
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
              disabled={answered}
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
