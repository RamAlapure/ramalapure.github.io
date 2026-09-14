export type LearnerAvatar = 'boy' | 'girl';

export function normalizeLearnerAvatar(value?: string): LearnerAvatar | undefined {
  if (value === 'girl') return 'girl';
  if (value === 'boy') return 'boy';
  return undefined;
}

export function learnerAvatarEmoji(avatar?: LearnerAvatar): string {
  switch (avatar) {
    case 'boy':
      return '👦';
    case 'girl':
      return '👧';
    default:
      return '👤';
  }
}
