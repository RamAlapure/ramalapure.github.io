export type TracePatternId =
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

export interface TracePoint {
  x: number;
  y: number;
}

export interface TracePath {
  id: TracePatternId;
  label: string;
  points: TracePoint[];
  /** Separate strokes; guide and scoring skip jumps between segments. */
  segments: TracePoint[][];
  start: TracePoint;
  end: TracePoint;
  tolerance: number;
  /** Letters and shapes traced in multiple strokes — relax end-dot check. */
  multiStroke?: boolean;
}
