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
  startInAddMode?: boolean;
  onAddModeConsumed?: () => void;
  onAddProfile: (name: string, ageGroup: AgeGroup, avatar: LearnerAvatar) => void;
  onDeleteProfile: (profileId: string) => void;
  onUpdateProfile: (name: string, ageGroup?: AgeGroup, avatar?: LearnerAvatar) => void;
}

export function LearnersPanel({
  store,
  activeProfileId,
  canDeleteProfile,
  startInAddMode = false,
  onAddModeConsumed,
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
  const [adding, setAdding] = useState(startInAddMode);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAgeGroup, setNewChildAgeGroup] = useState<AgeGroup>('nursery');
  const [newChildAvatar, setNewChildAvatar] = useState<LearnerAvatar>('boy');
  const [saveMessage, setSaveMessage] = useState('');
  const [addError, setAddError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteNameDraft, setDeleteNameDraft] = useState('');

  useEffect(() => {
    setNameDraft(store.profile?.name ?? defaultName);
    setAgeGroupDraft(store.profile?.ageGroup === 'class1' ? 'class1' : 'nursery');
    setAvatarDraft(store.profile?.avatar ?? 'boy');
    setConfirmDelete(false);
    setDeleteNameDraft('');
    setSaveMessage('');
  }, [
    store.profile?.id,
    store.profile?.name,
    store.profile?.ageGroup,
    store.profile?.avatar,
    defaultName,
  ]);

  useEffect(() => {
    if (!startInAddMode) return;
    setAdding(true);
    onAddModeConsumed?.();
  }, [startInAddMode]);

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

  function resetAddForm() {
    setNewChildName('');
    setNewChildAgeGroup('nursery');
    setNewChildAvatar('boy');
    setAddError('');
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
    resetAddForm();
    setAdding(false);
    setSaveMessage(tUi('parent.learnerAdded'));
  }

  return (
    <>
      <div className="learn-panel-section learn-form-stack">
        <h2 className="learn-section-title">{tUi('parent.childProfile')}</h2>
        <div className="learn-field">
          <span className="learn-field-label">{tUi('welcome.chooseAvatar')}</span>
          <AvatarPicker
            value={avatarDraft}
            onChange={(nextAvatar) => {
              setAvatarDraft(nextAvatar);
              setSaveMessage('');
            }}
          />
        </div>
        <label className="learn-field" htmlFor="child-name">
          <span className="learn-field-label">{tUi('parent.name')}</span>
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
        </label>
        <label className="learn-field" htmlFor="child-age-group">
          <span className="learn-field-label">{tUi('parent.ageGroup')}</span>
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
        </label>
        <p className="learn-subtitle">{tUi('parent.ageClass1Note')}</p>
        <button type="button" className="learn-btn learn-form-action" onClick={saveProfile}>
          {tUi('parent.save')}
        </button>
        {saveMessage ? <p className="learn-subtitle" role="status">{saveMessage}</p> : null}
      </div>

      {canAddProfile() ? (
        <div className="learn-panel-section">
          {adding ? (
            <div className="learn-form-stack">
              <h2 className="learn-section-title">{tUi('parent.addChild')}</h2>
              <div className="learn-field">
                <span className="learn-field-label">{tUi('welcome.chooseAvatar')}</span>
                <AvatarPicker value={newChildAvatar} onChange={setNewChildAvatar} />
              </div>
              <label className="learn-field" htmlFor="new-child-name">
                <span className="learn-field-label">{tUi('parent.name')}</span>
                <input
                  id="new-child-name"
                  className="learn-text-input"
                  value={newChildName}
                  onChange={(event) => {
                    setNewChildName(event.target.value);
                    setAddError('');
                  }}
                  placeholder={tUi('welcome.namePlaceholder')}
                  maxLength={32}
                />
              </label>
              <label className="learn-field" htmlFor="new-child-age">
                <span className="learn-field-label">{tUi('parent.ageGroup')}</span>
                <select
                  id="new-child-age"
                  className="learn-text-input"
                  value={newChildAgeGroup}
                  onChange={(event) => setNewChildAgeGroup(event.target.value as AgeGroup)}
                >
                  <option value="nursery">{tUi('parent.ageNursery')}</option>
                  <option value="class1">{tUi('parent.ageClass1')}</option>
                </select>
              </label>
              {addError ? <p className="learn-form-error" role="alert">{addError}</p> : null}
              <div className="learn-profile-row learn-profile-row-wrap">
                <button type="button" className="learn-btn learn-btn-compact" onClick={addProfile} disabled={!newChildName.trim()}>
                  {tUi('parent.addChild')}
                </button>
                <button
                  type="button"
                  className="learn-btn learn-btn-secondary learn-btn-compact"
                  onClick={() => {
                    setAdding(false);
                    resetAddForm();
                  }}
                >
                  {tUi('parent.cancelAdd')}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="learn-btn learn-btn-secondary" onClick={() => setAdding(true)}>
              {tUi('parent.addAnother')}
            </button>
          )}
        </div>
      ) : (
        <p className="learn-subtitle">{tUi('welcome.profileLimit', { count: MAX_PROFILES })}</p>
      )}

      {canDeleteProfile ? (
        <div className="learn-panel-section learn-delete-section">
          <h2 className="learn-section-title">{tUi('parent.removeLearner')}</h2>
          {confirmDelete ? (
            <div className="learn-delete-confirm">
              <p className="learn-subtitle">
                {tUi('parent.deleteConfirmNamed', { name: nameDraft.trim() || defaultName })}
              </p>
              <label className="learn-field-label" htmlFor="delete-confirm-name">
                {tUi('parent.deleteTypeName', { name: nameDraft.trim() || defaultName })}
              </label>
              <input
                id="delete-confirm-name"
                className="learn-text-input"
                value={deleteNameDraft}
                onChange={(event) => setDeleteNameDraft(event.target.value)}
                placeholder={nameDraft.trim() || defaultName}
                autoComplete="off"
              />
              <div className="learn-profile-row learn-profile-row-wrap">
                <button
                  type="button"
                  className="learn-btn learn-btn-secondary learn-btn-compact"
                  onClick={() => {
                    setConfirmDelete(false);
                    setDeleteNameDraft('');
                  }}
                >
                  {tUi('parent.deleteCancel')}
                </button>
                <button
                  type="button"
                  className="learn-btn learn-btn-compact learn-btn-danger"
                  disabled={deleteNameDraft.trim() !== (nameDraft.trim() || defaultName)}
                  onClick={() => onDeleteProfile(activeProfileId)}
                >
                  {tUi('parent.deletePermanently')}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="learn-text-danger"
              onClick={() => setConfirmDelete(true)}
            >
              {tUi('parent.deleteProfileLink', { name: nameDraft.trim() || defaultName })}
            </button>
          )}
        </div>
      ) : null}
    </>
  );
}
