import type { ActivityAuthoring } from '../content/types';
import {
  digitLabel,
  letterFromActivityKey,
  letterLabel,
  numberFromWritingKey,
  tracePatternIdForLetter,
  tracePatternIdForNumber,
  usesIndicScript,
} from './letters';
import type { TracePatternId } from '../tracing/types';
import { translateActivity } from './translate';
import type { LearnLanguage } from './types';
import {
  colorName,
  indicAlphabetPictureSet,
  localizeQuantityLabel,
  shapeName,
  vocabLabel,
} from './vocabulary';

function localizeAlphabetInstruction(instructionKey: string, language: LearnLanguage): string {
  if (!usesIndicScript(language)) {
    return translateActivity(language, instructionKey);
  }

  const latin = letterFromActivityKey(instructionKey);
  if (latin) {
    const letter = letterLabel(latin, language);

    if (instructionKey.startsWith('alphabet-letter-')) {
      if (language === 'hi') {
        return `कौन सा अक्षर ${letter} है?`;
      }
      return `${letter} हा कोणता अक्षर आहे?`;
    }

    if (instructionKey.startsWith('alphabet-picture-')) {
      if (language === 'hi') {
        return `किस चित्र की शुरुआत ${letter} से होती है?`;
      }
      return `कोणत्या चित्राची सुरुवात ${letter} ने होते?`;
    }

    if (instructionKey.startsWith('writing-letter-')) {
      if (language === 'hi') {
        return `अक्षर ${letter} बनाएँ।`;
      }
      return `अक्षर ${letter} काढा.`;
    }
  }

  const writingNumber = numberFromWritingKey(instructionKey);
  if (writingNumber) {
    const digit = digitLabel(writingNumber, language);
    if (language === 'hi') {
      return `संख्या ${digit} बनाएँ।`;
    }
    return `संख्या ${digit} काढा.`;
  }

  return translateActivity(language, instructionKey);
}

function localizeMultipleChoice(
  definition: ActivityAuthoring & { type: 'MULTIPLE_CHOICE' },
  language: LearnLanguage,
  instruction: string,
): ActivityAuthoring {
  if (definition.subjectId === 'alphabet' && definition.skill === 'letter-recognition') {
    return {
      ...definition,
      instruction,
      options: definition.options.map((option) => ({
        ...option,
        label: letterLabel(option.id, language),
      })),
    };
  }

  if (definition.subjectId === 'numbers' && definition.skill === 'number-sequence') {
    return {
      ...definition,
      instruction,
      options: definition.options.map((option) => ({
        ...option,
        label: digitLabel(option.label, language),
      })),
    };
  }

  if (definition.subjectId === 'colors' && usesIndicScript(language)) {
    return {
      ...definition,
      instruction,
      options: definition.options.map((option) => ({
        ...option,
        label: colorName(option.id, language),
      })),
    };
  }

  return { ...definition, instruction };
}

function localizeImageChoice(
  definition: ActivityAuthoring & { type: 'IMAGE_CHOICE' },
  language: LearnLanguage,
  instruction: string,
): ActivityAuthoring {
  if (definition.skill === 'picture-to-letter' && usesIndicScript(language)) {
    const indicSet = indicAlphabetPictureSet(definition.id, language);
    if (indicSet) {
      return {
        ...definition,
        instruction,
        answer: indicSet.answer,
        options: indicSet.options,
      };
    }
  }

  if (definition.skill === 'compare-quantity') {
    return {
      ...definition,
      instruction,
      options: definition.options.map((option) => ({
        ...option,
        label: localizeQuantityLabel(option.label, language),
      })),
    };
  }

  if (usesIndicScript(language) && definition.subjectId !== 'numbers') {
    return {
      ...definition,
      instruction,
      options: definition.options.map((option) => ({
        ...option,
        label: vocabLabel(option.label, language),
      })),
    };
  }

  return { ...definition, instruction };
}

function localizeMatching(
  definition: ActivityAuthoring & { type: 'MATCHING' },
  language: LearnLanguage,
  instruction: string,
): ActivityAuthoring {
  if (!usesIndicScript(language)) {
    return { ...definition, instruction };
  }

  return {
    ...definition,
    instruction,
    pairs: definition.pairs.map((pair) => ({
      ...pair,
      right: vocabLabel(pair.right, language),
    })),
  };
}

function localizeColorSelection(
  definition: ActivityAuthoring & { type: 'COLOR_SELECTION' },
  language: LearnLanguage,
  instruction: string,
): ActivityAuthoring {
  if (!usesIndicScript(language)) {
    return { ...definition, instruction };
  }

  const swatchIds = ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'black', 'white', 'brown', 'pink'];
  const swatchLabels = Object.fromEntries(
    swatchIds.map((id) => [id, colorName(id, language)]),
  );

  return { ...definition, instruction, swatchLabels };
}

function localizeShapeSelection(
  definition: ActivityAuthoring & { type: 'SHAPE_SELECTION' },
  language: LearnLanguage,
  instruction: string,
): ActivityAuthoring {
  if (!usesIndicScript(language)) {
    return { ...definition, instruction };
  }

  const shapeIds = ['circle', 'square', 'triangle', 'rectangle', 'oval'];
  const shapeLabels = Object.fromEntries(
    shapeIds.map((id) => [id, shapeName(id, language)]),
  );

  return { ...definition, instruction, shapeLabels };
}

function localizeTracing(
  definition: ActivityAuthoring & { type: 'TRACING' },
  language: LearnLanguage,
  instruction: string,
): ActivityAuthoring {
  let patternId = definition.patternId;
  let displayLabel = definition.displayLabel;

  if (definition.patternId.startsWith('letter-')) {
    const latin = definition.patternId.replace('letter-', '');
    displayLabel = letterLabel(latin, language);
    if (usesIndicScript(language)) {
      patternId = tracePatternIdForLetter(latin, language) as TracePatternId;
    }
  } else if (definition.patternId.startsWith('number-')) {
    const digit = definition.patternId.replace('number-', '');
    displayLabel = digitLabel(digit, language);
    if (usesIndicScript(language)) {
      patternId = tracePatternIdForNumber(digit, language) as TracePatternId;
    }
  }

  return {
    ...definition,
    instruction,
    patternId,
    displayLabel,
  };
}

function localizeDefinition(
  definition: ActivityAuthoring,
  language: LearnLanguage,
): ActivityAuthoring {
  const instruction = localizeAlphabetInstruction(definition.instructionKey, language);

  switch (definition.type) {
    case 'MULTIPLE_CHOICE':
      return localizeMultipleChoice(definition, language, instruction);
    case 'IMAGE_CHOICE':
      return localizeImageChoice(definition, language, instruction);
    case 'COUNTING':
      return { ...definition, instruction };
    case 'MATCHING':
      return localizeMatching(definition, language, instruction);
    case 'COLOR_SELECTION':
      return localizeColorSelection(definition, language, instruction);
    case 'SHAPE_SELECTION':
      return localizeShapeSelection(definition, language, instruction);
    case 'TRACING':
      return localizeTracing(definition, language, instruction);
    default: {
      const unexpected: never = definition;
      return unexpected;
    }
  }
}

export function localizeAuthoring(
  definition: ActivityAuthoring,
  language: LearnLanguage,
): ActivityAuthoring {
  return localizeDefinition(definition, language);
}

export function localizeAuthoringList(
  definitions: ActivityAuthoring[],
  language: LearnLanguage,
): ActivityAuthoring[] {
  return definitions.map((definition) => localizeAuthoring(definition, language));
}
