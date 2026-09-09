import {
  keyboardPitch,
  octaveName,
  pitchLabel,
  pitchName,
  type MusicLanguage,
  type SpelledPitch,
} from './notation';
import { count } from './plural';
import { pitchAtStep, type Clef } from './staff';
import {
  valueIdentification,
  beamingReview,
  ornamentReview,
  performanceMarks,
  shortExcerpt,
  accidentalContext,
  tupletContext,
  nt,
  notationSources,
  shuffle,
} from './notation-tasks';

/**
 * Generated notation exercises (roadmap №558).
 *
 * Every item is a pure function of its seed, so a failing item can be
 * reproduced exactly from the three values that made it. Nothing here touches
 * the DOM or the audio engine, which keeps the whole generator testable in the
 * unit project rather than only in a browser.
 *
 * Fourteen reproducible generators cover pitch, rhythm and performance marks.
 * Open reviews use explicit rubrics; short excerpts retain per-note feedback.
 */

export type ExerciseKind =
  | 'octave-region'
  | 'accidental-name'
  | 'enharmonic'
  | 'dotted-value'
  | 'tuplet'
  | 'tie-sum'
  | 'read-pitch'
  | 'clef-transform'
  | 'accidental-scope'
  | 'value-identification'
  | 'beaming-review'
  | 'ornament-review'
  | 'performance-marks'
  | 'short-excerpt';

export type Level = 1 | 2 | 3;

/** Why a distractor is wrong, so a wrong answer can be answered rather than scored. */
export type ErrorTag =
  | 'correct'
  | 'neighbour-register'
  | 'wrong-letter'
  | 'wrong-alteration'
  | 'same-sound-other-spelling'
  | 'forgot-the-dot'
  | 'forgot-second-dot'
  | 'halved-instead-of-dotted'
  | 'counted-the-written-value'
  | 'one-step-too-long'
  | 'added-wrong'
  | 'read-the-other-clef'
  | 'ignored-the-sign'
  | 'carried-the-sign-too-far'
  | 'wrong-written-note'
  | 'duration-symbol'
  | 'tempo-unit'
  | 'dynamic-level'
  | 'articulation-meaning'
  | 'repeat-route';

/**
 * The rules the generator can test, one per item. Listing them makes `Item.rule`
 * a closed set rather than a free string, so a new builder cannot quietly invent
 * a rule that no topic teaches: `ruleTopic` in lib/topics.ts has to name it, and
 * tsc says so at the point the rule is added.
 */
export const RULES = [
  'register-1',
  'register-2',
  'register-3',
  'natural-name',
  'alteration-name',
  'enharmonic-respelling',
  'dot-adds-half',
  'second-dot-adds-half-the-first',
  'tied-values-add',
  'irregular-group-written-value',
  'read-a-notated-pitch',
  'same-place-other-clef',
  'sign-stops-at-the-barline',
  'sign-holds-to-the-barline',
  'identify-written-duration',
  'compare-beaming',
  'recognize-an-ornament',
  'metronome-unit',
  'relative-dynamic-level',
  'articulation-sign',
  'follow-repeat-route',
  'read-a-short-excerpt',
] as const;
export type Rule = (typeof RULES)[number];

export type Option = { id: string; label: string; tag: ErrorTag };

export type StaffSpec = {
  pitches: SpelledPitch[];
  clef: Clef;
  /** Note indices a barline follows, for showing how far a sign reaches. */
  barlines?: number[];
  accidentalVisibility?: boolean[];
};

export type Item = {
  kind: ExerciseKind;
  level: Level;
  seed: number;
  lang: MusicLanguage;
  prompt: string;
  options: Option[];
  /** Option id. Never an array index: an index cannot survive shuffling. */
  answer: string;
  /** The single rule the item tests, for choosing what to ask next. */
  rule: Rule;
  /** Present when the question is a picture rather than a sentence. */
  staff?: StaffSpec;
  figure?: string;
  explanation?: string;
  source?: { title: string; url: string };
  /** Reflection has no answer key and never enters the scored ledger. */
  review?: boolean;
  /** Each excerpt note is answered and explained independently. */
  parts?: {
    prompt: string;
    answer: string;
    options: Option[];
    kind?: 'pitch' | 'rhythm';
    explanation?: string;
  }[];
};

/** Deterministic 32-bit generator, the same one the property tests use. */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(next: () => number, items: readonly T[]): T =>
  items[Math.floor(next() * items.length)];

/**
 * Fisher-Yates from the same stream, so the correct answer does not sit in a
 * predictable slot and the order still reproduces from the seed.
 */
