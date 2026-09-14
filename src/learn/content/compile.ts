import type { Activity } from '../app/types';
import {
  colorSelection,
  counting,
  imageChoice,
  matching,
  multipleChoice,
  shapeSelection,
  tracing,
} from '../curriculum/builders';
import type { ActivityAuthoring } from './types';

function assertAnswerInOptions(
  answer: string,
  options: Array<{ id: string }>,
  activityId: string,
): void {
  if (!options.some((option) => option.id === answer)) {
    throw new Error(`Activity "${activityId}": answer "${answer}" is not in options.`);
  }
}

export function compileActivity(definition: ActivityAuthoring): Activity {
  const difficulty = definition.difficulty ?? 1;
  const instruction = definition.instruction;
  if (!instruction) {
    throw new Error(`Activity "${definition.id}" is missing a resolved instruction.`);
  }

  switch (definition.type) {
    case 'MULTIPLE_CHOICE': {
      assertAnswerInOptions(definition.answer, definition.options, definition.id);
      return multipleChoice(
        definition.id,
        definition.subjectId,
        definition.skill,
        instruction,
        definition.options.map((option) => ({
          id: option.id,
          label: option.label,
          correct: option.id === definition.answer,
        })),
        difficulty,
      );
    }
    case 'IMAGE_CHOICE': {
      assertAnswerInOptions(definition.answer, definition.options, definition.id);
      return imageChoice(
        definition.id,
        definition.subjectId,
        definition.skill,
        instruction,
        definition.options.map((option) => ({
          id: option.id,
          label: option.label,
          image: option.image,
          correct: option.id === definition.answer,
        })),
        difficulty,
      );
    }
    case 'COUNTING':
      return counting(
        definition.id,
        definition.subjectId,
        definition.skill,
        instruction,
        definition.itemEmoji,
        definition.count,
        difficulty,
      );
    case 'MATCHING':
      return matching(
        definition.id,
        definition.subjectId,
        definition.skill,
        instruction,
        definition.pairs,
        difficulty,
      );
    case 'COLOR_SELECTION':
      return colorSelection(
        definition.id,
        definition.subjectId,
        definition.skill,
        instruction,
        definition.target,
        difficulty,
        definition.swatchLabels,
      );
    case 'SHAPE_SELECTION':
      return shapeSelection(
        definition.id,
        definition.subjectId,
        definition.skill,
        instruction,
        definition.target,
        difficulty,
        definition.shapeLabels,
      );
    case 'TRACING':
      return tracing(
        definition.id,
        definition.subjectId,
        definition.skill,
        instruction,
        definition.patternId,
        definition.displayLabel,
        difficulty,
      );
    default: {
      const unexpected: never = definition;
      throw new Error(`Unsupported activity type: ${(unexpected as ActivityAuthoring).type}`);
    }
  }
}

export function compileActivities(definitions: ActivityAuthoring[]): Activity[] {
  return definitions.map(compileActivity);
}
