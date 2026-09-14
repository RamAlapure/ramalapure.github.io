import type { LearnStore } from './types';

/** @deprecated Use LearnStore from storage/types instead. */
export type ProgressState = LearnStore;

export {
  emptyStore as emptyProgress,
  readStore as readProgress,
  recordActivityAttempt,
  recordSubjectSession,
  updateChildProfile,
  updateSettings,
  type SessionCompletion,
} from './store';