// ---------------------------------------------------------------- durations

/** Durations are exact ratios of a whole note; nothing here is a float. */
export type Duration = { num: number; den: number };

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

export function reduce({ num, den }: Duration): Duration {
  const factor = gcd(Math.abs(num), Math.abs(den)) || 1;
  return { num: num / factor, den: den / factor };
}

export const add = (a: Duration, b: Duration): Duration =>
  reduce({ num: a.num * b.den + b.num * a.den, den: a.den * b.den });

/** A dot adds half; a second dot adds half of the first. */
export function dotted(base: Duration, dots: number): Duration {
  let total = base;
  let added = base;
  for (let i = 0; i < dots; i += 1) {
    added = reduce({ num: added.num, den: added.den * 2 });
    total = add(total, added);
  }
  return total;
}

export const equal = (a: Duration, b: Duration): boolean =>
  a.num * b.den === b.num * a.den;

/** The named values, longest first. `den` is the note's denominator: 4 is a quarter. */
const values = [1, 2, 4, 8, 16] as const;

const valueNames: Record<MusicLanguage, Record<number, string>> = {
  en: {
    1: 'whole note',
    2: 'half note',
    4: 'quarter note',
    8: 'eighth note',
    16: 'sixteenth note',
    32: 'thirty-second note',
  },
  ru: {
    1: 'целая',
    2: 'половинная',
    4: 'четверть',
    8: 'восьмая',
    16: 'шестнадцатая',
    32: 'тридцать вторая',
  },
  de: {
    1: 'ganze Note',
    2: 'halbe Note',
    4: 'Viertelnote',
    8: 'Achtelnote',
    16: 'Sechzehntelnote',
    32: 'Zweiunddreißigstelnote',
  },
};

/** How many of `unit` fit in `total`, or null when the unit does not divide it. */
export function countIn(total: Duration, unit: Duration): number | null {
  const num = total.num * unit.den;
  const den = total.den * unit.num;
  return num % den === 0 ? num / den : null;
}

// ------------------------------------------------------------------- pitches

/**
 * The register range items are drawn from. Wider than the staff a reader can
 * comfortably follow, narrower than what the model will validate: an
 * unconstrained generator emits pitches nobody can read.
 */
const LOW_MIDI = 36;
const HIGH_MIDI = 96;

const alterationSets: Record<Level, readonly number[]> = {
  1: [0],
  2: [-1, 0, 1],
  3: [-2, -1, 0, 1, 2],
};

const diatonicOf = (p: { letter: number; octave: number }): number =>
  p.letter + 7 * p.octave;

function spelled(
  letter: number,
  accidental: number,
  octave: number,
): SpelledPitch {
  const naturals = [0, 2, 4, 5, 7, 9, 11];
  return {
    letter,
    accidental,
    octave,
    midi: (octave + 1) * 12 + naturals[letter] + accidental,
  };
}

// ------------------------------------------------------------------ prompts

const prompts: Record<MusicLanguage, Record<string, string>> = {
  en: {
    'octave-region':
      'Start on {pitch}, then move {distance} {direction}. Which register contains the resulting note?',
    'accidental-name': 'What is this note called?',
    enharmonic:
      'Respell {pitch} using the letter {letter}, keeping the sounding pitch (12-tone equal temperament).',
    'dotted-value': 'How many {unit} does {value} last?',
    tuplet:
      'Starting value: {base}. Equal parts: {count}, written as a {ratio} tuplet. Which basic note value is used inside the group?',
    'tie-sum': 'Two tied notes, {a} and {b}. How long do they sound together?',
    'read-pitch': 'Name the note on the staff.',
    'clef-transform':
      'The same place on the staff, read in the {clef}. Which note is it?',
    'accidental-scope':
      'Which note is the last one? Mind how far the sign in front of the first note reaches.',
  },
  ru: {
    'octave-region':
      'Исходная нота: {pitch}. Перенесите её на {distance} {direction}. В какой октаве окажется нота?',
    'accidental-name': 'Как называется эта нота?',
    enharmonic:
      'Перепишите ноту {pitch} от ступени {letter}, сохранив высоту звучания (12-ступенный равномерный строй).',
    'dotted-value': 'Сколько длительностей «{unit}» звучит {value}?',
    tuplet:
      'Исходная длительность: {base}. Число равных частей: {count}, отношение особого деления — {ratio}. Какой базовой длительностью записываются ноты группы?',
    'tie-sum': 'Две ноты связаны лигой: {a} и {b}. Сколько они звучат вместе?',
    'read-pitch': 'Назовите ноту, записанную на стане.',
    'clef-transform':
      'То же место на стане, прочитанное в ключе: {clef}. Какая это нота?',
    'accidental-scope':
      'Какая нота стоит последней? Учтите, до каких пор действует знак перед первой нотой.',
  },
  de: {
    'octave-region':
      'Ausgangston: {pitch}. Versetzen Sie ihn um {distance} {direction}. In welcher Oktavlage liegt der Zielton?',
    'accidental-name': 'Wie heißt dieser Ton?',
    enharmonic:
      'Schreiben Sie {pitch} mit dem Stammton {letter} enharmonisch um, bei gleicher klingender Tonhöhe (12-stufige gleichstufige Stimmung).',
    'dotted-value': 'Wie viele {unit} dauert {value}?',
    tuplet:
      'Ausgangswert: {base}. Gleiche Teile: {count}, als N-tole im Verhältnis {ratio}. Mit welchem Notenwert werden die Noten der Gruppe notiert?',
    'tie-sum':
      'Zwei Töne sind übergebunden: {a} und {b}. Wie lang klingen sie zusammen?',
    'read-pitch': 'Benennen Sie den notierten Ton.',
    'clef-transform':
      'Dieselbe Stelle im System, im {clef} gelesen. Welcher Ton ist das?',
    'accidental-scope':
      'Wie heißt der letzte Ton? Achten Sie darauf, wie weit das Zeichen vor dem ersten Ton reicht.',
  },
};

