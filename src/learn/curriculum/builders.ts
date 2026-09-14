import type {
  Activity,
  ColorSelectionContent,
  CountingContent,
  ImageChoiceContent,
  MatchingContent,
  MultipleChoiceContent,
  ShapeKind,
  ShapeSelectionContent,
  SubjectId,
  TracingContent,
} from '../app/types';

type Choice = { id: string; label: string; correct: boolean };

function base(
  id: string,
  subjectId: SubjectId,
  skill: string,
  instruction: string,
  difficulty: number,
) {
  return {
    id,
    subjectId,
    skill,
    ageGroup: 'nursery',
    difficulty,
    instruction,
  };
}

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

export function multipleChoice(
  id: string,
  subjectId: SubjectId,
  skill: string,
  instruction: string,
  choices: Choice[],
  difficulty = 1,
): Activity {
  const content: MultipleChoiceContent = { choices: shuffle(choices) };
  return { ...base(id, subjectId, skill, instruction, difficulty), type: 'MULTIPLE_CHOICE', content };
}

export function imageChoice(
  id: string,
  subjectId: SubjectId,
  skill: string,
  instruction: string,
  choices: Array<Choice & { image: string }>,
  difficulty = 1,
): Activity {
  const content: ImageChoiceContent = { choices: shuffle(choices) };
  return { ...base(id, subjectId, skill, instruction, difficulty), type: 'IMAGE_CHOICE', content };
}

export function counting(
  id: string,
  subjectId: SubjectId,
  skill: string,
  instruction: string,
  itemEmoji: string,
  count: number,
  difficulty = 1,
): Activity {
  const options = new Set<number>([count]);
  let offset = 1;
  while (options.size < 3) {
    options.add(Math.max(1, count + offset));
    if (options.size < 3) {
      options.add(Math.max(1, count - offset));
    }
    offset += 1;
  }

  const content: CountingContent = {
    itemEmoji,
    count,
    choices: shuffle([...options]),
  };
  return { ...base(id, subjectId, skill, instruction, difficulty), type: 'COUNTING', content };
}

const defaultSwatches = [
  { id: 'red', color: '#e74c3c', label: 'Red' },
  { id: 'blue', color: '#3498db', label: 'Blue' },
  { id: 'yellow', color: '#f1c40f', label: 'Yellow' },
  { id: 'green', color: '#2ecc71', label: 'Green' },
  { id: 'orange', color: '#e67e22', label: 'Orange' },
  { id: 'purple', color: '#9b59b6', label: 'Purple' },
  { id: 'black', color: '#2d3748', label: 'Black' },
  { id: 'white', color: '#f8fafc', label: 'White' },
  { id: 'brown', color: '#8b5e3c', label: 'Brown' },
  { id: 'pink', color: '#f472b6', label: 'Pink' },
];

export function colorSelection(
  id: string,
  subjectId: SubjectId,
  skill: string,
  instruction: string,
  targetId: string,
  difficulty = 1,
  swatchLabels?: Record<string, string>,
): Activity {
  const content: ColorSelectionContent = {
    targetId,
    swatches: defaultSwatches
      .filter((swatch) =>
        ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'black', 'white', 'brown', 'pink'].includes(
          swatch.id,
        ),
      )
      .map((swatch) => ({
        ...swatch,
        label: swatchLabels?.[swatch.id] ?? swatch.label,
      })),
  };
  return { ...base(id, subjectId, skill, instruction, difficulty), type: 'COLOR_SELECTION', content };
}

const defaultShapes: Array<{ id: string; kind: ShapeKind; label: string }> = [
  { id: 'circle', kind: 'circle', label: 'Circle' },
  { id: 'square', kind: 'square', label: 'Square' },
  { id: 'triangle', kind: 'triangle', label: 'Triangle' },
  { id: 'rectangle', kind: 'rectangle', label: 'Rectangle' },
  { id: 'oval', kind: 'oval', label: 'Oval' },
];

export function shapeSelection(
  id: string,
  subjectId: SubjectId,
  skill: string,
  instruction: string,
  targetId: string,
  difficulty = 1,
  shapeLabels?: Record<string, string>,
): Activity {
  const content: ShapeSelectionContent = {
    targetId,
    shapes: defaultShapes.map((shape) => ({
      ...shape,
      label: shapeLabels?.[shape.id] ?? shape.label,
    })),
  };
  return { ...base(id, subjectId, skill, instruction, difficulty), type: 'SHAPE_SELECTION', content };
}

export function matching(
  id: string,
  subjectId: SubjectId,
  skill: string,
  instruction: string,
  pairs: MatchingContent['pairs'],
  difficulty = 1,
): Activity {
  const content: MatchingContent = { pairs };
  return { ...base(id, subjectId, skill, instruction, difficulty), type: 'MATCHING', content };
}

export function tracing(
  id: string,
  subjectId: SubjectId,
  skill: string,
  instruction: string,
  patternId: TracingContent['patternId'],
  displayLabel?: string,
  difficulty = 1,
): Activity {
  const content: TracingContent = { patternId, displayLabel };
  return { ...base(id, subjectId, skill, instruction, difficulty), type: 'TRACING', content };
}

export function letterChoices(correct: string, pool: string[]): Choice[] {
  const wrong = shuffle(pool.filter((letter) => letter !== correct)).slice(0, 2);
  return shuffle([
    { id: correct.toLowerCase(), label: correct, correct: true },
    ...wrong.map((letter) => ({ id: letter.toLowerCase(), label: letter, correct: false })),
  ]);
}
