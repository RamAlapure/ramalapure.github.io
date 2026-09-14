import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { speak, stopSpeech } from '../audio/speech';
import { localizeUiParams } from '../i18n/digits';
import { translateAudio } from '../i18n/translate';
import type { LearnSettings } from '../storage/types';

interface LearnAudioContextValue {
  soundEnabled: boolean;
  slowSpeech: boolean;
  toggleSound: () => void;
  toggleSlowSpeech: () => void;
  speakInstruction: (text: string) => void;
  speakSuccess: () => void;
  speakTryAgain: () => void;
  speakCompletion: (subjectLabel: string, correct: number, total: number) => void;
  repeatLast: () => void;
}

const LearnAudioContext = createContext<LearnAudioContextValue | null>(null);

interface LearnAudioProviderProps {
  settings: LearnSettings;
  onSettingsChange: (settings: Partial<LearnSettings>) => void;
  children: ReactNode;
}

export function LearnAudioProvider({
  settings,
  onSettingsChange,
  children,
}: LearnAudioProviderProps) {
  const lastSpokenRef = useRef('');

  useEffect(() => {
    document.body.dataset.highContrast = settings.highContrast ? 'true' : 'false';
    return () => {
      delete document.body.dataset.highContrast;
    };
  }, [settings.highContrast]);

  useEffect(() => () => stopSpeech(), []);

  const language = settings.language ?? 'en';

  const speakText = useCallback(
    (text: string) => {
      lastSpokenRef.current = text;
      speak(text, {
        enabled: settings.soundEnabled,
        slow: settings.slowSpeech,
        language,
      });
    },
    [language, settings.soundEnabled, settings.slowSpeech],
  );

  const value = useMemo<LearnAudioContextValue>(
    () => ({
      soundEnabled: settings.soundEnabled,
      slowSpeech: settings.slowSpeech,
      toggleSound: () => {
        const nextEnabled = !settings.soundEnabled;
        if (!nextEnabled) stopSpeech();
        onSettingsChange({ soundEnabled: nextEnabled });
      },
      toggleSlowSpeech: () => onSettingsChange({ slowSpeech: !settings.slowSpeech }),
      speakInstruction: speakText,
      speakSuccess: () => speakText(translateAudio(language, 'success')),
      speakTryAgain: () => speakText(translateAudio(language, 'tryAgain')),
      speakCompletion: (subjectLabel, correct, total) =>
        speakText(
          translateAudio(
            language,
            'completion',
            localizeUiParams(language, { subject: subjectLabel, correct, total }),
          ),
        ),
      repeatLast: () => {
        if (!lastSpokenRef.current) return;
        speak(lastSpokenRef.current, {
          enabled: settings.soundEnabled,
          slow: settings.slowSpeech,
          language,
        });
      },
    }),
    [language, onSettingsChange, settings.highContrast, settings.soundEnabled, settings.slowSpeech, speakText],
  );

  return <LearnAudioContext.Provider value={value}>{children}</LearnAudioContext.Provider>;
}

export function useLearnAudio(): LearnAudioContextValue {
  const context = useContext(LearnAudioContext);
  if (!context) {
    throw new Error('useLearnAudio must be used within LearnAudioProvider');
  }
  return context;
}
