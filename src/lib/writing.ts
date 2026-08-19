export const WRITING_SERIES_NAME = 'Production AI Patterns';

export function formatSeriesLabel(series: number): string {
  return `${WRITING_SERIES_NAME} · #${series}`;
}
