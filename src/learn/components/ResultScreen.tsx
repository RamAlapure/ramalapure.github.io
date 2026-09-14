import { useEffect } from 'react';
import { useLearnAudio } from '../context/LearnAudioContext';
import { useLearnI18n } from '../context/LearnI18nContext';
import type { Badge } from '../rewards/badges';
import { renderStars } from '../rewards/stars';

interface ResultScreenProps {
  subjectLabel: string;
  subjectEmoji: string;
  correctCount: number;
  totalCount: number;
  starsEarned: number;
  sessionPoints: number;
  sessionFocus?: string;
  badgeUnlocked: Badge | null;
  onPlayAgain: () => void;
  onHome: () => void;
}

export function ResultScreen({
  subjectLabel,
  subjectEmoji,
  correctCount,
  totalCount,
  starsEarned,
  sessionPoints,
  sessionFocus,
  badgeUnlocked,
  onPlayAgain,
  onHome,
}: ResultScreenProps) {
  const { speakCompletion } = useLearnAudio();
  const { tUi, tUiDigits, tBadge } = useLearnI18n();
  const perfectRound = correctCount === totalCount;

  useEffect(() => {
    speakCompletion(subjectLabel, correctCount, totalCount);
  }, [correctCount, speakCompletion, subjectLabel, totalCount]);

  return (
    <section className="learn-panel learn-celebrate learn-result">
      <h1 className="learn-result-title">🎉 {tUi('result.title')}</h1>
      <p className="learn-subtitle learn-result-subtitle">
        {subjectEmoji} {tUi('result.completed', { subject: subjectLabel })}
      </p>

      <div
        className="learn-stars learn-stars-animated"
        aria-label={tUiDigits('result.starsAria', { count: starsEarned })}
      >
          {renderStars(starsEarned)
            .split('')
            .map((star, index) => (
              <span key={index} style={{ animationDelay: `${index * 0.1}s` }}>{star}</span>
            ))}
        </div>

        <p className="learn-instruction">
          {tUiDigits('result.score', { correct: correctCount, total: totalCount })}
        </p>
        <p className="learn-subtitle">
          {perfectRound ? tUi('result.perfect') : tUi('result.greatEffort')}
        </p>

        <p className="learn-session-points learn-pop">
          {tUiDigits('result.pointsRound', { points: sessionPoints })}
        </p>
        {sessionFocus ? <p className="learn-subtitle">{tUi('result.focus', { focus: sessionFocus })}</p> : null}

        {badgeUnlocked ? (
          <div className="learn-badge-unlock learn-pop" role="status">
            <p className="learn-badge-label">{tUi('result.newBadgeLabel')}</p>
            <p className="learn-badge-name">
              <span aria-hidden="true">{badgeUnlocked.emoji}</span>{' '}
              {tUi('result.badge', { badge: tBadge(badgeUnlocked.id) })}
            </p>
          </div>
        ) : null}

        <div className="learn-actions">
          <button type="button" className="learn-btn" onClick={onPlayAgain}>
            {tUi('result.playAgain')}
          </button>
          <button type="button" className="learn-btn learn-btn-secondary" onClick={onHome}>
            {tUi('result.home')}
          </button>
        </div>
    </section>
  );
}
