import { digitLabel } from './letters';
import type { LearnLanguage } from './types';

type VocabMap = Record<string, string>;

const COLOR_NAMES_HI: VocabMap = {
  red: 'लाल',
  blue: 'नीला',
  yellow: 'पीला',
  green: 'हरा',
  orange: 'नारंगी',
  purple: 'बैंगनी',
  black: 'काला',
  white: 'सफेद',
  brown: 'भूरा',
  pink: 'गुलाबी',
};

const COLOR_NAMES_MR: VocabMap = {
  red: 'लाल',
  blue: 'निळा',
  yellow: 'पिवळा',
  green: 'हिरवा',
  orange: 'नारिंगी',
  purple: 'जांभळा',
  black: 'काळा',
  white: 'पांढरा',
  brown: 'तपकिरी',
  pink: 'गुलाबी',
};

const SHAPE_NAMES_HI: VocabMap = {
  circle: 'गोला',
  square: 'वर्ग',
  triangle: 'त्रिभुज',
  rectangle: 'आयत',
  oval: 'अंडाकार',
};

const SHAPE_NAMES_MR: VocabMap = {
  circle: 'वर्तुळ',
  square: 'चौरस',
  triangle: 'त्रिकोण',
  rectangle: 'आयत',
  oval: 'अंडाकार',
};

/** English display labels used in JSON → localized child-facing text. */
const VOCAB_HI: VocabMap = {
  Apple: 'सेब',
  Ball: 'गेंद',
  Cat: 'बिल्ली',
  Dog: 'कुत्ता',
  Cow: 'गाय',
  Duck: 'बत्तख',
  Fish: 'मछली',
  Elephant: 'हाथी',
  Frog: 'मेंढक',
  Grapes: 'अंगूर',
  House: 'घर',
  Giraffe: 'जिराफ',
  Hat: 'टोपी',
  'Ice cream': 'आइसक्रीम',
  Ice: 'बर्फ',
  Kite: 'पतंग',
  Lion: 'शेर',
  Juice: 'जूस',
  Rabbit: 'खरगोश',
  Bear: 'भालू',
  Hippo: 'दरियाई घोड़ा',
  Mouse: 'चूहा',
  Horse: 'घोड़ा',
  Sheep: 'भेड़',
  Monkey: 'बंदर',
  Bird: 'पक्षी',
  Tiger: 'बाघ',
  Car: 'कार',
  Shoe: 'जूता',
  Book: 'किताब',
  'Teddy bear': 'टेडी बियर',
  Cup: 'कप',
  Tree: 'पेड़',
  Bus: 'बस',
  Chair: 'कुर्सी',
  Sun: 'सूरज',
  Red: 'लाल',
  Yellow: 'पीला',
  Purple: 'बैंगनी',
  Nest: 'घोंसला',
  Water: 'पानी',
  Kick: 'लात',
  Stack: 'ढेर',
  Fit: 'जोड़ना',
  Road: 'सड़क',
  Tracks: 'पटरी',
  Sea: 'समुद्र',
  Mother: 'माँ',
  Father: 'पापा',
  Baby: 'बच्चा',
  Sunny: 'धूप',
  Rainy: 'बारिश',
  Snowy: 'बर्फ',
  Windy: 'हवा',
  Hands: 'हाथ',
  Eyes: 'आँखें',
  Ears: 'कान',
  Mouth: 'मुँह',
  Nose: 'नाक',
  See: 'देखना',
  Hear: 'सुनना',
  Eat: 'खाना',
  Smell: 'सूँघना',
};

const VOCAB_MR: VocabMap = {
  Apple: 'सफरचंद',
  Ball: 'चेंडू',
  Cat: 'मांजर',
  Dog: 'कुत्रा',
  Cow: 'गाय',
  Duck: 'बदक',
  Fish: 'मासा',
  Elephant: 'हत्ती',
  Frog: 'बेडूक',
  Grapes: 'द्राक्ष',
  House: 'घर',
  Giraffe: 'जिराफ',
  Hat: 'टोपी',
  'Ice cream': 'आइसक्रीम',
  Ice: 'बर्फ',
  Kite: 'पतंग',
  Lion: 'सिंह',
  Juice: 'रस',
  Rabbit: 'ससा',
  Bear: 'अस्वल',
  Hippo: 'पाणघोडा',
  Mouse: 'उंदीर',
  Horse: 'घोडा',
  Sheep: 'मेंढी',
  Monkey: 'माकड',
  Bird: 'पक्षी',
  Tiger: 'वाघ',
  Car: 'कार',
  Shoe: 'बूट',
  Book: 'पुस्तक',
  'Teddy bear': 'टेडी बियर',
  Cup: 'कप',
  Tree: 'झाड',
  Bus: 'बस',
  Chair: 'खुर्ची',
  Sun: 'सूर्य',
  Red: 'लाल',
  Yellow: 'पिवळा',
  Purple: 'जांभळा',
  Nest: 'घरटे',
  Water: 'पाणी',
  Kick: 'लाथ',
  Stack: 'ढीग',
  Fit: 'जोडणे',
  Road: 'रस्ता',
  Tracks: 'रुळ',
  Sea: 'समुद्र',
  Mother: 'आई',
  Father: 'वडील',
  Baby: 'बाळ',
  Sunny: 'सूर्यप्रकाश',
  Rainy: 'पाऊस',
  Snowy: 'बर्फ',
  Windy: 'वारा',
  Hands: 'हात',
  Eyes: 'डोळे',
  Ears: 'कान',
  Mouth: 'तोंड',
  Nose: 'नाक',
  See: 'पाहणे',
  Hear: 'ऐकणे',
  Eat: 'खाणे',
  Smell: 'सुगंध',
};

