import type { SubjectId } from '../app/types';

export interface Badge {
  id: SubjectId;
  name: string;
  emoji: string;
}

export const badgesBySubject: Record<SubjectId, Badge> = {
  alphabet: { id: 'alphabet', name: 'Letter Explorer', emoji: '🔤' },
  numbers: { id: 'numbers', name: 'Number Star', emoji: '🔢' },
  colors: { id: 'colors', name: 'Color Artist', emoji: '🎨' },
  shapes: { id: 'shapes', name: 'Shape Finder', emoji: '🔷' },
  animals: { id: 'animals', name: 'Animal Explorer', emoji: '🐾' },
  games: { id: 'games', name: 'Game Champion', emoji: '🎮' },
  writing: { id: 'writing', name: 'Tracing Star', emoji: '✏️' },
};

export function getBadge(subjectId: SubjectId): Badge {
  return badgesBySubject[subjectId];
}
