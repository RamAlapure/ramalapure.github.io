import type { TracePath, TracePoint } from './types';

function linePoints(start: TracePoint, end: TracePoint, count = 24): TracePoint[] {
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    return {
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
    };
  });
}

function quadraticCurvePoints(
  start: TracePoint,
  control: TracePoint,
  end: TracePoint,
  count = 28,
): TracePoint[] {
  return Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    const inverse = 1 - t;
    return {
      x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
      y: inverse * inverse * start.y + 2 * inverse * t * control.y + t * t * end.y,
    };
  });
}

function pathFromSegments(
  id: TracePath['id'],
  label: string,
  segments: TracePoint[][],
  tolerance = 0.12,
  multiStroke = false,
): TracePath {
  const points = segments.flat();
  return {
    id,
    label,
    points,
    segments,
    start: points[0],
    end: points[points.length - 1],
    tolerance,
    multiStroke,
  };
}

/** Simplified Devanagari nursery letter strokes (अ–ज). */
export const devanagariTracePaths: Partial<Record<TracePath['id'], TracePath>> = {
  'devanagari-a': pathFromSegments(
    'devanagari-a',
    'अ',
    [quadraticCurvePoints({ x: 0.62, y: 0.2 }, { x: 0.14, y: 0.5 }, { x: 0.62, y: 0.8 })],
    0.14,
  ),
  'devanagari-b': pathFromSegments(
    'devanagari-b',
    'ब',
    [
      linePoints({ x: 0.22, y: 0.2 }, { x: 0.78, y: 0.2 }, 10),
      linePoints({ x: 0.32, y: 0.2 }, { x: 0.32, y: 0.82 }, 14),
      quadraticCurvePoints({ x: 0.32, y: 0.36 }, { x: 0.8, y: 0.58 }, { x: 0.32, y: 0.82 }, 18),
    ],
    0.15,
    true,
  ),
  'devanagari-c': pathFromSegments(
    'devanagari-c',
    'क',
    [
      linePoints({ x: 0.28, y: 0.22 }, { x: 0.28, y: 0.78 }, 12),
      linePoints({ x: 0.28, y: 0.22 }, { x: 0.72, y: 0.42 }, 10),
      linePoints({ x: 0.72, y: 0.42 }, { x: 0.72, y: 0.78 }, 10),
    ],
    0.14,
    true,
  ),
  'devanagari-d': pathFromSegments(
    'devanagari-d',
    'द',
    [
      quadraticCurvePoints({ x: 0.24, y: 0.42 }, { x: 0.5, y: 0.16 }, { x: 0.76, y: 0.42 }, 14),
      linePoints({ x: 0.5, y: 0.42 }, { x: 0.5, y: 0.8 }, 10),
    ],
    0.14,
    true,
  ),
  'devanagari-e': pathFromSegments(
    'devanagari-e',
    'ए',
    [
      linePoints({ x: 0.3, y: 0.24 }, { x: 0.3, y: 0.78 }, 12),
      linePoints({ x: 0.3, y: 0.24 }, { x: 0.7, y: 0.24 }, 10),
      linePoints({ x: 0.7, y: 0.24 }, { x: 0.7, y: 0.78 }, 10),
    ],
    0.14,
    true,
  ),
  'devanagari-f': pathFromSegments(
    'devanagari-f',
    'फ',
    [
      linePoints({ x: 0.34, y: 0.2 }, { x: 0.34, y: 0.82 }, 14),
      quadraticCurvePoints({ x: 0.34, y: 0.2 }, { x: 0.72, y: 0.34 }, { x: 0.34, y: 0.5 }, 12),
      linePoints({ x: 0.5, y: 0.12 }, { x: 0.62, y: 0.12 }, 4),
    ],
    0.15,
    true,
  ),
  'devanagari-g': pathFromSegments(
    'devanagari-g',
    'ग',
    [
      linePoints({ x: 0.3, y: 0.22 }, { x: 0.3, y: 0.78 }, 12),
      linePoints({ x: 0.3, y: 0.22 }, { x: 0.7, y: 0.22 }, 10),
      linePoints({ x: 0.7, y: 0.22 }, { x: 0.7, y: 0.5 }, 8),
      linePoints({ x: 0.7, y: 0.5 }, { x: 0.3, y: 0.5 }, 8),
    ],
    0.14,
    true,
  ),
  'devanagari-h': pathFromSegments(
    'devanagari-h',
    'ह',
    [
      linePoints({ x: 0.28, y: 0.2 }, { x: 0.28, y: 0.8 }, 12),
      quadraticCurvePoints({ x: 0.28, y: 0.5 }, { x: 0.62, y: 0.28 }, { x: 0.74, y: 0.5 }, 12),
      linePoints({ x: 0.74, y: 0.5 }, { x: 0.74, y: 0.8 }, 8),
    ],
    0.14,
    true,
  ),
  'devanagari-i': pathFromSegments(
    'devanagari-i',
    'ई',
    [
      linePoints({ x: 0.4, y: 0.24 }, { x: 0.4, y: 0.76 }, 12),
      linePoints({ x: 0.6, y: 0.24 }, { x: 0.6, y: 0.76 }, 12),
      linePoints({ x: 0.36, y: 0.2 }, { x: 0.64, y: 0.2 }, 6),
    ],
    0.12,
    true,
  ),
  'devanagari-1': pathFromSegments(
    'devanagari-1',
    '१',
    [
      quadraticCurvePoints({ x: 0.58, y: 0.18 }, { x: 0.76, y: 0.42 }, { x: 0.4, y: 0.82 }, 20),
      linePoints({ x: 0.4, y: 0.82 }, { x: 0.62, y: 0.82 }, 6),
    ],
    0.14,
    true,
  ),
  'devanagari-2': pathFromSegments(
    'devanagari-2',
    '२',
    [
      quadraticCurvePoints({ x: 0.24, y: 0.34 }, { x: 0.52, y: 0.14 }, { x: 0.78, y: 0.34 }, 14),
      linePoints({ x: 0.78, y: 0.34 }, { x: 0.3, y: 0.82 }, 12),
      linePoints({ x: 0.3, y: 0.82 }, { x: 0.76, y: 0.82 }, 10),
    ],
    0.14,
    true,
  ),
  'devanagari-j': pathFromSegments(
    'devanagari-j',
    'ज',
    [
      linePoints({ x: 0.26, y: 0.24 }, { x: 0.26, y: 0.78 }, 12),
      quadraticCurvePoints({ x: 0.26, y: 0.5 }, { x: 0.58, y: 0.3 }, { x: 0.74, y: 0.5 }, 12),
      linePoints({ x: 0.74, y: 0.5 }, { x: 0.74, y: 0.78 }, 8),
    ],
    0.14,
    true,
  ),
};