type PictureOption = { id: string; label: string; image: string };

type PictureActivitySet = {
  answer: string;
  options: PictureOption[];
};

/** Devanagari picture-to-letter activities — words that start with the target letter. */
const ALPHABET_PICTURES_HI: Record<string, PictureActivitySet> = {
  'alphabet-picture-a': {
    answer: 'correct',
    options: [
      { id: 'correct', label: 'अनार', image: '🍎' },
      { id: 'wrong-1', label: 'बिल्ली', image: '🐱' },
      { id: 'wrong-0', label: 'कुत्ता', image: '🐶' },
    ],
  },
  'alphabet-picture-b': {
    answer: 'correct',
    options: [
      { id: 'wrong-1', label: 'सेब', image: '🍎' },
      { id: 'wrong-0', label: 'गेंद', image: '⚽' },
      { id: 'correct', label: 'बत्तख', image: '🦆' },
    ],
  },
  'alphabet-picture-c': {
    answer: 'correct',
    options: [
      { id: 'wrong-0', label: 'गाय', image: '🐄' },
      { id: 'wrong-1', label: 'बत्तख', image: '🦆' },
      { id: 'correct', label: 'कमल', image: '🪷' },
    ],
  },
  'alphabet-picture-d': {
    answer: 'correct',
    options: [
      { id: 'wrong-1', label: 'मछली', image: '🐟' },
      { id: 'wrong-0', label: 'हाथी', image: '🐘' },
      { id: 'correct', label: 'दूध', image: '🥛' },
    ],
  },
  'alphabet-picture-e': {
    answer: 'correct',
    options: [
      { id: 'wrong-0', label: 'मेंढक', image: '🐸' },
      { id: 'wrong-1', label: 'अंगूर', image: '🍇' },
      { id: 'correct', label: 'एरोप्लेन', image: '✈️' },
    ],
  },
  'alphabet-picture-f': {
    answer: 'correct',
    options: [
      { id: 'correct', label: 'फूल', image: '🌸' },
      { id: 'wrong-1', label: 'घर', image: '🏠' },
      { id: 'wrong-0', label: 'हाथी', image: '🐘' },
    ],
  },
  'alphabet-picture-g': {
    answer: 'correct',
    options: [
      { id: 'wrong-1', label: 'गेंद', image: '⚽' },
      { id: 'correct', label: 'गाय', image: '🐄' },
      { id: 'wrong-0', label: 'टोपी', image: '🎩' },
    ],
  },
  'alphabet-picture-h': {
    answer: 'correct',
    options: [
      { id: 'wrong-0', label: 'बर्फ', image: '🧊' },
      { id: 'correct', label: 'हाथी', image: '🐘' },
      { id: 'wrong-1', label: 'पतंग', image: '🪁' },
    ],
  },
  'alphabet-picture-i': {
    answer: 'correct',
    options: [
      { id: 'correct', label: 'ईडली', image: '🍚' },
      { id: 'wrong-1', label: 'शेर', image: '🦁' },
      { id: 'wrong-0', label: 'पतंग', image: '🪁' },
    ],
  },
  'alphabet-picture-j': {
    answer: 'correct',
    options: [
      { id: 'wrong-0', label: 'पतंग', image: '🪁' },
      { id: 'wrong-1', label: 'शेर', image: '🦁' },
      { id: 'correct', label: 'जहाज', image: '🚢' },
    ],
  },
};

