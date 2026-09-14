export function starsForSession(correctCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  const ratio = correctCount / totalCount;
  if (ratio >= 1) return 5;
  if (ratio >= 0.8) return 4;
  if (ratio >= 0.6) return 3;
  if (ratio >= 0.4) return 2;
  return 1;
}

export function renderStars(count: number): string {
  return '⭐'.repeat(Math.max(0, count));
}
