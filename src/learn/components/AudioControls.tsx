import { useLearnAudio } from '../context/LearnAudioContext';
import { useLearnI18n } from '../context/LearnI18nContext';

export function AudioControls() {
  const { tUi } = useLearnI18n();
  const {
    soundEnabled,
    slowSpeech,
    toggleSound,
    toggleSlowSpeech,
    repeatLast,
  } = useLearnAudio();

  return (
    <div className="learn-audio-controls" role="group" aria-label={tUi('audio.controls')}>
      <button
        type="button"
        className="learn-audio-btn"
        aria-label={tUi('audio.repeat')}
        onClick={repeatLast}
      >
        🔊 {tUi('audio.repeat')}
      </button>
      <button
        type="button"
        className={`learn-audio-btn ${soundEnabled ? '' : 'is-active'}`.trim()}
        aria-label={soundEnabled ? tUi('audio.mute') : tUi('audio.unmute')}
        aria-pressed={!soundEnabled}
        onClick={toggleSound}
      >
        {soundEnabled ? `🔇 ${tUi('audio.mute')}` : `🔊 ${tUi('audio.unmute')}`}
      </button>
      <button
        type="button"
        className={`learn-audio-btn ${slowSpeech ? 'is-active' : ''}`.trim()}
        aria-label={slowSpeech ? tUi('audio.normalSpeed') : tUi('audio.slowSpeed')}
        aria-pressed={slowSpeech}
        onClick={toggleSlowSpeech}
      >
        🐢 {tUi('audio.slow')}
      </button>
    </div>
  );
}
