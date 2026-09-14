import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const contentRoot = join(root, 'src', 'learn', 'content', 'nursery');
const localeRoot = join(root, 'src', 'learn', 'i18n', 'locales');

const uiEn = {
  'home.greeting': 'Hi, {name}!',
  'home.subtitle': 'Each round has up to {count} short activities.',
  'home.activities': '{count} activities',
  'home.parentMode': 'Parent mode (PIN required)',
  'feedback.great': 'Great job!',
  'feedback.almost': 'Almost!',
  'feedback.tryAgain': "Let's try again.",
  'feedback.points': '+{points}',
  'result.title': 'Amazing!',
  'result.completed': 'You completed {subject}!',
  'result.score': 'You got {correct} of {total}!',
  'result.perfect': 'Perfect round — you are a superstar!',
  'result.greatEffort': 'Great effort. Every round helps you learn.',
  'result.pointsRound': '+{points} points this round',
  'result.playAgain': 'Play again',
  'result.home': 'Back home',
  'result.focus': 'Focus: {focus}',
  'result.newBadgeLabel': 'New badge unlocked',
  'result.badge': '{badge}',
  'parent.language': 'Language',
  'settings.sound': 'Read instructions aloud',
  'settings.slowSpeech': 'Slow speech',
  'settings.highContrast': 'High contrast',
};

const subjectsEn = {
  alphabet: 'Alphabet',
  numbers: 'Numbers',
  colors: 'Colors',
  shapes: 'Shapes',
  animals: 'Animals',
  games: 'Games',
  writing: 'Writing',
};

const audioEn = {
  success: 'Great job!',
  tryAgain: "Almost! Let's try again.",
  completion: 'Amazing! You completed {subject}. You got {correct} of {total}.',
};

const uiHi = {
  'home.greeting': 'नमस्ते, {name}!',
  'home.subtitle': 'हर राउंड में {count} छोटी गतिविधियाँ हैं।',
  'home.activities': '{count} गतिविधियाँ',
  'home.parentMode': 'अभिभावक मोड (पिन आवश्यक)',
  'feedback.great': 'बहुत बढ़िया!',
  'feedback.almost': 'लगभग सही!',
  'feedback.tryAgain': 'चलो फिर कोशिश करें।',
  'feedback.points': '+{points}',
  'result.title': 'शाबाश!',
  'result.completed': 'आपने {subject} पूरा किया!',
  'result.score': 'आपने {correct} में से {total} सही किए!',
  'result.perfect': 'परफेक्ट राउंड — आप सुपरस्टार हैं!',
  'result.greatEffort': 'बहुत अच्छा प्रयास। हर राउंड सीखने में मदद करता है।',
  'result.pointsRound': 'इस राउंड में +{points} अंक',
  'result.playAgain': 'फिर खेलें',
  'result.home': 'होम पर वापस',
  'result.focus': 'फोकस: {focus}',
  'result.newBadgeLabel': 'नया बैज मिला',
  'result.badge': '{badge}',
  'parent.language': 'भाषा',
  'settings.sound': 'निर्देश ज़ोर से पढ़ें',
  'settings.slowSpeech': 'धीमी आवाज़',
  'settings.highContrast': 'हाई कॉन्ट्रास्ट',
};

const subjectsHi = {
  alphabet: 'वर्णमाला',
  numbers: 'संख्याएँ',
  colors: 'रंग',
  shapes: 'आकार',
  animals: 'जानवर',
  games: 'खेल',
  writing: 'लिखना',
};

const audioHi = {
  success: 'बहुत बढ़िया!',
  tryAgain: 'लगभग सही! चलो फिर कोशिश करें।',
  completion: 'शाबाश! आपने {subject} पूरा किया। आपने {correct} में से {total} सही किए।',
};

const uiMr = {
  'home.greeting': 'नमस्कार, {name}!',
  'home.subtitle': 'प्रत्येक फेरीत {count} लहान क्रियाकलाप आहेत.',
  'home.activities': '{count} क्रियाकलाप',
  'home.parentMode': 'पालक मोड (पिन आवश्यक)',
  'feedback.great': 'छान केलं!',
  'feedback.almost': 'जवळजवळ!',
  'feedback.tryAgain': 'चला पुन्हा प्रयत्न करूया.',
  'feedback.points': '+{points}',
  'result.title': 'अप्रतिम!',
  'result.completed': 'तुम्ही {subject} पूर्ण केले!',
  'result.score': 'तुम्हाला {correct} पैकी {total} बरोबर!',
  'result.perfect': 'परिपूर्ण फेरी — तुम सुपरस्टार आहात!',
  'result.greatEffort': 'छान प्रयत्न. प्रत्येक फेरी शिकण्यास मदत करते.',
  'result.pointsRound': 'या फेरीत +{points} गुण',
  'result.playAgain': 'पुन्हा खेळा',
  'result.home': 'होमवर परत',
  'result.focus': 'फोकस: {focus}',
  'result.newBadgeLabel': 'नवीन बॅज मिळाला',
  'result.badge': '{badge}',
  'parent.language': 'भाषा',
  'settings.sound': 'सूचना मोठ्याने वाचा',
  'settings.slowSpeech': 'हळू बोलणे',
  'settings.highContrast': 'हाय कॉन्ट्रास्ट',
};

