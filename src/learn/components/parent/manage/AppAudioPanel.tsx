import { useLearnI18n } from '../../../context/LearnI18nContext';
import type { LearnSettings } from '../../../storage/types';

interface AppAudioPanelProps {
  settings: LearnSettings;
  onUpdateSettings: (settings: Partial<LearnSettings>) => void;
}

export function AppAudioPanel({ settings, onUpdateSettings }: AppAudioPanelProps) {
  const { tUi } = useLearnI18n();

  return (
    <div className="learn-panel-section">
      <h2 className="learn-section-title">{tUi('parent.settings')}</h2>
      <label className="learn-setting-row">
        <input
          type="checkbox"
          checked={settings.soundEnabled}
          onChange={(event) => onUpdateSettings({ soundEnabled: event.target.checked })}
        />
        <span>{tUi('settings.sound')}</span>
      </label>
      <label className="learn-setting-row">
        <input
          type="checkbox"
          checked={settings.slowSpeech}
          onChange={(event) => onUpdateSettings({ slowSpeech: event.target.checked })}
        />
        <span>{tUi('settings.slowSpeech')}</span>
      </label>
      <label className="learn-setting-row">
        <input
          type="checkbox"
          checked={settings.highContrast}
          onChange={(event) => onUpdateSettings({ highContrast: event.target.checked })}
        />
        <span>{tUi('settings.highContrast')}</span>
      </label>
    </div>
  );
}
