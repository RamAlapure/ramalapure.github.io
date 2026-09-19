import type { AdaptiveSessionPlan } from '../adaptive/engine';
import type { Activity, SubjectId } from '../app/types';

const DRAFT_KEY = 'learn-session-draft-v1';

export interface SessionDraft {
  profileId: string;
  subjectId: SubjectId;
  session: Activity[];
  sessionIndex: number;
  sessionCorrect: number;
  sessionPoints: number;
  answerStreak: number;
  sessionPlan: AdaptiveSessionPlan | null;
  activityKey: number;
}

export function readSessionDraft(): SessionDraft | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionDraft;
  } catch {
    return null;
  }
}

export function writeSessionDraft(draft: SessionDraft): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // sessionStorage may be unavailable in private mode
  }
}

export function clearSessionDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
