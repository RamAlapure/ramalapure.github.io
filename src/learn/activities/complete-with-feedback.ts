export function completeWithFeedback(
  correct: boolean,
  onComplete: (correct: boolean) => void,
  delayMs = 900,
): ReturnType<typeof setTimeout> {
  return window.setTimeout(() => onComplete(correct), delayMs);
}
