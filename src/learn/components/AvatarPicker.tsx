import { useLearnI18n } from '../context/LearnI18nContext';
import { learnerAvatarEmoji, type LearnerAvatar } from '../storage/profile-avatar';

interface AvatarPickerProps {
  value: LearnerAvatar;
  onChange: (avatar: LearnerAvatar) => void;
}

const AVATAR_OPTIONS: LearnerAvatar[] = ['boy', 'girl'];

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const { tUi } = useLearnI18n();

  return (
    <div className="learn-avatar-picker" role="group" aria-label={tUi('welcome.chooseAvatar')}>
      {AVATAR_OPTIONS.map((avatar) => (
        <button
          key={avatar}
          type="button"
          className={`learn-avatar-option ${value === avatar ? 'is-active' : ''}`.trim()}
          aria-pressed={value === avatar}
          onClick={() => onChange(avatar)}
        >
          <span className="learn-avatar-option-emoji" aria-hidden="true">
            {learnerAvatarEmoji(avatar)}
          </span>
          <span>{tUi(`profile.${avatar}`)}</span>
        </button>
      ))}
    </div>
  );
}
