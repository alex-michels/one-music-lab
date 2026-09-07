import {
  keyboardPitch,
  octaveName,
  pitchLabel,
  pitchName,
  type MusicLanguage,
  type SpelledPitch,
} from './notation';
import { count } from './plural';

/**
 * Generated notation exercises (roadmap №558).
 *
 * Every item is a pure function of its seed, so a failing item can be
 * reproduced exactly from the three values that made it. Nothing here touches
 * the DOM or the audio engine, which keeps the whole generator testable in the
 * unit project rather than only in a browser.
 *
 * The kinds implemented here are the ones that can be asked without engraving a
 * staff: registers, alteration names, respelling, and the arithmetic of
 * durations. Anything that needs a note head on a line waits for the engine in
 * №553.
 */

export type ExerciseKind =
  | 'octave-region'
  | 'accidental-name'
  | 'enharmonic'
  | 'dotted-value'
  | 'tuplet'
  | 'tie-sum';

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
  | 'added-wrong';

export type Option = { id: string; label: string; tag: ErrorTag };

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
  rule: string;
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
function shuffle<T>(next: () => number, items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

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
  return {
    prompt: fill(prompts[lang]['dotted-value'], {
      unit: valueNames[lang][unit.den],
      value: dotWord[lang] + valueNames[lang][den],
    }),
    options: shuffle(next, unique),
    answer: 'a',
    rule: dots === 1 ? 'dot-adds-half' : 'second-dot-adds-half-the-first',
  };
}

function tuplet(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Omit<Item, 'kind' | 'level' | 'seed' | 'lang'> {
  const count = level === 1 ? 3 : pick(next, [3, 5, 6, 7]);
  // The written value is the next larger regular division: a group of five in
  // the time of a quarter is written in sixteenths, not in a fifth of anything.
  const regular = 2 ** Math.floor(Math.log2(count));
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
  };
}

function tieSum(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Omit<Item, 'kind' | 'level' | 'seed' | 'lang'> {
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

const builders = {
  'octave-region': octaveRegion,
  'accidental-name': accidentalName,
  enharmonic,
  'dotted-value': dottedValue,
  tuplet,
  'tie-sum': tieSum,
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
  const option = item.options.find((o) => o.id === chosen);
  if (!option) throw new RangeError(`Unknown option ${chosen}`);
  return { correct: option.id === item.answer, tag: option.tag };
}
