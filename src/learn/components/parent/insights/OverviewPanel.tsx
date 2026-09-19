import type { CSSProperties } from 'react';
import { useLearnI18n } from '../../../context/LearnI18nContext';
import {
  getChartSeries,
  getRangeStats,
  getRecentSessions,
  getTimeOfDayInsight,
  type AnalyticsRange,
} from '../../../parent/analytics';
import type { LearnStore } from '../../../storage/types';

interface OverviewPanelProps {
  store: LearnStore;
  range: AnalyticsRange;
}

function formatDelta(value: number, suffix = ''): string {
  if (value === 0) return '—';
  const sign = value > 0 ? '▲' : '▼';
  return `${sign} ${Math.abs(value)}${suffix}`;
}

function chartCaptionKey(range: AnalyticsRange): string {
  return range === 'today' ? 'parent.chart.caption.today' : 'parent.chart.caption.7d';
}

export function OverviewPanel({ store, range }: OverviewPanelProps) {
  const { language, tUi, tUiDigits, formatCount } = useLearnI18n();
  const stats = getRangeStats(store, range);
  const lifetime = getRangeStats(store, 'all');
  const { points: series } = getChartSeries(store, range, language);
  const timeOfDay = getTimeOfDayInsight(store, range);
  const recentSessions = getRecentSessions(store, language);
  const maxActivities = Math.max(1, ...series.map((point) => point.activities));
  const maxTimeOfDay = Math.max(1, ...timeOfDay.buckets.map((bucket) => bucket.activities));
  const chartIsWide = series.length > 7;
  const rounds = store.sessions?.sessionsCompleted ?? 0;
  const stars = store.rewards?.totalStars ?? 0;

  return (
    <>
      <div className="learn-kpi-grid">
        <div className="learn-kpi-card">
          <span className="learn-kpi-label">{tUi('parent.minutes')}</span>
          <strong className="learn-kpi-value">{formatCount(stats.minutes)}</strong>
          <span className={`learn-kpi-delta ${stats.deltaMinutes >= 0 ? 'is-up' : 'is-down'}`.trim()}>
            {formatDelta(stats.deltaMinutes)}
          </span>
        </div>
        <div className="learn-kpi-card">
          <span className="learn-kpi-label">{tUi('parent.activitiesCount')}</span>
          <strong className="learn-kpi-value">{formatCount(stats.activities)}</strong>
          <span className={`learn-kpi-delta ${stats.deltaActivities >= 0 ? 'is-up' : 'is-down'}`.trim()}>
            {formatDelta(stats.deltaActivities)}
          </span>
        </div>
        <div className="learn-kpi-card">
          <span className="learn-kpi-label">{tUi('parent.accuracy')}</span>
          <strong className="learn-kpi-value">{formatCount(stats.accuracy)}%</strong>
          <span className={`learn-kpi-delta ${stats.deltaAccuracy >= 0 ? 'is-up' : 'is-down'}`.trim()}>
            {formatDelta(stats.deltaAccuracy, '%')}
          </span>
        </div>
        <div className="learn-kpi-card">
          <span className="learn-kpi-label">{tUi('parent.dayStreak')}</span>
          <strong className="learn-kpi-value">🔥 {formatCount(stats.streak)}</strong>
          <span className="learn-kpi-delta">{tUi('parent.bestStreak', { count: stats.bestStreak })}</span>
        </div>
      </div>

      <p className="learn-lifetime-strip">
        {tUiDigits('parent.lifetimeStrip', {
          rounds,
          stars,
          accuracy: lifetime.accuracy,
        })}
      </p>

      <div className="learn-panel-section">
        <div className="learn-chart-header">
          <h2 className="learn-section-title">{tUi('parent.chart.activityAccuracy')}</h2>
          <span className="learn-chart-legend">{tUi('parent.chart.legend')}</span>
        </div>
        <p className="learn-chart-caption">{tUi(chartCaptionKey(range))}</p>
        {series.length > 0 ? (
          <div className="learn-chart-scroll">
            <div
              className={`learn-combo-chart ${chartIsWide ? 'is-wide' : ''}`.trim()}
              style={{ '--chart-points': series.length } as CSSProperties}
              role="img"
              aria-label={tUi(chartCaptionKey(range))}
            >
              {series.map((point) => (
                <div key={point.day} className="learn-combo-col">
                  <div
                    className="learn-combo-bar"
                    style={{ height: `${Math.max(8, (point.activities / maxActivities) * 100)}%` }}
                    title={tUiDigits('parent.weeklyTooltip', { count: point.activities })}
                  />
                  <span className="learn-weekly-label">{point.showLabel ? point.label : ''}</span>
                </div>
              ))}
              <svg className="learn-combo-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  points={series
                    .map((point, index) => {
                      const x = series.length <= 1 ? 50 : (index / (series.length - 1)) * 100;
                      const y = 100 - point.accuracy;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>
            </div>
          </div>
        ) : (
          <p className="learn-subtitle">{tUi('parent.chart.empty')}</p>
        )}
      </div>

      <div className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('parent.chart.timeOfDay')}</h2>
        <p className="learn-chart-caption">{tUi(`parent.chart.timeOfDayCaption.${range}`)}</p>
        {timeOfDay.hasData ? (
          <>
            <div
              className="learn-weekly-chart learn-time-chart"
              role="img"
              aria-label={tUiDigits('parent.chart.timeOfDayAria', { count: timeOfDay.totalActivities })}
            >
              {timeOfDay.buckets.map((bucket) => (
                <div key={bucket.hourBucket} className="learn-weekly-day learn-time-day">
                  {bucket.activities > 0 ? (
                    <span className="learn-time-count">{formatCount(bucket.activities)}</span>
                  ) : (
                    <span className="learn-time-count" aria-hidden="true">&nbsp;</span>
                  )}
                  <div
                    className="learn-weekly-bar learn-time-bar"
                    style={{ height: `${Math.max(8, (bucket.activities / maxTimeOfDay) * 100)}%` }}
                    title={tUiDigits('parent.chart.timeOfDayBucket', {
                      range: bucket.rangeLabel,
                      count: bucket.activities,
                      percent: bucket.sharePercent,
                      accuracy: bucket.accuracy,
                    })}
                  />
                  <span className="learn-weekly-label" title={bucket.rangeLabel}>{bucket.label}</span>
                </div>
              ))}
            </div>
            <p className="learn-time-insight">
              {tUiDigits('parent.chart.timeOfDayPeak', {
                range: timeOfDay.peakRangeLabel,
                count: timeOfDay.peakActivities,
                percent: timeOfDay.peakSharePercent,
              })}
              {timeOfDay.accuracyDropPercent !== null && timeOfDay.accuracyDropPercent >= 8
                ? ` ${tUiDigits('parent.chart.timeOfDayAccuracyDrop', {
                    drop: timeOfDay.accuracyDropPercent,
                  })}`
                : ''}
            </p>
          </>
        ) : (
          <p className="learn-subtitle">{tUi('parent.chart.timeOfDayEmpty')}</p>
        )}
      </div>

      <div className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('parent.recentRounds')}</h2>
        {recentSessions.length > 0 ? (
          <table className="learn-data-table">
            <thead>
              <tr>
                <th>{tUi('parent.round')}</th>
                <th>{tUi('parent.score')}</th>
                <th>{tUi('parent.when')}</th>
              </tr>
            </thead>
            <tbody>
              {recentSessions.map((session) => (
                <tr key={session.at}>
                  <td>{session.subjectEmoji} {session.subjectLabel}</td>
                  <td>{session.score}/{session.total}</td>
                  <td>{session.timeLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="learn-subtitle">{tUi('parent.recentEmpty')}</p>
        )}
      </div>
    </>
  );
}
