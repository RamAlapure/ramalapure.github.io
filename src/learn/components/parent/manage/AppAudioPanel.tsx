import { useEffect, useState } from 'react';
import { useLearnI18n } from '../../../context/LearnI18nContext';
import type { LearnSettings } from '../../../storage/types';

interface AppAudioPanelProps {
  settings: LearnSettings;
  onUpdateSettings: (settings: Partial<LearnSettings>) => void;
}

export function AppAudioPanel({ settings, onUpdateSettings }: AppAudioPanelProps) {
  const { tUi } = useLearnI18n();
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [slowSpeech, setSlowSpeech] = useState(settings.slowSpeech);
  const [highContrast, setHighContrast] = useState(settings.highContrast);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setSoundEnabled(settings.soundEnabled);
    setSlowSpeech(settings.slowSpeech);
    setHighContrast(settings.highContrast);
    setSaveMessage('');
  }, [settings.highContrast, settings.soundEnabled, settings.slowSpeech]);

  function save() {
    onUpdateSettings({
      soundEnabled,
      slowSpeech,
      highContrast,
    });
    setSaveMessage(tUi('parent.saved'));
  }

  return (
    <div className="learn-panel-section">
      <h2 className="learn-section-title">{tUi('parent.settings')}</h2>

      <div className="learn-dashboard-card">
        <h3 className="learn-dashboard-heading">{tUi('parent.app.audio')}</h3>
        <label className="learn-setting-row">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(event) => {
              setSoundEnabled(event.target.checked);
              setSaveMessage('');
            }}
          />
          <span>{tUi('settings.sound')}</span>
        </label>
        <label className="learn-setting-row">
          <input
            type="checkbox"
            checked={slowSpeech}
            onChange={(event) => {
              setSlowSpeech(event.target.checked);
              setSaveMessage('');
            }}
          />
          <span>{tUi('settings.slowSpeech')}</span>
        </label>
      </div>

      <div className="learn-dashboard-card">
        <h3 className="learn-dashboard-heading">{tUi('parent.app.accessibility')}</h3>
        <label className="learn-setting-row">
          <input
            type="checkbox"
            checked={highContrast}
            onChange={(event) => {
              setHighContrast(event.target.checked);
              setSaveMessage('');
            }}
          />
          <span>{tUi('settings.highContrast')}</span>
        </label>
      </div>

      <button type="button" className="learn-btn" onClick={save}>
        {tUi('parent.app.save')}
      </button>
      {saveMessage ? <p className="learn-subtitle" role="status">{saveMessage}</p> : null}
    </div>
  );
}
