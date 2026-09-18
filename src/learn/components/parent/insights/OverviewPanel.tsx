import { useLearnI18n } from '../../../context/LearnI18nContext';
import { formatLocalizedCount, getTodayStats, getWeeklySummary } from '../../../parent/analytics';
import { DEFAULT_LEARNER_NAME } from '../../../storage/store';
import type { LearnStore } from '../../../storage/types';

interface OverviewPanelProps {
  store: LearnStore;
}

export function OverviewPanel({ store }: OverviewPanelProps) {
  const { language, tUi, tUiDigits, formatCount } = useLearnI18n();
  const defaultName = tUi('profile.defaultName');
  const childName =
    store.profile?.name === DEFAULT_LEARNER_NAME
      ? defaultName
      : (store.profile?.name ?? defaultName);
  const rewards = store.rewards ?? { points: 0, totalStars: 0, badges: [], dailyStreak: 0 };
  const sessions = store.sessions ?? { sessionsCompleted: 0, bySubject: {} };
  const today = getTodayStats(store);
  const weekly = getWeeklySummary(store, language);
  const maxWeekly = Math.max(1, ...weekly.map((day) => day.count));

  return (
    <>
      <div className="learn-panel-section learn-parent-dashboard">
        <h2 className="learn-section-title">{tUi('parent.childLabel', { name: childName })}</h2>
        <div className="learn-dashboard-card">
          <h3 className="learn-dashboard-heading">{tUi('parent.todayLearning')}</h3>
          <ul className="learn-stat-list">
            <li><span>{tUi('parent.minutes')}</span><strong>{formatCount(today.minutes)}</strong></li>
            <li><span>{tUi('parent.activitiesCount')}</span><strong>{formatCount(today.activities)}</strong></li>
            <li>
              <span>{tUi('parent.correct')}</span>
              <strong>{formatCount(today.correct)} / {formatCount(today.activities)}</strong>
            </li>
          </ul>
        </div>
      </div>

      <div className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('parent.weeklySummary')}</h2>
        <div className="learn-weekly-chart" role="img" aria-label={tUi('parent.weeklyAria')}>
          {weekly.map((day) => (
            <div key={day.label} className="learn-weekly-day">
              <div
                className="learn-weekly-bar"
                style={{ height: `${Math.max(12, (day.count / maxWeekly) * 100)}%` }}
                title={tUiDigits('parent.weeklyTooltip', { count: day.count })}
              />
              <span className="learn-weekly-label">{day.label}</span>
              <span className="learn-weekly-count">{formatLocalizedCount(day.count, language)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('parent.lifetime')}</h2>
        <ul className="learn-stat-list learn-stat-summary">
          <li><span>{tUi('parent.practiceRounds')}</span><strong>{formatCount(sessions.sessionsCompleted)}</strong></li>
          <li><span>{tUi('parent.totalStars')}</span><strong>⭐ {formatCount(rewards.totalStars)}</strong></li>
          <li><span>{tUi('parent.totalPoints')}</span><strong>🏆 {formatCount(rewards.points)}</strong></li>
          <li><span>{tUi('parent.dayStreak')}</span><strong>🔥 {formatCount(rewards.dailyStreak)}</strong></li>
        </ul>
      </div>
    </>
  );
}
