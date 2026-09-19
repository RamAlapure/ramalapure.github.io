import { useState, type FormEvent } from 'react';
import { useLearnI18n } from '../context/LearnI18nContext';
import {
  canAddProfile,
  DEFAULT_LEARNER_NAME,
  isDuplicateProfileName,
  MAX_PROFILES,
} from '../storage/store';
import type { ProfileSummary } from '../storage/store';
import { learnerAvatarEmoji, type LearnerAvatar } from '../storage/profile-avatar';
import { AvatarPicker } from './AvatarPicker';
import { GrownUpSettingsSheet } from './GrownUpSettingsSheet';

type WelcomeMode = 'pick' | 'name' | 'new';

interface WelcomeScreenProps {
  profiles: ProfileSummary[];
  onConfirmProfile: (profileId: string) => void;
  onSaveName: (profileId: string, name: string, avatar: LearnerAvatar) => void;
  onCreateProfile: (name: string, avatar: LearnerAvatar) => void;
  onRequestNewLearner: () => void;
  onOpenParentHub: () => void;
  onComplete: () => void;
}

export function WelcomeScreen({
  profiles,
  onConfirmProfile,
  onSaveName,
  onCreateProfile,
  onRequestNewLearner,
  onOpenParentHub,
  onComplete,
}: WelcomeScreenProps) {
  const { tUi, tUiDigits, formatCount } = useLearnI18n();
  const [mode, setMode] = useState<WelcomeMode>(profiles.length === 0 ? 'new' : 'pick');
  const [pendingProfileId, setPendingProfileId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<LearnerAvatar>('boy');
  const [nameError, setNameError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  function displayName(profileName: string): string {
    return profileName === DEFAULT_LEARNER_NAME ? tUi('profile.defaultName') : profileName;
  }

  function resetForm() {
    setName('');
    setAvatar('boy');
    setNameError('');
    setPendingProfileId(null);
  }

  function handleProfileSelect(profile: ProfileSummary) {
    setPendingProfileId(profile.id);
    if (profile.needsName) {
      setMode('name');
      setName('');
      setAvatar(profile.avatar ?? 'boy');
      setNameError('');
      return;
    }
    onConfirmProfile(profile.id);
    onComplete();
  }

  function validateName(trimmed: string, profileId?: string): boolean {
    if (!trimmed) return false;
    if (isDuplicateProfileName(trimmed, profileId)) {
      setNameError(tUi('welcome.duplicateName'));
      return false;
    }
    setNameError('');
    return true;
  }

  function handleNameSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    if (mode === 'new') {
      if (!canAddProfile()) {
        setNameError(tUi('welcome.profileLimit', { count: MAX_PROFILES }));
        return;
      }
      if (!validateName(trimmed)) return;
      onCreateProfile(trimmed, avatar);
      return;
    }

    if (!pendingProfileId) return;
    if (!validateName(trimmed, pendingProfileId)) return;
    onConfirmProfile(pendingProfileId);
    onSaveName(pendingProfileId, trimmed, avatar);
  }

  function handleBackToProfiles() {
    setMode('pick');
    resetForm();
  }

  return (
    <>
      <header className="learn-header learn-child-header">
        <div className="learn-header-spacer" aria-hidden="true" />
        <button
          type="button"
          className="learn-gear-btn"
          aria-label={tUi('settings.grownUpTitle')}
          onClick={() => setSettingsOpen(true)}
        >
          ⚙︎
        </button>
      </header>

      {settingsOpen ? (
        <GrownUpSettingsSheet
          onClose={() => setSettingsOpen(false)}
          onOpenParentHub={() => {
            setSettingsOpen(false);
            onOpenParentHub();
          }}
        />
      ) : null}

      <section className="learn-panel learn-welcome-panel">
        {mode === 'pick' ? (
          <>
            <h1 className="learn-title learn-welcome-title">{tUi('welcome.pickTitle')}</h1>
            <p className="learn-subtitle">{tUi('welcome.pickSubtitle')}</p>

            <div className="learn-profile-grid" role="list">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  className={`learn-profile-card ${profile.isActive ? 'is-last-active' : ''}`.trim()}
                  role="listitem"
                  onClick={() => handleProfileSelect(profile)}
                >
                  {profile.isActive ? (
                    <span className="learn-profile-badge">{tUi('welcome.lastActive')}</span>
                  ) : null}
                  <span className="learn-profile-avatar" aria-hidden="true">
                    {learnerAvatarEmoji(profile.avatar)}
                  </span>
                  <strong className="learn-profile-name">{displayName(profile.name)}</strong>
                  <span className="learn-profile-stats">
                    {tUiDigits('welcome.profileStars', { count: profile.totalStars })}
                  </span>
                  <span className="learn-profile-stats">
                    {tUiDigits('welcome.profileRounds', { count: profile.sessionsCompleted })}
                  </span>
                  {profile.points > 0 ? (
                    <span className="learn-profile-stats">
                      🏆 {formatCount(profile.points)}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {canAddProfile() ? (
              <button
                type="button"
                className="learn-btn learn-btn-secondary learn-welcome-btn"
                onClick={onRequestNewLearner}
              >
                {tUi('welcome.newLearner')}
              </button>
            ) : (
              <p className="learn-subtitle learn-welcome-limit">
                {tUi('welcome.profileLimit', { count: MAX_PROFILES })}
              </p>
            )}
          </>
        ) : (
          <>
            <h1 className="learn-title learn-welcome-title">
              {mode === 'new' ? tUi('welcome.title') : tUi('welcome.nameTitle')}
            </h1>
            <p className="learn-subtitle">
              {mode === 'new' ? tUi('welcome.subtitle') : tUi('welcome.nameSubtitle')}
            </p>

            <form className="learn-welcome-form" onSubmit={handleNameSubmit}>
              <span className="learn-field-label">{tUi('welcome.chooseAvatar')}</span>
              <AvatarPicker value={avatar} onChange={setAvatar} />

              <label className="learn-field-label" htmlFor="learner-name">
                {tUi('welcome.nameLabel')}
              </label>
              <input
                id="learner-name"
                className="learn-text-input learn-welcome-input"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setNameError('');
                }}
                placeholder={tUi('welcome.namePlaceholder')}
                autoComplete="name"
                autoFocus
                maxLength={32}
              />
              {nameError ? (
                <p className="learn-form-error" role="alert">{nameError}</p>
              ) : null}
              <button type="submit" className="learn-btn learn-welcome-btn" disabled={!name.trim()}>
                {tUi('welcome.start')}
              </button>
              {profiles.length > 0 ? (
                <button
                  type="button"
                  className="learn-btn learn-btn-secondary learn-welcome-btn"
                  onClick={handleBackToProfiles}
                >
                  {tUi('welcome.backToProfiles')}
                </button>
              ) : null}
            </form>
          </>
        )}
      </section>
    </>
  );
}
