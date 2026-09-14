import type { SubjectId } from '../app/types';
import { DEFAULT_LEARNER_NAME } from '../storage/store';
import { useLearnI18n } from '../context/LearnI18nContext';
import {
  formatLocalizedCount,
  getPracticeRecommendations,
  getSubjectSkillViews,
  getTodayStats,
  getWeeklySummary,
} from '../parent/analytics';
import type { LearnStore } from '../storage/types';

interface ParentDashboardProps {
  store: LearnStore;
  onPracticeSubject: (subjectId: SubjectId) => void;
}

export function ParentDashboard({ store, onPracticeSubject }: ParentDashboardProps) {
  const { language, tUi, tUiDigits, formatCount } = useLearnI18n();
  const defaultName = tUi('profile.defaultName');
  const childName =
    store.profile?.name === DEFAULT_LEARNER_NAME
      ? defaultName
      : (store.profile?.name ?? defaultName);
  const today = getTodayStats(store);
  const subjectViews = getSubjectSkillViews(store, language);
  const recommendations = getPracticeRecommendations(store, language);
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
        <h2 className="learn-section-title">{tUi('parent.skillsBySubject')}</h2>
        <ul className="learn-subject-stars-list">
          {subjectViews.map((subject) => (
            <li key={subject.subjectId}>
              <span>{subject.emoji} {subject.label}</span>
              <strong aria-label={tUiDigits('parent.starsAria', { count: subject.stars })}>
                {subject.starsDisplay}
              </strong>
            </li>
          ))}
        </ul>
      </div>

      {recommendations.length > 0 ? (
        <div className="learn-panel-section">
          <h2 className="learn-section-title">{tUi('parent.recommended')}</h2>
          <p className="learn-subtitle">{tUi('parent.needsPractice')}</p>
          <ul className="learn-recommendation-list">
            {recommendations.map((item) => (
              <li key={`${item.subjectId}-${item.skillLabel}`} className="learn-recommendation-item">
                <strong>{item.subjectEmoji} {item.subjectLabel}</strong>
                <span>{item.skillLabel}</span>
                <span className="learn-recommendation-suggestion">
                  {tUiDigits('parent.suggestedActivities', { count: item.suggestedCount })}
                </span>
                <button
                  type="button"
                  className="learn-btn learn-btn-compact"
                  onClick={() => onPracticeSubject(item.subjectId)}
                >
                  {tUi('parent.practiceNow')}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

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
    </>
  );
}
