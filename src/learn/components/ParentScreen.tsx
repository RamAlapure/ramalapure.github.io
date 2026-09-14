import { useEffect, useState } from 'react';
import type { SubjectId } from '../app/types';
import { getActivityCount, getTotalActivityCount } from '../curriculum/nursery';
import { subjects } from '../curriculum/subjects';
import { isValidPin, verifyParentPin } from '../parent/pin';
import { badgesBySubject } from '../rewards/badges';
import { useLearnI18n } from '../context/LearnI18nContext';
import { learnerAvatarEmoji, type LearnerAvatar } from '../storage/profile-avatar';
import {
  canAddProfile,
  DEFAULT_LEARNER_NAME,
  isDuplicateProfileName,
  MAX_PROFILES,
  type AgeGroup,
} from '../storage/store';
import { AvatarPicker } from './AvatarPicker';
import type { ChildProfile, LearnSettings, LearnStore } from '../storage/types';
import { AdaptiveInfoSection } from './AdaptiveInfoSection';
import { FeedbackForm } from './FeedbackForm';
import { ParentDashboard } from './ParentDashboard';
import { SkillProgressSection } from './SkillProgressSection';

interface ParentScreenProps {
  store: LearnStore;
  profiles: ChildProfile[];
  activeProfileId: string;
  canDeleteProfile: boolean;
  onSwitchProfile: (profileId: string) => void;
  onAddProfile: (name: string, ageGroup: AgeGroup, avatar: LearnerAvatar) => void;
  onDeleteProfile: (profileId: string) => void;
  onUpdateProfile: (name: string, ageGroup?: AgeGroup, avatar?: LearnerAvatar) => void;
  onUpdateSettings: (settings: Partial<LearnSettings>) => void;
  onChangePin: (pin: string) => void;
  onPracticeSubject: (subjectId: SubjectId) => void;
  onBack: () => void;
}

function profileDisplayName(name: string, defaultName: string): string {
  return name === DEFAULT_LEARNER_NAME ? defaultName : name;
}