const subjectsMr = {
  alphabet: 'वर्णमाला',
  numbers: 'संख्या',
  colors: 'रंग',
  shapes: 'आकार',
  animals: 'प्राणी',
  games: 'खेळ',
  writing: 'लेखन',
};

const audioMr = {
  success: 'छान केलं!',
  tryAgain: 'जवळजवळ! चला पुन्हा प्रयत्न करूया.',
  completion: 'अप्रतिम! तुम्ही {subject} पूर्ण केले. तुम्हाला {correct} पैकी {total} बरोबर.',
};

const animalHi = {
  dog: 'कुत्ता',
  cat: 'बिल्ली',
  cow: 'गाय',
  horse: 'घोड़ा',
  lion: 'शेर',
  tiger: 'बाघ',
  elephant: 'हाथी',
  monkey: 'बंदर',
  bird: 'पक्षी',
  fish: 'मछली',
  rabbit: 'खरगोश',
};

const animalMr = {
  dog: 'कुत्रा',
  cat: 'मांजर',
  cow: 'गाय',
  horse: 'घोडा',
  lion: 'सिंह',
  tiger: 'वाघ',
  elephant: 'हत्ती',
  monkey: 'माकड',
  bird: 'पक्षी',
  fish: 'मासा',
  rabbit: 'ससा',
};

function findActivityFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) {
      files.push(...findActivityFiles(fullPath));
    } else if (entry === 'activities.json') {
      files.push(fullPath);
    }
  }
  return files;
}

function translateHi(id, text) {
  const letterMatch = text.match(/^Which letter is ([A-Z])\?$/);
  if (letterMatch) return `कौन सा अक्षर ${letterMatch[1]} है?`;

  const pictureMatch = text.match(/^Which picture starts with ([A-Z])\?$/);
  if (pictureMatch) return `किस चित्र की शुरुआत ${pictureMatch[1]} से होती है?`;

  const animalMatch = text.match(/^Which one is the ([a-z]+)\?$/);
  if (animalMatch) {
    const name = animalHi[animalMatch[1]] ?? animalMatch[1];
    return `${name} कौन सा है?`;
  }

  const soundMatch = text.match(/^Which animal says (.+)\?$/);
  if (soundMatch) return `कौन सा जानवर ${soundMatch[1]} कहता है?`;

  const countMatch = text.match(/^How many (.+) do you see\?$/);
  if (countMatch) return `आप कितने ${countMatch[1]} देखते हैं?`;

  const colorMatch = text.match(/^Tap the ([a-z]+) color\.$/);
  if (colorMatch) return `${colorMatch[1]} रंग पर टैप करें।`;

  const map = {
    'Match each fruit to its color.': 'प्रत्येक फल को उसके रंग से मिलाएँ।',
    'Match each animal to its home.': 'प्रत्येक जानवर को उसके घर से मिलाएँ।',
    'Match each toy to how we play.': 'प्रत्येक खिलौने को खेलने के तरीके से मिलाएँ।',
    'Match each vehicle to where it goes.': 'प्रत्येक वाहन को उसकी जगह से मिलाएँ।',
    'Match each body part to what it does.': 'प्रत्येक शरीर के अंग को उसके काम से मिलाएँ।',
    'Match each person to their role.': 'प्रत्येक व्यक्ति को उसकी भूमिका से मिलाएँ।',
    'Which one is a fruit?': 'फल कौन सा है?',
    'Which one is a toy?': 'खिलौना कौन सा है?',
    'Which one is a vehicle?': 'वाहन कौन सा है?',
    'Which one do we sit on?': 'हम किस पर बैठते हैं?',
    'Which shape looks like a wheel?': 'कौन सा आकार पहिए जैसा दिखता है?',
    'Which shape has four equal sides?': 'किस आकार की चार बराबर भुजाएँ हैं?',
    'Which shape has three corners?': 'किस आकार के तीन कोने हैं?',
    'Which shape looks like a door?': 'कौन सा आकार दरवाजे जैसा दिखता है?',
    'Which shape looks like an egg?': 'कौन सा आकार अंडे जैसा दिखता है?',
    'Trace the straight line from left to right.': 'बाएँ से दाएँ सीधी रेखा बनाएँ।',
    'Trace the straight line from top to bottom.': 'ऊपर से नीचे सीधी रेखा बनाएँ।',
    'Trace the curved line.': 'घुमावदार रेखा बनाएँ।',
    'Trace the zig-zag line.': 'ज़िग-ज़ैग रेखा बनाएँ।',
    'Trace the circle.': 'गोला बनाएँ।',
    'Trace the triangle.': 'त्रिभुज बनाएँ।',
    'Trace the letter A.': 'अक्षर A बनाएँ।',
    'Trace the letter B.': 'अक्षर B बनाएँ।',
    'Trace the number 1.': 'संख्या 1 बनाएँ।',
    'Trace the number 2.': 'संख्या 2 बनाएँ।',
  };

  return map[text] ?? text;
}

