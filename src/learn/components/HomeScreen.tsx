import type { Subject } from '../app/types';
import { getActivityCount } from '../curriculum/nursery';
import { SESSION_SIZE } from '../curriculum/session';
import { useLearnI18n } from '../context/LearnI18nContext';
import { badgesBySubject } from '../rewards/badges';
import { DEFAULT_LEARNER_NAME } from '../storage/store';
import { learnerAvatarEmoji, type LearnerAvatar } from '../storage/profile-avatar';
import { LearnHeaderActions } from './LearnHeaderActions';

interface HomeScreenProps {
  subjects: Subject[];
  learnerName: string;
  learnerAvatar?: LearnerAvatar;
  totalPoints: number;
  totalStars: number;
  badges: Subject['id'][];
  dailyStreak: number;
  onSelectSubject: (subjectId: Subject['id']) => void;
  onSwitchProfile: () => void;
  onOpenParent: () => void;
}

export function HomeScreen({
  subjects,
  learnerName,
  learnerAvatar,
  totalPoints,
  totalStars,
  badges,
  dailyStreak,
  onSelectSubject,
  onSwitchProfile,
  onOpenParent,
}: HomeScreenProps) {
  const { tUi, tUiDigits, tSubject, tBadge, formatCount } = useLearnI18n();
  const displayName =
    learnerName === DEFAULT_LEARNER_NAME ? tUi('profile.defaultName') : learnerName;

  return (
    <>
      <header className="learn-header">
        <div>
          <h1 className="learn-title learn-home-greeting">
            <span className="learn-home-avatar" aria-hidden="true">
              {learnerAvatarEmoji(learnerAvatar)}
            </span>
            {tUi('home.greeting', { name: displayName })}
          </h1>
          <p className="learn-subtitle">{tUiDigits('home.subtitle', { count: SESSION_SIZE })}</p>
          <button type="button" className="learn-switch-link" onClick={onSwitchProfile}>
            {tUi('home.switchProfile')}
          </button>
        </div>
        <LearnHeaderActions onOpenParent={onOpenParent} />
      </header>

      <div className="learn-rewards-bar" aria-label={tUi('home.rewardsAria')}>
        <span className="learn-reward-chip">⭐ {formatCount(totalStars)}</span>
        <span className="learn-reward-chip">🏆 {formatCount(totalPoints)}</span>
        {dailyStreak >= 1 ? (
          <span className="learn-reward-chip">{tUiDigits('home.dayStreak', { count: dailyStreak })}</span>
        ) : null}
      </div>

      <div className="learn-grid">
        {subjects.map((subject) => {
          const hasBadge = badges.includes(subject.id);
          const badge = badgesBySubject[subject.id];
          return (
            <button
              key={subject.id}
              type="button"
              className="learn-card"
              onClick={() => onSelectSubject(subject.id)}
            >
              <span className="learn-card-emoji" aria-hidden="true">{subject.emoji}</span>
              <span className="learn-card-label">{tSubject(subject.id)}</span>
              <span className="learn-card-meta">
                {tUiDigits('home.activities', { count: getActivityCount(subject.id) })}
              </span>
              {hasBadge ? (
                <span className="learn-card-badge" title={tBadge(subject.id)}>
                  {badge.emoji} {tBadge(subject.id)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </>
  );
}