export function ParentScreen({
  store,
  profiles,
  activeProfileId,
  canDeleteProfile,
  onSwitchProfile,
  onAddProfile,
  onDeleteProfile,
  onUpdateProfile,
  onUpdateSettings,
  onChangePin,
  onPracticeSubject,
  onBack,
}: ParentScreenProps) {
  const { tUi, tUiDigits, tSubject, tBadge, formatCount } = useLearnI18n();
  const defaultName = tUi('profile.defaultName');
  const settings = store.settings ?? {
    soundEnabled: true,
    slowSpeech: false,
    highContrast: false,
    language: 'en',
  };
  const rewards = store.rewards ?? {
    points: 0,
    totalStars: 0,
    badges: [],
    dailyStreak: 0,
  };
  const sessions = store.sessions ?? {
    sessionsCompleted: 0,
    bySubject: {},
  };
  const [nameDraft, setNameDraft] = useState(store.profile?.name ?? defaultName);
  const [ageGroupDraft, setAgeGroupDraft] = useState<AgeGroup>(
    store.profile?.ageGroup === 'class1' ? 'class1' : 'nursery',
  );
  const [avatarDraft, setAvatarDraft] = useState<LearnerAvatar>(store.profile?.avatar ?? 'boy');
  const [newChildName, setNewChildName] = useState('');
  const [newChildAgeGroup, setNewChildAgeGroup] = useState<AgeGroup>('nursery');
  const [newChildAvatar, setNewChildAvatar] = useState<LearnerAvatar>('boy');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [addError, setAddError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setNameDraft(store.profile?.name ?? defaultName);
    setAgeGroupDraft(store.profile?.ageGroup === 'class1' ? 'class1' : 'nursery');
    setAvatarDraft(store.profile?.avatar ?? 'boy');
    setConfirmDelete(false);
  }, [store.profile?.id, store.profile?.name, store.profile?.ageGroup, store.profile?.avatar, defaultName]);

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

  function handleAvatarChange(nextAvatar: LearnerAvatar) {
    setAvatarDraft(nextAvatar);
    onUpdateProfile(nameDraft, ageGroupDraft, nextAvatar);
    setSaveMessage(tUi('parent.saved'));
  }

  function handleAgeGroupChange(nextAgeGroup: AgeGroup) {
    setAgeGroupDraft(nextAgeGroup);
    onUpdateProfile(nameDraft, nextAgeGroup, avatarDraft);
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
    <>
      <header className="learn-header">
        <div>
          <h1 className="learn-title">{tUi('parent.dashboard')}</h1>
          <p className="learn-subtitle">{tUi('parent.privacy')}</p>
        </div>
        <button type="button" className="learn-icon-btn" aria-label={tUi('nav.backHome')} onClick={onBack}>
          ←
        </button>
      </header>

      <section className="learn-panel learn-parent-panel">
        <ParentDashboard store={store} onPracticeSubject={onPracticeSubject} />

        <div className="learn-panel-section">
          <h2 className="learn-section-title">{tUi('parent.profiles')}</h2>
          <div className="learn-profile-switcher">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                className={`learn-profile-chip ${profile.id === activeProfileId ? 'is-active' : ''}`.trim()}
                onClick={() => onSwitchProfile(profile.id)}
              >
                {learnerAvatarEmoji(profile.avatar)} {profileDisplayName(profile.name, defaultName)}
              </button>
            ))}
          </div>
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

        <div className="learn-panel-section">
          <h2 className="learn-section-title">{tUi('parent.childProfile')}</h2>
          <span className="learn-field-label">{tUi('welcome.chooseAvatar')}</span>
          <AvatarPicker value={avatarDraft} onChange={handleAvatarChange} />
          <label className="learn-field-label" htmlFor="child-name">{tUi('parent.name')}</label>
          <div className="learn-profile-row learn-profile-row-wrap">
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
            <button type="button" className="learn-btn learn-btn-compact" onClick={saveProfile}>
              {tUi('parent.save')}
            </button>
          </div>
          {saveMessage ? <p className="learn-subtitle">{saveMessage}</p> : null}
          <label className="learn-field-label" htmlFor="child-age-group">{tUi('parent.ageGroup')}</label>
          <select
            id="child-age-group"
            className="learn-text-input"
            value={ageGroupDraft}
            onChange={(event) => handleAgeGroupChange(event.target.value as AgeGroup)}
          >
            <option value="nursery">{tUi('parent.ageNursery')}</option>
            <option value="class1">{tUi('parent.ageClass1')}</option>
          </select>
          <p className="learn-subtitle">{tUi('parent.ageClass1Note')}</p>
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
          {pinMessage ? <p className="learn-subtitle">{pinMessage}</p> : null}
        </div>

        <div className="learn-panel-section">
          <h2 className="learn-section-title">{tUi('parent.feedback.title')}</h2>
          <p className="learn-subtitle">{tUi('parent.feedback.subtitle')}</p>
          <FeedbackForm />
        </div>

        <ul className="learn-stat-list learn-stat-summary">
          <li><span>{tUi('parent.practiceRounds')}</span><strong>{formatCount(sessions.sessionsCompleted)}</strong></li>
          <li><span>{tUi('parent.totalStars')}</span><strong>⭐ {formatCount(rewards.totalStars)}</strong></li>
          <li><span>{tUi('parent.totalPoints')}</span><strong>🏆 {formatCount(rewards.points)}</strong></li>
          <li><span>{tUi('parent.dayStreak')}</span><strong>🔥 {formatCount(rewards.dailyStreak)}</strong></li>
        </ul>

        <AdaptiveInfoSection store={store} />

        <SkillProgressSection store={store} />

        <div className="learn-panel-section">
          <h2 className="learn-section-title">{tUi('parent.badges')}</h2>
          {rewards.badges.length > 0 ? (
            <div className="learn-badge-grid">
              {rewards.badges.map((badgeId) => {
                const badge = badgesBySubject[badgeId];
                if (!badge) return null;
                return (
                  <div key={badgeId} className="learn-badge-card">
                    <span className="learn-badge-emoji" aria-hidden="true">{badge.emoji}</span>
                    <span className="learn-badge-name">{tBadge(badgeId)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="learn-subtitle">{tUi('parent.badgesEmpty')}</p>
          )}
        </div>

        <div className="learn-panel-section">
          <h2 className="learn-section-title">{tUi('parent.subjects')}</h2>
          <p className="learn-subtitle">
            {tUiDigits('parent.subjectsSummary', { count: getTotalActivityCount() })}
          </p>
          <ul className="learn-stat-list">
            {subjects.map((subject) => (
              <li key={subject.id}>
                <span>{tSubject(subject.id)}</span>
                <strong>
                  {tUiDigits('parent.subjectRounds', {
                    rounds: sessions.bySubject[subject.id] ?? 0,
                    activities: getActivityCount(subject.id),
                  })}
                </strong>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