const ALPHABET_PICTURES_MR: Record<string, PictureActivitySet> = {
  'alphabet-picture-a': {
    answer: 'correct',
    options: [
      { id: 'correct', label: 'अंडी', image: '🥚' },
      { id: 'wrong-1', label: 'मांजर', image: '🐱' },
      { id: 'wrong-0', label: 'कुत्रा', image: '🐶' },
    ],
  },
  'alphabet-picture-b': {
    answer: 'correct',
    options: [
      { id: 'wrong-1', label: 'सफरचंद', image: '🍎' },
      { id: 'wrong-0', label: 'चेंडू', image: '⚽' },
      { id: 'correct', label: 'बदक', image: '🦆' },
    ],
  },
  'alphabet-picture-c': {
    answer: 'correct',
    options: [
      { id: 'wrong-0', label: 'गाय', image: '🐄' },
      { id: 'wrong-1', label: 'बदक', image: '🦆' },
      { id: 'correct', label: 'कमळ', image: '🪷' },
    ],
  },
  'alphabet-picture-d': {
    answer: 'correct',
    options: [
      { id: 'wrong-1', label: 'मासा', image: '🐟' },
      { id: 'wrong-0', label: 'हत्ती', image: '🐘' },
      { id: 'correct', label: 'दूध', image: '🥛' },
    ],
  },
  'alphabet-picture-e': {
    answer: 'correct',
    options: [
      { id: 'wrong-0', label: 'बेडूक', image: '🐸' },
      { id: 'wrong-1', label: 'द्राक्ष', image: '🍇' },
      { id: 'correct', label: 'एरोप्लेन', image: '✈️' },
    ],
  },
  'alphabet-picture-f': {
    answer: 'correct',
    options: [
      { id: 'correct', label: 'फूल', image: '🌸' },
      { id: 'wrong-1', label: 'घर', image: '🏠' },
      { id: 'wrong-0', label: 'हत्ती', image: '🐘' },
    ],
  },
  'alphabet-picture-g': {
    answer: 'correct',
    options: [
      { id: 'wrong-1', label: 'चेंडू', image: '⚽' },
      { id: 'correct', label: 'गाय', image: '🐄' },
      { id: 'wrong-0', label: 'टोपी', image: '🎩' },
    ],
  },
  'alphabet-picture-h': {
    answer: 'correct',
    options: [
      { id: 'wrong-0', label: 'बर्फ', image: '🧊' },
      { id: 'correct', label: 'हत्ती', image: '🐘' },
      { id: 'wrong-1', label: 'पतंग', image: '🪁' },
    ],
  },
  'alphabet-picture-i': {
    answer: 'correct',
    options: [
      { id: 'correct', label: 'ईडली', image: '🍚' },
      { id: 'wrong-1', label: 'सिंह', image: '🦁' },
      { id: 'wrong-0', label: 'पतंग', image: '🪁' },
    ],
  },
  'alphabet-picture-j': {
    answer: 'correct',
    options: [
      { id: 'wrong-0', label: 'पतंग', image: '🪁' },
      { id: 'wrong-1', label: 'सिंह', image: '🦁' },
      { id: 'correct', label: 'जहाज', image: '🚢' },
    ],
  },
};

function vocabMap(language: LearnLanguage): VocabMap {
  if (language === 'hi') return VOCAB_HI;
  if (language === 'mr') return VOCAB_MR;
  return {};
}

export function vocabLabel(text: string, language: LearnLanguage): string {
  if (language === 'en') {
    return text;
  }
  return vocabMap(language)[text] ?? text;
}

export function colorName(colorId: string, language: LearnLanguage): string {
  if (language === 'en') {
    return colorId.charAt(0).toUpperCase() + colorId.slice(1);
  }
  const map = language === 'hi' ? COLOR_NAMES_HI : COLOR_NAMES_MR;
  return map[colorId] ?? colorId;
}

export function shapeName(shapeId: string, language: LearnLanguage): string {
  if (language === 'en') {
    return shapeId.charAt(0).toUpperCase() + shapeId.slice(1);
  }
  const map = language === 'hi' ? SHAPE_NAMES_HI : SHAPE_NAMES_MR;
  return map[shapeId] ?? shapeId;
}

export function indicAlphabetPictureSet(
  activityId: string,
  language: LearnLanguage,
): PictureActivitySet | null {
  if (language === 'hi') {
    return ALPHABET_PICTURES_HI[activityId] ?? null;
  }
  if (language === 'mr') {
    return ALPHABET_PICTURES_MR[activityId] ?? null;
  }
  return null;
}

/** Localize quantity labels like "5 stars" or "3 apples" for compare activities. */
export function localizeQuantityLabel(label: string, language: LearnLanguage): string {
  if (language === 'en') {
    return label;
  }

  const starsMatch = label.match(/^(\d+)\s+stars$/i);
  if (starsMatch) {
    return `${digitLabel(starsMatch[1], language)} तारे`;
  }

  const applesMatch = label.match(/^(\d+)\s+apples$/i);
  if (applesMatch) {
    const noun = language === 'hi' ? 'सेब' : 'सफरचंद';
    return `${digitLabel(applesMatch[1], language)} ${noun}`;
  }

  return vocabLabel(label, language);
}
