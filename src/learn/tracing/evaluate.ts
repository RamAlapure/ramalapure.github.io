import type { TracePath, TracePoint } from './types';

function distance(a: TracePoint, b: TracePoint): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function distanceToSegment(point: TracePoint, start: TracePoint, end: TracePoint): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return distance(point, start);

  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared),
  );
  return distance(point, { x: start.x + t * dx, y: start.y + t * dy });
}

function minDistanceToSegments(point: TracePoint, segments: TracePoint[][]): number {
  let min = Infinity;
  for (const segment of segments) {
    for (let index = 0; index < segment.length - 1; index++) {
      min = Math.min(min, distanceToSegment(point, segment[index], segment[index + 1]));
    }
  }
  return min;
}

function effectiveTolerance(path: TracePath): number {
  return path.multiStroke ? path.tolerance * 1.25 : path.tolerance;
}

function endedNearPath(end: TracePoint, path: TracePath): boolean {
  const tolerance = effectiveTolerance(path);
  if (distance(end, path.end) <= tolerance) return true;
  if (!path.multiStroke) return false;

  const tailStart = Math.floor(path.points.length * 0.5);
  return path.points.slice(tailStart).some((point) => distance(end, point) <= tolerance);
}

function stayedOnPath(sampled: TracePoint[], path: TracePath): boolean {
  const tolerance = effectiveTolerance(path);
  const onPathCount = sampled.filter(
    (point) => minDistanceToSegments(point, path.segments) <= tolerance,
  ).length;
  const requiredRatio = path.multiStroke ? 0.85 : 0.92;
  return onPathCount / sampled.length >= requiredRatio;
}

function guideCoverage(drawn: TracePoint[], path: TracePath): boolean {
  const tolerance = effectiveTolerance(path);
  const sampledDrawn = drawn.filter(
    (_, index) => index % SAMPLE_STEP === 0 || index === drawn.length - 1,
  );
  const sampledGuide = path.points.filter((_, index) => index % 2 === 0);
  if (sampledGuide.length === 0) return false;

  const covered = sampledGuide.filter((guidePoint) =>
    sampledDrawn.some((drawnPoint) => distance(drawnPoint, guidePoint) <= tolerance * 1.35),
  ).length;

  const requiredRatio = path.multiStroke ? 0.6 : 0.7;
  return covered / sampledGuide.length >= requiredRatio;
}

export interface TraceEvaluation {
  passed: boolean;
  startedNearGuide: boolean;
  endedNearGuide: boolean;
  stayedOnPath: boolean;
}

const MIN_DRAWN_POINTS = 12;
const SAMPLE_STEP = 3;

export function evaluateTrace(drawn: TracePoint[], path: TracePath): TraceEvaluation {
  if (drawn.length < MIN_DRAWN_POINTS) {
    return {
      passed: false,
      startedNearGuide: false,
      endedNearGuide: false,
      stayedOnPath: false,
    };
  }

  const sampled = drawn.filter((_, index) => index % SAMPLE_STEP === 0 || index === drawn.length - 1);
  const tolerance = effectiveTolerance(path);
  const startedNearGuide = distance(sampled[0], path.start) <= tolerance;
  const endedNearGuide = endedNearPath(sampled[sampled.length - 1], path);
  const onPath = stayedOnPath(sampled, path);
  const coverage = guideCoverage(drawn, path);

  const passed = path.multiStroke
    ? startedNearGuide && onPath && coverage
    : startedNearGuide && endedNearGuide && onPath;

  return {
    passed,
    startedNearGuide,
    endedNearGuide,
    stayedOnPath: onPath && coverage,
  };
}
