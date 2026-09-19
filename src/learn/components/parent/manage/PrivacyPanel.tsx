import { useState } from 'react';
import { useLearnI18n } from '../../../context/LearnI18nContext';
import { isValidPin, verifyParentPin } from '../../../parent/pin';
import { exportStore, getStorageDisclosure } from '../../../storage/store';
import type { LearnSettings } from '../../../storage/types';

interface PrivacyPanelProps {
  settings: LearnSettings;
  onChangePin: (pin: string) => void;
  onExport: () => void;
  onResetProfile: () => void;
  onResetAll: () => void;
}

export function PrivacyPanel({
  settings,
  onChangePin,
  onExport,
  onResetProfile,
  onResetAll,
}: PrivacyPanelProps) {
  const { tUi, tUiDigits } = useLearnI18n();
  const disclosure = getStorageDisclosure();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [confirmResetProfile, setConfirmResetProfile] = useState(false);
  const [confirmResetAll, setConfirmResetAll] = useState(false);

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

  function downloadExport() {
    const blob = new Blob([exportStore()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'learn-playground-export.json';
    link.click();
    URL.revokeObjectURL(url);
    onExport();
  }

  return (
    <div className="learn-panel-section">
      <h2 className="learn-section-title">{tUi('parent.manage.privacy')}</h2>

      <div className="learn-dashboard-card learn-form-stack">
        <h3 className="learn-dashboard-heading">{tUi('parent.privacy.pin')}</h3>
        <label className="learn-field" htmlFor="parent-current-pin">
          <span className="learn-field-label">{tUi('parent.currentPin')}</span>
          <input
            id="parent-current-pin"
            className="learn-text-input"
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            autoComplete="off"
            placeholder={tUi('parent.pinPlaceholder')}
            value={currentPin}
            onChange={(event) => setCurrentPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </label>
        <label className="learn-field" htmlFor="parent-pin">
          <span className="learn-field-label">{tUi('parent.changePin')}</span>
          <input
            id="parent-pin"
            className="learn-text-input"
            type="password"
            inputMode="numeric"
            pattern="\d{4}"
            maxLength={4}
            autoComplete="off"
            placeholder={tUi('parent.pinPlaceholder')}
            value={newPin}
            onChange={(event) => setNewPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </label>
        <button type="button" className="learn-btn learn-btn-compact learn-form-action" onClick={savePin}>
          {tUi('parent.update')}
        </button>
        {pinMessage ? <p className="learn-subtitle" role="status">{pinMessage}</p> : null}
      </div>

      <div className="learn-dashboard-card">
        <h3 className="learn-dashboard-heading">{tUi('parent.privacy.stored')}</h3>
        <ul className="learn-adaptive-rules">
          <li>{tUiDigits('parent.privacy.profiles', { count: disclosure.profileCount })}</li>
          <li>{tUiDigits('parent.privacy.activities', { count: disclosure.activityCount })}</li>
          <li>{tUi('parent.privacy.settings')}</li>
          <li>{tUi('parent.privacy.localOnly')}</li>
        </ul>
        <button type="button" className="learn-btn learn-btn-secondary" onClick={downloadExport}>
          {tUi('parent.privacy.export')}
        </button>
      </div>

      <div className="learn-dashboard-card learn-danger-zone">
        <h3 className="learn-dashboard-heading">{tUi('parent.privacy.reset')}</h3>
        {confirmResetProfile ? (
          <div className="learn-confirm-actions">
            <p className="learn-subtitle">{tUi('parent.privacy.resetProfileConfirm')}</p>
            <button type="button" className="learn-btn learn-btn-secondary learn-btn-compact" onClick={() => setConfirmResetProfile(false)}>
              {tUi('activity.confirmStay')}
            </button>
            <button type="button" className="learn-btn learn-btn-compact" onClick={onResetProfile}>
              {tUi('parent.privacy.resetProfile')}
            </button>
          </div>
        ) : (
          <button type="button" className="learn-btn learn-btn-secondary" onClick={() => setConfirmResetProfile(true)}>
            {tUi('parent.privacy.resetProfile')}
          </button>
        )}

        {confirmResetAll ? (
          <div className="learn-confirm-actions">
            <p className="learn-subtitle">{tUi('parent.privacy.resetAllConfirm')}</p>
            <button type="button" className="learn-btn learn-btn-secondary learn-btn-compact" onClick={() => setConfirmResetAll(false)}>
              {tUi('activity.confirmStay')}
            </button>
            <button type="button" className="learn-btn learn-btn-compact learn-btn-danger" onClick={onResetAll}>
              {tUi('parent.privacy.resetAll')}
            </button>
          </div>
        ) : (
          <button type="button" className="learn-btn learn-btn-danger" onClick={() => setConfirmResetAll(true)}>
            {tUi('parent.privacy.resetAll')}
          </button>
        )}
      </div>
    </div>
  );
}