const fill = (template: string, vars: Record<string, string>): string =>
  template.replace(
    /\{(\w+)\}/g,
    (_all, key: string) => vars[key] ?? `{${key}}`,
  );

// ---------------------------------------------------------------- generators

function octaveRegion(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Omit<Item, 'kind' | 'level' | 'seed' | 'lang'> {
  const midi = LOW_MIDI + Math.floor(next() * (HIGH_MIDI - LOW_MIDI));
  const pitch = keyboardPitch(midi);
  const correct = octaveName(pitch, lang);
  // The learner has to move between registers; naming the target register in
  // the stem would give the answer away in Russian. Keep every source in range.
  const movements = [-level, level].filter(
    (delta) => pitch.octave - delta >= 0 && pitch.octave - delta <= 8,
  );
  const delta = pick(next, movements);
  const source = {
    ...pitch,
    octave: pitch.octave - delta,
    midi: midi - delta * 12,
  };
  const directions = {
    en: ['down', 'up'],
    ru: ['ниже', 'выше'],
    de: ['nach unten', 'nach oben'],
  };
  const options: Option[] = [{ id: 'a', label: correct, tag: 'correct' }];
  // The neighbours are the mistake worth diagnosing: an octave out, not random.
  for (const [i, delta] of [-1, 1, 2].entries()) {
    const octave = pitch.octave + delta;
    if (octave < 0 || octave > 8) continue;
    const label = octaveName({ ...pitch, octave }, lang);
    if (options.some((o) => o.label === label)) continue;
    options.push({ id: 'bcd'[i], label, tag: 'neighbour-register' });
  }
  return {
    prompt: fill(prompts[lang]['octave-region'], {
      pitch: pitchLabel(source, lang),
      distance: count(Math.abs(delta), lang, 'octaves'),
      direction: directions[lang][delta > 0 ? 1 : 0],
    }),
    options: shuffle(next, options),
    answer: 'a',
    rule: `register-${level}`,
  };
}

function accidentalName(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Omit<Item, 'kind' | 'level' | 'seed' | 'lang'> {
  const letter = Math.floor(next() * 7);
  const alterations = alterationSets[level];
  const accidental = pick(
    next,
    alterations.filter((a) => a !== 0).length ? alterations : [0],
  );
  const octave = 3 + Math.floor(next() * 3);
  const pitch = spelled(letter, accidental, octave);
  const correct = pitchName(pitch, lang);
  const options: Option[] = [{ id: 'a', label: correct, tag: 'correct' }];
  const others: Option[] = [];
  // Same letter, different sign: the reader saw the note but not the accidental.
  for (const other of [-2, -1, 0, 1, 2]) {
    if (other === accidental) continue;
    others.push({
      id: '',
      label: pitchName(spelled(letter, other, octave), lang),
      tag: 'wrong-alteration',
    });
  }
  // A neighbouring letter with the same sign: the note was misread on the staff.
  others.push({
    id: '',
    label: pitchName(spelled((letter + 1) % 7, accidental, octave), lang),
    tag: 'wrong-letter',
  });
  for (const option of shuffle(next, others)) {
    if (options.length >= 4) break;
    if (options.some((o) => o.label === option.label)) continue;
    options.push({ ...option, id: 'bcd'[options.length - 1] });
  }
  return {
    prompt: `${prompts[lang]['accidental-name']} — ${describeSpelling(pitch, lang)}`,
    options: shuffle(next, options),
    answer: 'a',
    rule: accidental === 0 ? 'natural-name' : 'alteration-name',
  };
}

/** The stem of a naming item, in the reader's own vocabulary. */
function describeSpelling(pitch: SpelledPitch, lang: MusicLanguage): string {
  const natural = pitchName({ ...pitch, accidental: 0 }, lang);
  const move: Record<MusicLanguage, Record<number, string>> = {
    en: {
      [-2]: `${natural} lowered by a whole tone`,
      [-1]: `${natural} lowered by a semitone`,
      0: `${natural}, unaltered`,
      1: `${natural} raised by a semitone`,
      2: `${natural} raised by a whole tone`,
    },
    ru: {
      [-2]: `${natural}, пониженная на тон`,
      [-1]: `${natural}, пониженная на полутон`,
      0: `${natural} без знака`,
      1: `${natural}, повышенная на полутон`,
      2: `${natural}, повышенная на тон`,
    },
    de: {
      [-2]: `${natural} um einen Ganzton erniedrigt`,
      [-1]: `${natural} um einen Halbton erniedrigt`,
      0: `${natural} ohne Vorzeichen`,
      1: `${natural} um einen Halbton erhöht`,
      2: `${natural} um einen Ganzton erhöht`,
    },
  };
  return move[lang][pitch.accidental];
}

function enharmonic(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Omit<Item, 'kind' | 'level' | 'seed' | 'lang'> | null {
  const letter = Math.floor(next() * 7);
  const accidental = pick(next, level === 1 ? [-1, 1] : [-2, -1, 1, 2]);
  const octave = 4;
  const pitch = spelled(letter, accidental, octave);
  // Only a letter within two diatonic steps can carry the same sound inside
  // the double-accidental limit; anything further would need a triple sign.
  const step = pick(next, [-2, -1, 1, 2]);
  const target = (letter + step + 7) % 7;
  const naturals = [0, 2, 4, 5, 7, 9, 11];
  const targetOctave =
    octave + (letter + step >= 7 ? 1 : letter + step < 0 ? -1 : 0);
  const targetAccidental =
    pitch.midi - ((targetOctave + 1) * 12 + naturals[target]);
  if (Math.abs(targetAccidental) > 2) return null;
  const correctPitch = spelled(target, targetAccidental, targetOctave);
  const correct = pitchLabel(correctPitch, lang);
  const options: Option[] = [{ id: 'a', label: correct, tag: 'correct' }];
  const others: Option[] = [];
  for (const delta of [-1, 1]) {
    const alt = targetAccidental + delta;
    if (Math.abs(alt) > 2) continue;
    others.push({
      id: '',
      label: pitchLabel(spelled(target, alt, targetOctave), lang),
      tag: 'wrong-alteration',
    });
  }
  others.push({
    id: '',
    label: pitchLabel(pitch, lang),
    tag: 'same-sound-other-spelling',
  });
  for (const option of others) {
    if (options.length >= 4) break;
    if (options.some((o) => o.label === option.label)) continue;
    options.push({ ...option, id: 'bcd'[options.length - 1] });
  }
  if (options.length < 3) return null;
  return {
    prompt: fill(prompts[lang].enharmonic, {
      pitch: pitchLabel(pitch, lang),
      letter: pitchName(spelled(target, 0, targetOctave), lang),
    }),
    options: shuffle(next, options),
    answer: 'a',
    rule: 'enharmonic-respelling',
  };
}

function dottedValue(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Omit<Item, 'kind' | 'level' | 'seed' | 'lang'> {
  const den = pick(next, values.slice(0, 4));
  const dots = level === 1 ? 1 : pick(next, [1, 1, 2]);
  const rest = next() < 0.5;
  const base: Duration = { num: 1, den };
  const total = dotted(base, dots);
  // Ask in a unit that divides the answer exactly: a dotted quarter is three
  // eighths and also six sixteenths, so the unit has to be named.
  const unit: Duration = { num: 1, den: den * 2 ** dots };
  const count = countIn(total, unit);
  if (count === null) throw new Error('unit must divide the dotted value');
  const dotWord: Record<MusicLanguage, string> = {
    en: dots === 1 ? 'a dotted ' : 'a double dotted ',
    ru: dots === 1 ? 'нота с точкой: ' : 'нота с двумя точками: ',
    de: dots === 1 ? 'eine punktierte ' : 'eine doppelt punktierte ',
  };
  const options: Option[] = [
    { id: 'a', label: String(count), tag: 'correct' },
    {
      id: 'b',
      label: String(count - 1),
      tag: dots === 2 ? 'forgot-second-dot' : 'forgot-the-dot',
    },
    { id: 'c', label: String(count + 1), tag: 'added-wrong' },
    { id: 'd', label: String(2 ** dots), tag: 'forgot-the-dot' },
  ];
  const unique = options.filter(
    (o, i) => options.findIndex((x) => x.label === o.label) === i,
  );
  if (level > 1 && next() < 0.35) {
    const remaining = pick(next, [
      { num: 1, den: 8 },
      { num: 3, den: 8 },
      { num: 1, den: 2 },
    ]);
    const fits = total.num * remaining.den <= remaining.num * total.den;
    const labels = nt(
      'Fits|Overflows',
      'Помещается|Не помещается',
      'Passt|Überschreitet',
    )[lang].split('|');
    return {
      rule: dots === 1 ? 'dot-adds-half' : 'second-dot-adds-half-the-first',
      prompt: nt(
        `The bar has ${remaining.num}/${remaining.den} of a whole note remaining. Does a ${dots === 2 ? 'double-' : ''}dotted ${rest ? 'rest' : 'note'} of base value 1/${den} fit without crossing the barline?`,
        `В такте осталось ${remaining.num}/${remaining.den} целой ноты. Поместится ли ${rest ? 'пауза' : 'нота'} с ${dots === 2 ? 'двумя точками' : 'точкой'} и основной длительностью 1/${den}, не пересекая тактовую черту?`,
        `Im Takt bleiben ${remaining.num}/${remaining.den} einer ganzen Note. Passt eine ${dots === 2 ? 'doppelt ' : ''}punktierte ${rest ? 'Pause' : 'Note'} mit Grundwert 1/${den}, ohne den Taktstrich zu überschreiten?`,
      )[lang],
      answer: 'a',
      options: shuffle(next, [
        { id: 'a', label: labels[fits ? 0 : 1], tag: 'correct' },
        { id: 'b', label: labels[fits ? 1 : 0], tag: 'added-wrong' },
      ]),
      explanation: nt(
        `${total.num}/${total.den} ${fits ? '≤' : '>'} ${remaining.num}/${remaining.den}. This is only a bar-remainder calculation, not a verdict on the best beat grouping or engraving.`,
        `${total.num}/${total.den} ${fits ? '≤' : '>'} ${remaining.num}/${remaining.den}. Это только расчёт остатка такта, а не оценка лучшей группировки долей или гравировки.`,
        `${total.num}/${total.den} ${fits ? '≤' : '>'} ${remaining.num}/${remaining.den}. Dies prüft nur den Taktrest, nicht die beste Zählzeitgliederung oder den Notensatz.`,
      )[lang],
      source: notationSources.ties,
    };
  }
  return {
    prompt: fill(prompts[lang]['dotted-value'], {
      unit: valueNames[lang][unit.den],
      value: rest
        ? nt(
            `a ${dots === 2 ? 'double-' : ''}dotted rest of base value 1/${den}`,
            `пауза с ${dots === 2 ? 'двумя точками' : 'точкой'}: 1/${den}`,
            `eine ${dots === 2 ? 'doppelt ' : ''}punktierte Pause des Grundwerts 1/${den}`,
          )[lang]
        : dotWord[lang] + valueNames[lang][den],
    }),
    options: shuffle(next, unique),
    answer: 'a',
    rule: dots === 1 ? 'dot-adds-half' : 'second-dot-adds-half-the-first',
    explanation: nt(
      `Dots work identically on notes and rests: ${total.num}/${total.den} of a whole note = ${count} × 1/${unit.den}.`,
      `Точки одинаково изменяют ноты и паузы: ${total.num}/${total.den} целой ноты = ${count} × 1/${unit.den}.`,
      `Punkte wirken bei Noten und Pausen gleich: ${total.num}/${total.den} einer ganzen Note = ${count} × 1/${unit.den}.`,
    )[lang],
    source: notationSources.rhythm,
  };
}

function tuplet(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Omit<Item, 'kind' | 'level' | 'seed' | 'lang'> {
  if (level > 1 && next() < 0.5) return tupletContext(next, level, lang);
  const [count, regular] =
    level === 1
      ? [3, 2]
      : pick(next, [
          [3, 2],
          [5, 4],
          [6, 4],
          [7, 4],
          [7, 8],
          [9, 8],
          [10, 8],
          [11, 8],
          [12, 8],
        ]);
  // The explicitly supplied ratio determines the value, not the group name.
  // Both neighbours of the answer have to be nameable, or the distractors
  // collapse onto it and the item stops being a question. That bounds the base.
  const den = pick(
    next,
    ([2, 4, 8] as const).filter((d) => d * regular * 2 <= 32),
  );
  const written = den * regular;
  const options: Option[] = [
    { id: 'a', label: valueNames[lang][written], tag: 'correct' },
    {
      id: 'b',
      label: valueNames[lang][written / 2],
      // One step longer than the group uses. The opposite mistake from c, so
      // it cannot share c's explanation.
      tag: 'one-step-too-long',
    },
    {
      id: 'c',
      label: valueNames[lang][written * 2],
      tag: 'counted-the-written-value',
    },
  ];
  const unique = options.filter(
    (o, i) => options.findIndex((x) => x.label === o.label) === i,
  );
  return {
    prompt: fill(prompts[lang].tuplet, {
      base: valueNames[lang][den],
      count: String(count),
      ratio: `${count}:${regular}`,
    }),
    options: shuffle(next, unique),
    answer: 'a',
    rule: 'irregular-group-written-value',
    explanation: nt(
      `Under the stated ${count}:${regular} ratio, the group occupies ${regular} written values. Other ratios are possible; the group number alone does not select a universal denominator.`,
      `При указанном отношении ${count}:${regular} группа занимает ${regular} записанных длительностей. Возможны другие отношения; одно число группы не определяет универсальный знаменатель.`,
      `Beim angegebenen Verhältnis ${count}:${regular} umfasst die Gruppe ${regular} notierte Werte. Andere Verhältnisse sind möglich; die Gruppenzahl allein bestimmt keinen universellen Nenner.`,
    )[lang],
    source: notationSources.tuplets,
  };
}

function tieSum(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Omit<Item, 'kind' | 'level' | 'seed' | 'lang'> {
  if (level > 1 && next() < 0.5) {
    const target = pick(next, ['total', 'first', 'second']);
    const answer = target === 'total' ? '1/2' : '1/4';
    return {
      rule: 'tied-values-add',
      figure: 'cross-bar-tie',
      answer,
      options: shuffle(
        next,
        ['1/4', '1/2', '3/4'].map((label) => ({
          id: label,
          label,
          tag: label === answer ? 'correct' : 'added-wrong',
        })),
      ),
      prompt: nt(
        `In this 3/4 example, give ${target === 'total' ? 'the total duration of the tied sound' : target === 'first' ? 'the portion of the tied sound in bar 1' : 'the portion of the tied sound in bar 2'} as a fraction of a whole note.`,
        `В примере 3/4 укажите ${target === 'total' ? 'полную длительность связанного звука' : target === 'first' ? 'часть связанного звука в такте 1' : 'часть связанного звука в такте 2'} как долю целой ноты.`,
        `Gib in diesem 3/4-Beispiel ${target === 'total' ? 'die Gesamtdauer des gebundenen Tons' : target === 'first' ? 'den Anteil des gebundenen Tons in Takt 1' : 'den Anteil des gebundenen Tons in Takt 2'} als Anteil einer ganzen Note an.`,
      )[lang],
      explanation: nt(
        'Bar 1: half rest + quarter = 3/4. Bar 2: tied quarter + half rest = 3/4. The sound lasts 1/4 + 1/4 = 1/2, with one attack; the tie allocates it across the barline without adding a beat.',
        'Такт 1: половинная пауза + четверть = 3/4. Такт 2: связанная четверть + половинная пауза = 3/4. Звук длится 1/4 + 1/4 = 1/2 с одной атакой; лига распределяет его между тактами, не добавляя долю.',
        'Takt 1: halbe Pause + Viertel = 3/4. Takt 2: gebundene Viertel + halbe Pause = 3/4. Der Ton dauert 1/4 + 1/4 = 1/2 mit einem Anschlag; der Haltebogen verteilt ihn über den Taktstrich, ohne eine Zählzeit hinzuzufügen.',
      )[lang],
      source: notationSources.ties,
    };
  }
  const first = pick(next, values.slice(1, level === 1 ? 3 : 4));
  const second = pick(next, values.slice(1, level === 1 ? 3 : 4));
  const total = add({ num: 1, den: first }, { num: 1, den: second });
  const unit: Duration = { num: 1, den: Math.max(first, second) };
  const count = countIn(total, unit);
  if (count === null)
    throw new Error('tie sum must be countable in the smaller unit');
  const options: Option[] = [
    { id: 'a', label: String(count), tag: 'correct' },
    { id: 'b', label: String(count - 1), tag: 'added-wrong' },
    { id: 'c', label: String(count + 1), tag: 'added-wrong' },
  ];
  const unique = options.filter(
    (o, i) => options.findIndex((x) => x.label === o.label) === i,
  );
  return {
    prompt: fill(prompts[lang]['tie-sum'], {
      a: valueNames[lang][first],
      b: valueNames[lang][second],
    }).concat(` (${valueNames[lang][unit.den]})`),
    options: shuffle(next, unique),
    answer: 'a',
    rule: 'tied-values-add',
  };
}

const clefNames: Record<MusicLanguage, Record<Clef, string>> = {
  en: {
    treble: 'treble clef',
    bass: 'bass clef',
    alto: 'alto clef',
    tenor: 'tenor clef',
  },
  ru: {
    treble: 'скрипичный',
    bass: 'басовый',
    alto: 'альтовый',
    tenor: 'теноровый',
  },
  de: {
    treble: 'Violinschlüssel',
    bass: 'Bassschlüssel',
    alto: 'Altschlüssel',
    tenor: 'Tenorschlüssel',
  },
};

const readingClefs: Clef[] = ['treble', 'bass', 'alto', 'tenor'];

/** Staff steps that stay comfortable to read: inside the staff, or one ledger. */
const READ_LOW = -3;
const READ_HIGH = 11;

/** A pitch that lands in the readable band of the given clef. */
function readablePitch(
  next: () => number,
  clef: Clef,
  alterations: readonly number[],
): SpelledPitch {
  const step = READ_LOW + Math.floor(next() * (READ_HIGH - READ_LOW + 1));
  return pitchAtStep(step, clef, pick(next, alterations));
}

function readPitch(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Omit<Item, 'kind' | 'level' | 'seed' | 'lang'> {
  const clef = level === 1 ? 'treble' : pick(next, readingClefs);
  const pitch = readablePitch(next, clef, alterationSets[level]);
  const correct = pitchName(pitch, lang);
  const options: Option[] = [{ id: 'a', label: correct, tag: 'correct' }];
  const others: Option[] = [
    {
      id: '',
      label: pitchName(
        spelled((pitch.letter + 1) % 7, pitch.accidental, pitch.octave),
        lang,
      ),
      tag: 'wrong-letter',
    },
    {
      id: '',
      label: pitchName(
        spelled((pitch.letter + 6) % 7, pitch.accidental, pitch.octave),
        lang,
      ),
      tag: 'wrong-letter',
    },
  ];
  if (pitch.accidental !== 0)
    others.push({
      id: '',
      label: pitchName({ ...pitch, accidental: 0 }, lang),
      tag: 'ignored-the-sign',
    });
  // Reading the same place in the wrong clef is the mistake worth naming.
  const otherClef = readingClefs.find((c) => c !== clef) as Clef;
  const shift = { treble: 30, bass: 18, alto: 24, tenor: 22 };
  const misread = shift[otherClef] - shift[clef];
  others.push({
    id: '',
    label: pitchName(
      spelled(
        (((pitch.letter + misread) % 7) + 7) % 7,
        pitch.accidental,
        pitch.octave + Math.floor((pitch.letter + misread) / 7),
      ),
      lang,
    ),
    tag: 'read-the-other-clef',
  });
  for (const option of shuffle(next, others)) {
    if (options.length >= 4) break;
    if (options.some((o) => o.label === option.label)) continue;
    options.push({ ...option, id: 'bcd'[options.length - 1] });
  }
  return {
    prompt: prompts[lang]['read-pitch'],
    options: shuffle(next, options),
    answer: 'a',
    rule: 'read-a-notated-pitch',
    staff: { pitches: [pitch], clef },
  };
}

function clefTransform(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Omit<Item, 'kind' | 'level' | 'seed' | 'lang'> {
  const from = pick(next, readingClefs);
  const to = pick(
    next,
    readingClefs.filter((c) => c !== from),
  );
  const pitch = readablePitch(
    next,
    from,
    alterationSets[Math.min(level, 2) as Level],
  );
  const bottom = { treble: 30, bass: 18, alto: 24, tenor: 22 };
  const step = diatonicOf(pitch) - bottom[from];
  const moved = bottom[to] + step;
  const target = spelled(
    ((moved % 7) + 7) % 7,
    pitch.accidental,
    Math.floor(moved / 7),
  );
  const correct = pitchName(target, lang);
  const options: Option[] = [{ id: 'a', label: correct, tag: 'correct' }];
  const others: Option[] = [
    { id: '', label: pitchName(pitch, lang), tag: 'read-the-other-clef' },
    {
      id: '',
      label: pitchName(
        spelled((target.letter + 1) % 7, target.accidental, target.octave),
        lang,
      ),
      tag: 'wrong-letter',
    },
    {
      id: '',
      label: pitchName(
        spelled((target.letter + 6) % 7, target.accidental, target.octave),
        lang,
      ),
      tag: 'wrong-letter',
    },
  ];
  for (const option of shuffle(next, others)) {
    if (options.length >= 4) break;
    if (options.some((o) => o.label === option.label)) continue;
    options.push({ ...option, id: 'bcd'[options.length - 1] });
  }
  return {
    prompt: fill(prompts[lang]['clef-transform'], {
      clef: clefNames[lang][to],
    }),
    options: shuffle(next, options),
    answer: 'a',
    rule: 'same-place-other-clef',
    staff: { pitches: [pitch], clef: from },
  };
}

function accidentalScope(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Omit<Item, 'kind' | 'level' | 'seed' | 'lang'> {
  if (level > 1 && next() < 0.75) return accidentalContext(next, level, lang);
  const clef = level === 1 ? 'treble' : pick(next, readingClefs);
  const sign = pick(next, level === 1 ? [1, -1] : [1, -1, 2, -2]);
  const base = readablePitch(next, clef, [0]);
  const altered = spelled(base.letter, sign, base.octave);
  // A neighbour so the bar is a bar rather than one note repeated.
  const other = spelled((base.letter + 1) % 7, 0, base.octave);
  // Beyond the barline the sign is spent; inside it, it still holds.
  const beyond = next() < 0.5;
  const pitches = [altered, other, beyond ? base : altered];
  const answerPitch = beyond ? base : altered;
  const correct = pitchName(answerPitch, lang);
  const options: Option[] = [
    { id: 'a', label: correct, tag: 'correct' },
    {
      id: 'b',
      label: pitchName(beyond ? altered : base, lang),
      tag: beyond ? 'carried-the-sign-too-far' : 'ignored-the-sign',
    },
  ];
  return {
    prompt: fill(prompts[lang]['accidental-scope'], {}),
    options: shuffle(next, options),
    answer: 'a',
    rule: beyond ? 'sign-stops-at-the-barline' : 'sign-holds-to-the-barline',
    staff: {
      pitches,
      clef,
      barlines: beyond ? [1] : [2],
      accidentalVisibility: [true, false, false],
    },
  };
}

const builders = {
  'octave-region': octaveRegion,
  'accidental-name': accidentalName,
  enharmonic,
  'dotted-value': dottedValue,
  tuplet,
  'tie-sum': tieSum,
  'read-pitch': readPitch,
  'clef-transform': clefTransform,
  'accidental-scope': accidentalScope,
  'value-identification': valueIdentification,
  'beaming-review': beamingReview,
  'ornament-review': ornamentReview,
  'performance-marks': performanceMarks,
  'short-excerpt': shortExcerpt,
} as const;

export const exerciseKinds = Object.keys(builders) as ExerciseKind[];

/**
 * Build one item. Returns null when the seed lands on a case the kind must
 * refuse — an enharmonic spelling that would need a triple accidental, for
 * instance. Callers advance the seed and ask again rather than repairing the
 * item, because a repaired item drifts out of its difficulty level.
 */
export function generate(
  kind: ExerciseKind,
  level: Level,
  seed: number,
  lang: MusicLanguage,
): Item | null {
  const next = random(seed);
  const built = builders[kind](next, level, lang);
  if (!built) return null;
  return { kind, level, seed, lang, ...built };
}

/** The first item at or after `seed` that the kind is willing to emit. */
export function generateFrom(
  kind: ExerciseKind,
  level: Level,
  seed: number,
  lang: MusicLanguage,
  attempts = 32,
): Item {
  for (let i = 0; i < attempts; i += 1) {
    const item = generate(kind, level, seed + i, lang);
    if (item) return item;
  }
  throw new Error(`No ${kind} item could be built from seed ${seed}`);
}

export type Verdict = { correct: boolean; tag: ErrorTag };

export function grade(item: Item, chosen: string): Verdict {
  if (item.review) throw new RangeError('Reflection has no scored answer');
  const option = item.options.find((o) => o.id === chosen);
  if (!option) throw new RangeError(`Unknown option ${chosen}`);
  return { correct: option.id === item.answer, tag: option.tag };
}
