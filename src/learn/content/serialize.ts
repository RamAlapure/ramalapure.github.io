import type { Activity, ShapeKind } from '../app/types';
import type { ActivityAuthoring, SubjectActivityPack } from './types';

function correctId(choices: Array<{ id: string; correct: boolean }>): string {
  const match = choices.find((choice) => choice.correct);
  if (!match) {
    throw new Error('Activity is missing a correct choice.');
  }
  return match.id;
}

export function serializeActivity(activity: Activity): ActivityAuthoring {
  const base = {
    id: activity.id,
    type: activity.type,
    subjectId: activity.subjectId,
    skill: activity.skill,
    instructionKey: activity.id,
    ageGroup: activity.ageGroup,
    difficulty: activity.difficulty,
  };

  switch (activity.type) {
    case 'MULTIPLE_CHOICE':
      return {
        ...base,
        type: 'MULTIPLE_CHOICE',
        options: activity.content.choices.map((choice) => ({ id: choice.id, label: choice.label })),
        answer: correctId(activity.content.choices),
      };
    case 'IMAGE_CHOICE':
      return {
        ...base,
        type: 'IMAGE_CHOICE',
        options: activity.content.choices.map((choice) => ({
          id: choice.id,
          label: choice.label,
          image: choice.image,
        })),
        answer: correctId(activity.content.choices),
      };
    case 'COUNTING':
      return {
        ...base,
        type: 'COUNTING',
        itemEmoji: activity.content.itemEmoji,
        count: activity.content.count,
      };
    case 'MATCHING':
      return {
        ...base,
        type: 'MATCHING',
        pairs: activity.content.pairs,
      };
    case 'COLOR_SELECTION':
      return {
        ...base,
        type: 'COLOR_SELECTION',
        target: activity.content.targetId,
      };
    case 'SHAPE_SELECTION':
      return {
        ...base,
        type: 'SHAPE_SELECTION',
        target: activity.content.targetId as ShapeKind,
      };
    case 'TRACING':
      return {
        ...base,
        type: 'TRACING',
        patternId: activity.content.patternId,
        displayLabel: activity.content.displayLabel,
      };
    default: {
      const unexpected: never = activity;
      throw new Error(`Cannot serialize activity type: ${(unexpected as Activity).type}`);
    }
  }
}

export function serializeSubjectPack(
  activities: Activity[],
  ageGroup = 'nursery',
): SubjectActivityPack {
  return {
    ageGroup,
    activities: activities.map(serializeActivity),
  };
}