function translateMr(id, text) {
  const letterMatch = text.match(/^Which letter is ([A-Z])\?$/);
  if (letterMatch) return `${letterMatch[1]} हा कोणता अक्षर आहे?`;

  const pictureMatch = text.match(/^Which picture starts with ([A-Z])\?$/);
  if (pictureMatch) return `कोणत्या चित्राची सुरुवात ${pictureMatch[1]} ने होते?`;

  const animalMatch = text.match(/^Which one is the ([a-z]+)\?$/);
  if (animalMatch) {
    const name = animalMr[animalMatch[1]] ?? animalMatch[1];
    return `${name} कोणता आहे?`;
  }

  const soundMatch = text.match(/^Which animal says (.+)\?$/);
  if (soundMatch) return `कोणता प्राणी ${soundMatch[1]} म्हणतो?`;

  const countMatch = text.match(/^How many (.+) do you see\?$/);
  if (countMatch) return `तुम्हाला किती ${countMatch[1]} दिसतात?`;

  const colorMatch = text.match(/^Tap the ([a-z]+) color\.$/);
  if (colorMatch) return `${colorMatch[1]} रंगावर टॅप करा.`;

  const map = {
    'Match each fruit to its color.': 'प्रत्येक फळ त्याच्या रंगाशी जुळवा.',
    'Match each animal to its home.': 'प्रत्येक प्राणी त्याच्या घराशी जुळवा.',
    'Match each toy to how we play.': 'प्रत्येक खेळणे खेळण्याच्या पद्धतीशी जुळवा.',
    'Match each vehicle to where it goes.': 'प्रत्येक वाहन त्याच्या ठिकाणाशी जुळवा.',
    'Match each body part to what it does.': 'प्रत्येक अवयव त्याच्या कामाशी जुळवा.',
    'Match each person to their role.': 'प्रत्येक व्यक्ती त्याच्या भूमिकेशी जुळवा.',
    'Which one is a fruit?': 'फळ कोणते आहे?',
    'Which one is a toy?': 'खेळणे कोणते आहे?',
    'Which one is a vehicle?': 'वाहन कोणते आहे?',
    'Which one do we sit on?': 'आपण कशावर बसतो?',
    'Which shape looks like a wheel?': 'कोणता आकार चाकासारखा दिसतो?',
    'Which shape has four equal sides?': 'कोणत्या आकाराच्या चार समान बाजू आहेत?',
    'Which shape has three corners?': 'कोणत्या आकाराचे तीन कोपरे आहेत?',
    'Which shape looks like a door?': 'कोणता आकार दारासारखा दिसतो?',
    'Which shape looks like an egg?': 'कोणता आकार अंड्यासारखा दिसतो?',
    'Trace the straight line from left to right.': 'डावीकडून उजवीकडे सरळ रेष काढा.',
    'Trace the straight line from top to bottom.': 'वरून खाली सरळ रेष काढा.',
    'Trace the curved line.': 'वक्र रेष काढा.',
    'Trace the zig-zag line.': 'झिग-झॅग रेष काढा.',
    'Trace the circle.': 'वर्तुळ काढा.',
    'Trace the triangle.': 'त्रिकोण काढा.',
    'Trace the letter A.': 'अक्षर A काढा.',
    'Trace the letter B.': 'अक्षर B काढा.',
    'Trace the number 1.': 'संख्या 1 काढा.',
    'Trace the number 2.': 'संख्या 2 काढा.',
  };

  return map[text] ?? text;
}

