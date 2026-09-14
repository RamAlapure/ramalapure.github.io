export type LearnScreen = 'welcome' | 'home' | 'activity' | 'result' | 'parent';

export type SubjectId =
  | 'alphabet'
  | 'numbers'
  | 'colors'
  | 'shapes'
  | 'animals'
  | 'games'
  | 'writing';

export type ActivityType =
  | 'MULTIPLE_CHOICE'
  | 'IMAGE_CHOICE'
  | 'COUNTING'
  | 'MATCHING'
  | 'COLOR_SELECTION'
  | 'SHAPE_SELECTION'
  | 'TRACING';

export type ShapeKind = 'circle' | 'square' | 'triangle' | 'rectangle' | 'oval';

export interface Subject {
  id: SubjectId;
  label: string;
  emoji: string;
}

export interface ActivityBase {
  id: string;
  type: ActivityType;
  subjectId: SubjectId;
  skill: string;
  ageGroup: string;
  difficulty: number;
  instruction: string;
}

export interface MultipleChoiceContent {
  choices: Array<{ id: string; label: string; correct: boolean }>;
}

export interface ImageChoiceContent {
  choices: Array<{ id: string; label: string; image: string; correct: boolean }>;
}

export interface CountingContent {
  itemEmoji: string;
  count: number;
  choices: number[];
}

export interface MatchingContent {
  pairs: Array<{ id: string; left: string; right: string }>;
}

export interface ColorSelectionContent {
  targetId: string;
  swatches: Array<{ id: string; color: string; label: string }>;
}

export interface ShapeSelectionContent {
  targetId: string;
  shapes: Array<{ id: string; kind: ShapeKind; label: string }>;
}

export interface TracingContent {
  patternId:
    | 'line-horizontal'
    | 'line-vertical'
    | 'curve'
    | 'circle'
    | 'zigzag'
    | 'letter-a'
    | 'letter-b'
    | 'number-1'
    | 'number-2'
    | 'shape-triangle'
    | 'devanagari-a'
    | 'devanagari-b'
    | 'devanagari-c'
    | 'devanagari-d'
    | 'devanagari-e'
    | 'devanagari-f'
    | 'devanagari-g'
    | 'devanagari-h'
    | 'devanagari-i'
    | 'devanagari-j'
    | 'devanagari-1'
    | 'devanagari-2';
  displayLabel?: string;
}

export type Activity =
  | (ActivityBase & { type: 'MULTIPLE_CHOICE'; content: MultipleChoiceContent })
  | (ActivityBase & { type: 'IMAGE_CHOICE'; content: ImageChoiceContent })
  | (ActivityBase & { type: 'COUNTING'; content: CountingContent })
  | (ActivityBase & { type: 'MATCHING'; content: MatchingContent })
  | (ActivityBase & { type: 'COLOR_SELECTION'; content: ColorSelectionContent })
  | (ActivityBase & { type: 'SHAPE_SELECTION'; content: ShapeSelectionContent })
  | (ActivityBase & { type: 'TRACING'; content: TracingContent });

export interface SessionResult {
  subjectId: SubjectId;
  activityId: string;
  correct: boolean;
  completedAt: string;
}
