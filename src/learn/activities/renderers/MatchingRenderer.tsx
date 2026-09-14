import { useMemo, useState } from 'react';
import type { Activity } from '../../app/types';
import { useLearnAudio } from '../../context/LearnAudioContext';
import { useLearnI18n } from '../../context/LearnI18nContext';
import { ActivityFeedback } from '../ActivityFeedback';
import { completeWithFeedback } from '../complete-with-feedback';

interface MatchingRendererProps {
  activity: Activity & { type: 'MATCHING' };
  onComplete: (correct: boolean) => void;
}

type MatchSide = 'left' | 'right';

interface MatchSelection {
  side: MatchSide;
  value: string;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function MatchingRenderer({ activity, onComplete }: MatchingRendererProps) {
  const { speakTryAgain } = useLearnAudio();
  const { tUi } = useLearnI18n();
  const leftItems = useMemo(
    () => activity.content.pairs.map((pair) => pair.left),
    [activity.content.pairs],
  );
  const rightItems = useMemo(
    () => shuffle(activity.content.pairs.map((pair) => pair.right)),
    [activity.content.pairs],
  );

  const [selection, setSelection] = useState<MatchSelection | null>(null);
  const [matchedRights, setMatchedRights] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState(false);
  const [finished, setFinished] = useState(false);

  const totalPairs = activity.content.pairs.length;
  const allMatched = matchedRights.length === totalPairs;

  function findPairByLeft(left: string) {
    return activity.content.pairs.find((pair) => pair.left === left);
  }

  function handleSelect(side: MatchSide, value: string) {
    if (finished || wrongPair) return;
    if (side === 'right' && matchedRights.includes(value)) return;

    if (!selection) {
      setSelection({ side, value });
      return;
    }

    if (selection.side === side) {
      setSelection({ side, value });
      return;
    }

    const leftValue = selection.side === 'left' ? selection.value : value;
    const rightValue = selection.side === 'right' ? selection.value : value;
    const pair = findPairByLeft(leftValue);
    const isMatch = pair?.right === rightValue;

    if (isMatch) {
      const nextMatched = [...matchedRights, rightValue];
      setMatchedRights(nextMatched);
      setSelection(null);

      if (nextMatched.length === totalPairs) {
        setFinished(true);
        completeWithFeedback(true, onComplete);
      }
      return;
    }

    setWrongPair(true);
    speakTryAgain();
    window.setTimeout(() => {
      setWrongPair(false);
      setSelection(null);
    }, 700);
  }

  function itemClass(side: MatchSide, value: string) {
    const isSelected = selection?.side === side && selection.value === value;
    const isMatched = side === 'right' && matchedRights.includes(value);
    const isWrong = wrongPair && isSelected;

    return [
      'learn-match-item',
      isSelected ? 'is-selected' : '',
      isMatched ? 'is-correct' : '',
      isWrong ? 'is-wrong' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  return (
    <>
      <p className="learn-match-hint">{tUi('matching.hint')}</p>
      <div className="learn-match-board">
        <div className="learn-match-column">
          {leftItems.map((value) => (
            <button
              key={`left-${value}`}
              type="button"
              className={itemClass('left', value)}
              aria-label={tUi('matching.item', { value })}
              onClick={() => handleSelect('left', value)}
              disabled={finished}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="learn-match-column">
          {rightItems.map((value) => (
            <button
              key={`right-${value}`}
              type="button"
              className={itemClass('right', value)}
              aria-label={tUi('matching.option', { value })}
              onClick={() => handleSelect('right', value)}
              disabled={finished || matchedRights.includes(value)}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
      <ActivityFeedback answered={finished} correct={allMatched} />
    </>
  );
}