const tracingInstructions = {
  'writing-line-horizontal': 'Trace the straight line from left to right.',
  'writing-line-vertical': 'Trace the straight line from top to bottom.',
  'writing-curve': 'Trace the curved line.',
  'writing-zigzag': 'Trace the zig-zag line.',
  'writing-circle': 'Trace the circle.',
  'writing-triangle': 'Trace the triangle.',
  'writing-letter-a': 'Trace the letter A.',
  'writing-letter-b': 'Trace the letter B.',
  'writing-number-1': 'Trace the number 1.',
  'writing-number-2': 'Trace the number 2.',
};

const gameInstructions = {
  'games-fruit-colors': 'Match each fruit to its color.',
  'games-animal-homes': 'Match each animal to its home.',
  'games-toy-actions': 'Match each toy to how we play.',
  'games-vehicle-go': 'Match each vehicle to where it goes.',
  'games-body-use': 'Match each body part to what it does.',
  'games-family-roles': 'Match each person to their role.',
  'games-food-apple': 'Which one is a fruit?',
  'games-toy-bear': 'Which one is a toy?',
  'games-vehicle-bus': 'Which one is a vehicle?',
  'games-object-chair': 'Which one do we sit on?',
};

const countLabels = {
  1: 'apples', 2: 'stars', 3: 'dogs', 4: 'flowers', 5: 'cars',
  6: 'balloons', 7: 'fish', 8: 'bananas', 9: 'butterflies', 10: 'teddy bears',
};

const animalSounds = {
  dog: 'woof', cat: 'meow', cow: 'moo', horse: 'neigh', lion: 'roar', tiger: 'roar',
  elephant: 'trumpet', monkey: 'ooh', bird: 'tweet', fish: 'blub', rabbit: 'hop',
};

function inferEnglish(activity) {
  const { id } = activity;
  if (tracingInstructions[id]) return tracingInstructions[id];
  if (gameInstructions[id]) return gameInstructions[id];

  const letterMatch = id.match(/^alphabet-letter-([a-z])$/);
  if (letterMatch) return `Which letter is ${letterMatch[1].toUpperCase()}?`;

  const pictureMatch = id.match(/^alphabet-picture-([a-z])$/);
  if (pictureMatch) return `Which picture starts with ${pictureMatch[1].toUpperCase()}?`;

  const animalPick = id.match(/^animals-pick-([a-z]+)$/);
  if (animalPick) return `Which one is the ${animalPick[1]}?`;

  const animalSound = id.match(/^animals-sound-([a-z]+)$/);
  if (animalSound) return `Which animal says ${animalSounds[animalSound[1]] ?? 'that'}?`;

  const numberMatch = id.match(/^numbers-count-(\d+)$/);
  if (numberMatch) {
    const count = Number(numberMatch[1]);
    return `How many ${countLabels[count] ?? 'items'} do you see?`;
  }

  const colorMatch = id.match(/^colors-find-([a-z]+)$/);
  if (colorMatch) return `Tap the ${colorMatch[1]} color.`;

  const shapePrompts = {
    circle: 'Which shape looks like a wheel?',
    square: 'Which shape has four equal sides?',
    triangle: 'Which shape has three corners?',
    rectangle: 'Which shape looks like a door?',
    oval: 'Which shape looks like an egg?',
  };
  const shapeMatch = id.match(/^shapes-find-([a-z]+)$/);
  if (shapeMatch) return shapePrompts[shapeMatch[1]];

  throw new Error(`Cannot infer English instruction for ${id}`);
}

const activitiesEn = {};
const activitiesHi = {};
const activitiesMr = {};

for (const filePath of findActivityFiles(contentRoot)) {
  const pack = JSON.parse(readFileSync(filePath, 'utf8'));
  pack.activities = pack.activities.map((activity) => {
    const instructionKey = activity.instructionKey ?? activity.id;
    const instruction = activity.instruction ?? inferEnglish(activity);
    activitiesEn[instructionKey] = instruction;
    activitiesHi[instructionKey] = translateHi(instructionKey, instruction);
    activitiesMr[instructionKey] = translateMr(instructionKey, instruction);
    const { instruction: _removed, ...rest } = activity;
    return { ...rest, instructionKey };
  });
  writeFileSync(filePath, `${JSON.stringify(pack, null, 2)}\n`, 'utf8');
  console.log(`Updated ${filePath}`);
}

function writeLocale(name, ui, subjects, audio, activities) {
  mkdirSync(localeRoot, { recursive: true });
  const catalog = { activities, ui, subjects, audio };
  writeFileSync(join(localeRoot, `${name}.json`), `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${name}.json (${Object.keys(activities).length} activities)`);
}

writeLocale('en', uiEn, subjectsEn, audioEn, activitiesEn);
writeLocale('hi', uiHi, subjectsHi, audioHi, activitiesHi);
writeLocale('mr', uiMr, subjectsMr, audioMr, activitiesMr);
