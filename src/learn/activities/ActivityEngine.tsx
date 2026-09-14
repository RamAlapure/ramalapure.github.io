import type { Activity } from '../app/types';
import { ColorSelectionRenderer } from './renderers/ColorSelectionRenderer';
import { CountingRenderer } from './renderers/CountingRenderer';
import { ImageChoiceRenderer } from './renderers/ImageChoiceRenderer';
import { MatchingRenderer } from './renderers/MatchingRenderer';
import { MultipleChoiceRenderer } from './renderers/MultipleChoiceRenderer';
import { ShapeSelectionRenderer } from './renderers/ShapeSelectionRenderer';
import { TracingRenderer } from './renderers/TracingRenderer';

interface ActivityEngineProps {
  activity: Activity;
  onComplete: (correct: boolean) => void;
}

export function ActivityEngine({ activity, onComplete }: ActivityEngineProps) {
  switch (activity.type) {
    case 'MULTIPLE_CHOICE':
      return <MultipleChoiceRenderer activity={activity} onComplete={onComplete} />;
    case 'IMAGE_CHOICE':
      return <ImageChoiceRenderer activity={activity} onComplete={onComplete} />;
    case 'COUNTING':
      return <CountingRenderer activity={activity} onComplete={onComplete} />;
    case 'MATCHING':
      return <MatchingRenderer activity={activity} onComplete={onComplete} />;
    case 'COLOR_SELECTION':
      return <ColorSelectionRenderer activity={activity} onComplete={onComplete} />;
    case 'SHAPE_SELECTION':
      return <ShapeSelectionRenderer activity={activity} onComplete={onComplete} />;
    case 'TRACING':
      return <TracingRenderer activity={activity} onComplete={onComplete} />;
    default: {
      const unexpected: never = activity;
      throw new Error(`Unhandled activity type: ${(unexpected as Activity).type}`);
    }
  }
}
