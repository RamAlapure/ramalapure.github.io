import { devanagariTracePaths } from './paths-devanagari';
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

function circlePoints(center: TracePoint, radius: number, count = 40): TracePoint[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  });
}

function pathFromSegments(
  id: TracePath['id'],
  label: string,
  segments: TracePoint[][],
  tolerance = 0.1,
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

function pathFromPoints(id: TracePath['id'], label: string, points: TracePoint[], tolerance = 0.1): TracePath {
  return pathFromSegments(id, label, [points], tolerance);
}

const lineHorizontal = pathFromPoints(
  'line-horizontal',
  'Straight line',
  linePoints({ x: 0.12, y: 0.5 }, { x: 0.88, y: 0.5 }),
);

const lineVertical = pathFromPoints(
  'line-vertical',
  'Straight line',
  linePoints({ x: 0.5, y: 0.12 }, { x: 0.5, y: 0.88 }),
);

const curve = pathFromPoints(
  'curve',
  'Curve',
  quadraticCurvePoints({ x: 0.12, y: 0.78 }, { x: 0.5, y: 0.18 }, { x: 0.88, y: 0.78 }),
);

const circle = pathFromPoints(
  'circle',
  'Circle',
  circlePoints({ x: 0.5, y: 0.5 }, 0.32),
  0.11,
);

const zigzag = pathFromSegments(
  'zigzag',
  'Zig-zag',
  [
    linePoints({ x: 0.1, y: 0.3 }, { x: 0.3, y: 0.7 }, 8),
    linePoints({ x: 0.3, y: 0.7 }, { x: 0.5, y: 0.3 }, 8),
    linePoints({ x: 0.5, y: 0.3 }, { x: 0.7, y: 0.7 }, 8),
    linePoints({ x: 0.7, y: 0.7 }, { x: 0.9, y: 0.3 }, 8),
  ],
  0.12,
  true,
);

const letterA = pathFromSegments(
  'letter-a',
  'A',
  [
    linePoints({ x: 0.38, y: 0.82 }, { x: 0.5, y: 0.22 }, 12),
    linePoints({ x: 0.5, y: 0.22 }, { x: 0.62, y: 0.82 }, 12),
    linePoints({ x: 0.42, y: 0.58 }, { x: 0.58, y: 0.58 }, 8),
  ],
  0.14,
  true,
);

const letterB = pathFromSegments(
  'letter-b',
  'B',
  [
    linePoints({ x: 0.38, y: 0.2 }, { x: 0.38, y: 0.82 }, 14),
    quadraticCurvePoints({ x: 0.38, y: 0.2 }, { x: 0.72, y: 0.32 }, { x: 0.38, y: 0.5 }, 14),
    quadraticCurvePoints({ x: 0.38, y: 0.5 }, { x: 0.74, y: 0.66 }, { x: 0.38, y: 0.82 }, 14),
  ],
  0.15,
  true,
);

const number1 = pathFromSegments(
  'number-1',
  '1',
  [
    linePoints({ x: 0.42, y: 0.28 }, { x: 0.5, y: 0.2 }, 4),
    linePoints({ x: 0.5, y: 0.2 }, { x: 0.5, y: 0.82 }, 16),
  ],
  0.11,
  true,
);

const number2 = pathFromSegments(
  'number-2',
  '2',
  [
    linePoints({ x: 0.22, y: 0.32 }, { x: 0.72, y: 0.32 }, 8),
    quadraticCurvePoints({ x: 0.72, y: 0.32 }, { x: 0.78, y: 0.62 }, { x: 0.28, y: 0.82 }, 14),
    linePoints({ x: 0.28, y: 0.82 }, { x: 0.76, y: 0.82 }, 8),
  ],
  0.14,
  true,
);

const shapeTriangle = pathFromSegments(
  'shape-triangle',
  'Triangle',
  [
    linePoints({ x: 0.5, y: 0.18 }, { x: 0.2, y: 0.82 }, 12),
    linePoints({ x: 0.2, y: 0.82 }, { x: 0.8, y: 0.82 }, 12),
    linePoints({ x: 0.8, y: 0.82 }, { x: 0.5, y: 0.18 }, 12),
  ],
  0.12,
  true,
);

export const tracePaths: Record<TracePath['id'], TracePath> = {
  'line-horizontal': lineHorizontal,
  'line-vertical': lineVertical,
  curve,
  circle,
  zigzag,
  'letter-a': letterA,
  'letter-b': letterB,
  'number-1': number1,
  'number-2': number2,
  'shape-triangle': shapeTriangle,
  ...(devanagariTracePaths as Record<TracePath['id'], TracePath>),
};

export function getTracePath(patternId: TracePath['id']): TracePath {
  const path = tracePaths[patternId];
  if (!path) {
    throw new Error(`Unknown trace pattern: ${patternId}`);
  }
  return path;
}
