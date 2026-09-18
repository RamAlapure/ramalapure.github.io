import { useEffect, useState } from 'react';
import { useLearnI18n } from '../../../context/LearnI18nContext';
import type { LearnerAvatar } from '../../../storage/profile-avatar';
import {
  canAddProfile,
  isDuplicateProfileName,
  MAX_PROFILES,
  type AgeGroup,
} from '../../../storage/store';
import type { LearnStore } from '../../../storage/types';
import { AvatarPicker } from '../../AvatarPicker';

interface LearnersPanelProps {
  store: LearnStore;
  activeProfileId: string;
  canDeleteProfile: boolean;
  onAddProfile: (name: string, ageGroup: AgeGroup, avatar: LearnerAvatar) => void;
  onDeleteProfile: (profileId: string) => void;
  onUpdateProfile: (name: string, ageGroup?: AgeGroup, avatar?: LearnerAvatar) => void;
}

export function LearnersPanel({
  store,
  activeProfileId,
  canDeleteProfile,
  onAddProfile,
  onDeleteProfile,
  onUpdateProfile,
}: LearnersPanelProps) {
  const { tUi } = useLearnI18n();
  const defaultName = tUi('profile.defaultName');
  const [nameDraft, setNameDraft] = useState(store.profile?.name ?? defaultName);
  const [ageGroupDraft, setAgeGroupDraft] = useState<AgeGroup>(
    store.profile?.ageGroup === 'class1' ? 'class1' : 'nursery',
  );
  const [avatarDraft, setAvatarDraft] = useState<LearnerAvatar>(store.profile?.avatar ?? 'boy');
  const [newChildName, setNewChildName] = useState('');
  const [newChildAgeGroup, setNewChildAgeGroup] = useState<AgeGroup>('nursery');
  const [newChildAvatar, setNewChildAvatar] = useState<LearnerAvatar>('boy');
  const [saveMessage, setSaveMessage] = useState('');
  const [addError, setAddError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setNameDraft(store.profile?.name ?? defaultName);
    setAgeGroupDraft(store.profile?.ageGroup === 'class1' ? 'class1' : 'nursery');
    setAvatarDraft(store.profile?.avatar ?? 'boy');
    setConfirmDelete(false);
    setSaveMessage('');
  }, [
    store.profile?.id,
    store.profile?.name,
    store.profile?.ageGroup,
    store.profile?.avatar,
    defaultName,
  ]);

  function saveProfile() {
    const trimmed = nameDraft.trim();
    if (!trimmed) return;
    if (isDuplicateProfileName(trimmed, store.profile?.id)) {
      setSaveMessage(tUi('welcome.duplicateName'));
      return;
    }
    onUpdateProfile(trimmed, ageGroupDraft, avatarDraft);
    setSaveMessage(tUi('parent.saved'));
  }

  function addProfile() {
    const trimmed = newChildName.trim();
    if (!trimmed) return;
    if (!canAddProfile()) {
      setAddError(tUi('welcome.profileLimit', { count: MAX_PROFILES }));
      return;
    }
    if (isDuplicateProfileName(trimmed)) {
      setAddError(tUi('welcome.duplicateName'));
      return;
    }
    onAddProfile(trimmed, newChildAgeGroup, newChildAvatar);
    setNewChildName('');
    setNewChildAvatar('boy');
    setAddError('');
  }

  return (
    <>
      <div className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('parent.childProfile')}</h2>
        <span className="learn-field-label">{tUi('welcome.chooseAvatar')}</span>
        <AvatarPicker
          value={avatarDraft}
          onChange={(nextAvatar) => {
            setAvatarDraft(nextAvatar);
            setSaveMessage('');
          }}
        />
        <label className="learn-field-label" htmlFor="child-name">{tUi('parent.name')}</label>
        <input
          id="child-name"
          className="learn-text-input"
          value={nameDraft}
          onChange={(event) => {
            setNameDraft(event.target.value);
            setSaveMessage('');
          }}
          maxLength={32}
        />
        <label className="learn-field-label" htmlFor="child-age-group">{tUi('parent.ageGroup')}</label>
        <select
          id="child-age-group"
          className="learn-text-input"
          value={ageGroupDraft}
          onChange={(event) => {
            setAgeGroupDraft(event.target.value as AgeGroup);
            setSaveMessage('');
          }}
        >
          <option value="nursery">{tUi('parent.ageNursery')}</option>
          <option value="class1">{tUi('parent.ageClass1')}</option>
        </select>
        <p className="learn-subtitle">{tUi('parent.ageClass1Note')}</p>
        <div className="learn-profile-row learn-profile-row-wrap">
          <button type="button" className="learn-btn learn-btn-compact" onClick={saveProfile}>
            {tUi('parent.save')}
          </button>
        </div>
        {saveMessage ? <p className="learn-subtitle" role="status">{saveMessage}</p> : null}
        {canDeleteProfile ? (
          <div className="learn-delete-profile">
            {confirmDelete ? (
              <div className="learn-confirm-actions">
                <p className="learn-subtitle">{tUi('parent.deleteConfirm')}</p>
                <button
                  type="button"
                  className="learn-btn learn-btn-secondary learn-btn-compact"
                  onClick={() => setConfirmDelete(false)}
                >
                  {tUi('activity.confirmStay')}
                </button>
                <button
                  type="button"
                  className="learn-btn learn-btn-compact"
                  onClick={() => onDeleteProfile(activeProfileId)}
                >
                  {tUi('parent.deleteProfile')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="learn-btn learn-btn-secondary learn-btn-compact"
                onClick={() => setConfirmDelete(true)}
              >
                {tUi('parent.deleteProfile')}
              </button>
            )}
          </div>
        ) : null}
      </div>

      <div className="learn-panel-section">
        <h2 className="learn-section-title">{tUi('parent.addChild')}</h2>
        {canAddProfile() ? (
          <>
            <AvatarPicker value={newChildAvatar} onChange={setNewChildAvatar} />
            <div className="learn-profile-row learn-profile-row-wrap">
              <input
                className="learn-text-input"
                value={newChildName}
                onChange={(event) => {
                  setNewChildName(event.target.value);
                  setAddError('');
                }}
                placeholder={tUi('parent.addChild')}
                maxLength={32}
              />
              <select
                className="learn-text-input"
                value={newChildAgeGroup}
                onChange={(event) => setNewChildAgeGroup(event.target.value as AgeGroup)}
              >
                <option value="nursery">{tUi('parent.ageNursery')}</option>
                <option value="class1">{tUi('parent.ageClass1')}</option>
              </select>
              <button type="button" className="learn-btn learn-btn-compact" onClick={addProfile}>
                {tUi('parent.addChild')}
              </button>
            </div>
            {addError ? <p className="learn-form-error" role="alert">{addError}</p> : null}
          </>
        ) : (
          <p className="learn-subtitle">{tUi('welcome.profileLimit', { count: MAX_PROFILES })}</p>
        )}
      </div>
    </>
  );
}
