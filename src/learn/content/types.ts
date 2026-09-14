import type { ActivityType, ShapeKind, SubjectId } from '../app/types';

/** Author-friendly activity JSON — compiled into runtime `Activity` objects. */
export interface ActivityAuthoringBase {
  id: string;
  type: ActivityType;
  subjectId: SubjectId;
  skill: string;
  /** Translation key — resolved to `instruction` at load time. */
  instructionKey: string;
  /** Populated by the localizer before compile; not stored in JSON. */
  instruction?: string;
  ageGroup?: string;
  difficulty?: number;
}

export interface MultipleChoiceAuthoring extends ActivityAuthoringBase {
  type: 'MULTIPLE_CHOICE';
  options: Array<{ id: string; label: string }>;
  answer: string;
}

export interface ImageChoiceAuthoring extends ActivityAuthoringBase {
  type: 'IMAGE_CHOICE';
  options: Array<{ id: string; label: string; image: string }>;
  answer: string;
}

export interface CountingAuthoring extends ActivityAuthoringBase {
  type: 'COUNTING';
  itemEmoji: string;
  count: number;
}

export interface MatchingAuthoring extends ActivityAuthoringBase {
  type: 'MATCHING';
  pairs: Array<{ id: string; left: string; right: string }>;
}

export interface ColorSelectionAuthoring extends ActivityAuthoringBase {
  type: 'COLOR_SELECTION';
  target: string;
  /** Populated by localizer for hi/mr swatch aria-labels. */
  swatchLabels?: Record<string, string>;
}

export interface ShapeSelectionAuthoring extends ActivityAuthoringBase {
  type: 'SHAPE_SELECTION';
  target: ShapeKind;
  /** Populated by localizer for hi/mr shape aria-labels. */
  shapeLabels?: Record<string, string>;
}

export interface TracingAuthoring extends ActivityAuthoringBase {
  type: 'TRACING';
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

export type ActivityAuthoring =
  | MultipleChoiceAuthoring
  | ImageChoiceAuthoring
  | CountingAuthoring
  | MatchingAuthoring
  | ColorSelectionAuthoring
  | ShapeSelectionAuthoring
  | TracingAuthoring;

export interface SubjectActivityPack {
  ageGroup: string;
  activities: ActivityAuthoring[];
}

export interface ContentValidationIssue {
  path: string;
  message: string;
}
