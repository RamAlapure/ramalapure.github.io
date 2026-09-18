import { useState } from 'react';
import { useLearnI18n } from '../../../context/LearnI18nContext';
import { isValidPin, verifyParentPin } from '../../../parent/pin';
import type { LearnSettings } from '../../../storage/types';

interface PrivacyPanelProps {
  settings: LearnSettings;
  onChangePin: (pin: string) => void;
}

export function PrivacyPanel({ settings, onChangePin }: PrivacyPanelProps) {
  const { tUi } = useLearnI18n();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  function savePin() {
    if (!verifyParentPin(settings.parentPin, currentPin)) {
      setPinMessage(tUi('parent.pinVerifyFailed'));
      return;
    }
    if (!isValidPin(newPin)) {
      setPinMessage(tUi('parent.pinInvalid'));
      return;
    }
    onChangePin(newPin);
    setCurrentPin('');
    setNewPin('');
    setPinMessage(tUi('parent.pinUpdated'));
  }

  return (
    <div className="learn-panel-section">
      <h2 className="learn-section-title">{tUi('parent.manage.privacy')}</h2>
      <p className="learn-subtitle">{tUi('parent.privacy')}</p>
      <label className="learn-field-label" htmlFor="parent-current-pin">{tUi('parent.currentPin')}</label>
      <div className="learn-profile-row learn-profile-row-wrap">
        <input
          id="parent-current-pin"
          className="learn-text-input"
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          placeholder={tUi('parent.pinPlaceholder')}
          value={currentPin}
          onChange={(event) => setCurrentPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
        />
      </div>
      <label className="learn-field-label" htmlFor="parent-pin">{tUi('parent.changePin')}</label>
      <div className="learn-profile-row learn-profile-row-wrap">
        <input
          id="parent-pin"
          className="learn-text-input"
          type="password"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          placeholder={tUi('parent.pinPlaceholder')}
          value={newPin}
          onChange={(event) => setNewPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
        />
        <button type="button" className="learn-btn learn-btn-compact" onClick={savePin}>
          {tUi('parent.update')}
        </button>
      </div>
      {pinMessage ? <p className="learn-subtitle" role="status">{pinMessage}</p> : null}
    </div>
  );
}
