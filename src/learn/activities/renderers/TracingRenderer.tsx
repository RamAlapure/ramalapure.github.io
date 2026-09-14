import { useCallback, useEffect, useRef, useState } from 'react';
import type { Activity } from '../../app/types';
import { useLearnI18n } from '../../context/LearnI18nContext';
import { translateTracePattern } from '../../i18n/translate';
import { usesIndicScript } from '../../i18n/letters';
import { evaluateTrace } from '../../tracing/evaluate';
import { getTracePath } from '../../tracing/paths';
import type { TracePath, TracePoint } from '../../tracing/types';
import { ActivityFeedback } from '../ActivityFeedback';
import { completeWithFeedback } from '../complete-with-feedback';

interface TracingRendererProps {
  activity: Activity & { type: 'TRACING' };
  onComplete: (correct: boolean) => void;
}

const MIN_CANVAS_SIZE = 280;

function toNormalized(clientX: number, clientY: number, canvas: HTMLCanvasElement): TracePoint {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width > 0 ? rect.width : canvas.width;
  const height = rect.height > 0 ? rect.height : canvas.height;
  return {
    x: Math.min(1, Math.max(0, (clientX - rect.left) / width)),
    y: Math.min(1, Math.max(0, (clientY - rect.top) / height)),
  };
}

function paintGuide(
  context: CanvasRenderingContext2D,
  path: TracePath,
  size: number,
  displayLabel?: string,
  indicScript = false,
) {
  context.strokeStyle = '#cbd5e1';
  context.lineWidth = Math.max(10, size * 0.025);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.setLineDash([10, 10]);
  for (const segment of path.segments) {
    context.beginPath();
    segment.forEach((point, index) => {
      const x = point.x * size;
      const y = point.y * size;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });
    context.stroke();
  }
  context.setLineDash([]);

  if (displayLabel) {
    context.fillStyle = '#94a3b8';
    context.font = indicScript
      ? `bold ${Math.round(size * 0.22)}px "Noto Sans Devanagari", "Nirmala UI", sans-serif`
      : `bold ${Math.round(size * 0.2)}px Segoe UI, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(displayLabel, size * 0.5, size * 0.12);
  }

  context.fillStyle = '#3d9b6a';
  context.beginPath();
  context.arc(path.start.x * size, path.start.y * size, size * 0.02, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = '#e07a5f';
  context.beginPath();
  context.arc(path.end.x * size, path.end.y * size, size * 0.02, 0, Math.PI * 2);
  context.fill();
}

function paintStroke(context: CanvasRenderingContext2D, points: TracePoint[], size: number) {
  if (points.length < 2) return;
  context.strokeStyle = '#5b8def';
  context.lineWidth = Math.max(8, size * 0.02);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  points.forEach((point, index) => {
    const x = point.x * size;
    const y = point.y * size;
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();
}

export function TracingRenderer({ activity, onComplete }: TracingRendererProps) {
  const { tUi, language } = useLearnI18n();
  const indicScript = usesIndicScript(language);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const drawnRef = useRef<TracePoint[]>([]);
  const canvasSizeRef = useRef(MIN_CANVAS_SIZE);
  const [hasStroke, setHasStroke] = useState(false);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  const path = getTracePath(activity.content.patternId);
  const traceLabel =
    activity.content.displayLabel
    ?? translateTracePattern(language, activity.content.patternId)
    ?? path.label;

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const size = canvasSizeRef.current;
    context.clearRect(0, 0, size, size);
    paintGuide(context, path, size, activity.content.displayLabel, indicScript);
    paintStroke(context, drawnRef.current, size);
  }, [activity.content.displayLabel, indicScript, path]);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const width = Math.max(MIN_CANVAS_SIZE, Math.min(wrap.clientWidth, 420));
    if (width === canvasSizeRef.current && canvas.width === width) {
      redraw();
      return;
    }

    canvasSizeRef.current = width;
    canvas.width = width;
    canvas.height = width;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${width}px`;
    redraw();
  }, [redraw]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    syncCanvasSize();

    const observer = new ResizeObserver(() => {
      syncCanvasSize();
    });
    observer.observe(wrap);

    return () => observer.disconnect();
  }, [syncCanvasSize, activity.content.patternId]);

  function addPoint(point: TracePoint) {
    drawnRef.current.push(point);
    setHasStroke(true);

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!context || !canvas) return;

    const size = canvasSizeRef.current;
    const points = drawnRef.current;
    if (points.length === 1) {
      context.fillStyle = '#5b8def';
      context.beginPath();
      context.arc(point.x * size, point.y * size, Math.max(4, size * 0.012), 0, Math.PI * 2);
      context.fill();
      return;
    }

    const previous = points[points.length - 2];
    context.strokeStyle = '#5b8def';
    context.lineWidth = Math.max(8, size * 0.02);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(previous.x * size, previous.y * size);
    context.lineTo(point.x * size, point.y * size);
    context.stroke();
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (checked && correct) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    if (checked) {
      drawnRef.current = [];
      setChecked(false);
      setCorrect(false);
      redraw();
    }
    addPoint(toNormalized(event.clientX, event.clientY, event.currentTarget));
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || (checked && correct)) return;
    event.preventDefault();
    addPoint(toNormalized(event.clientX, event.clientY, event.currentTarget));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    drawingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function clearDrawing() {
    drawnRef.current = [];
    setHasStroke(false);
    setChecked(false);
    setCorrect(false);
    redraw();
  }

  function checkTracing() {
    const result = evaluateTrace(drawnRef.current, path);
    setChecked(true);
    setCorrect(result.passed);
    if (result.passed) {
      completeWithFeedback(true, onComplete, 1200);
    }
  }

  return (
    <>
      <div className="learn-trace-wrap">
        <p className="learn-trace-hint">
          {path.multiStroke
            ? tUi('tracing.hint.multi', { letter: traceLabel })
            : tUi('tracing.hint.single')}
        </p>
        <div ref={wrapRef} className="learn-trace-canvas-wrap">
          <canvas
            ref={canvasRef}
            className="learn-trace-canvas"
            aria-label={activity.instruction}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          />
        </div>
        <div className="learn-trace-actions">
          <button type="button" className="learn-btn learn-btn-secondary" onClick={clearDrawing}>
            {tUi('tracing.clear')}
          </button>
          <button
            type="button"
            className="learn-btn"
            onClick={checkTracing}
            disabled={!hasStroke || (checked && correct)}
          >
            {tUi('tracing.check')}
          </button>
        </div>
      </div>
      <ActivityFeedback answered={checked} correct={correct} />
    </>
  );
}
