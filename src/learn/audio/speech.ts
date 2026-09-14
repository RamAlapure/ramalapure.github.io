import type { LearnLanguage } from '../i18n/types';
import { SPEECH_LOCALES } from '../i18n/types';

const NORMAL_RATE = 1;
const SLOW_RATE = 0.72;

export interface SpeakOptions {
  enabled: boolean;
  slow: boolean;
  language?: LearnLanguage;
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeech(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}

export function speak(text: string, options: SpeakOptions): void {
  if (!options.enabled || !text.trim() || !isSpeechSupported()) return;

  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = SPEECH_LOCALES[options.language ?? 'en'];
  utterance.rate = options.slow ? SLOW_RATE : NORMAL_RATE;
  window.speechSynthesis.speak(utterance);
}
