import {
  pitchName,
  spellPattern,
  type MusicLanguage,
  type SpelledPitch,
} from './notation';

// Western tonal/lead-sheet teaching model. Sources and limits: docs/chords-lab.md.
export type KeyMode = 'major' | 'minor';
export const keyTonics = {
  major: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
  minor: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'],
};
const scaleSteps = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
};
const naturalSteps = [0, 2, 4, 5, 7, 9, 11];
const quality = (
  en: string,
  ru: string,
  symbol: string,
  steps: number[],
  degrees: number[],
  formula: string,
) => ({ en, ru, symbol, steps, degrees, formula });
export const chordQualities = {
  major: quality(
    'Major triad',
    'Мажорное трезвучие',
    '',
    [0, 4, 7],
    [0, 2, 4],
    '1 · 3 · 5',
  ),
  minor: quality(
    'Minor triad',
    'Минорное трезвучие',
    'm',
    [0, 3, 7],
    [0, 2, 4],
    '1 · ♭3 · 5',
  ),
  diminished: quality(
    'Diminished triad',
    'Уменьшённое трезвучие',
    'dim',
    [0, 3, 6],
    [0, 2, 4],
    '1 · ♭3 · ♭5',
  ),
  augmented: quality(
    'Augmented triad',
    'Увеличенное трезвучие',
    '+',
    [0, 4, 8],
    [0, 2, 4],
    '1 · 3 · ♯5',
  ),
  sus2: quality(
    'Suspended second',
    'Аккорд с секундой вместо терции',
    'sus2',
    [0, 2, 7],
    [0, 1, 4],
    '1 · 2 · 5',
  ),
  sus4: quality(
    'Suspended fourth',
    'Аккорд с квартой вместо терции',
    'sus4',
    [0, 5, 7],
    [0, 3, 4],
    '1 · 4 · 5',
  ),
  seventh: quality(
    'Dominant seventh type',
    'Малый мажорный септаккорд',
    '7',
    [0, 4, 7, 10],
    [0, 2, 4, 6],
    '1 · 3 · 5 · ♭7',
  ),
  maj7: quality(
    'Major seventh',
    'Большой мажорный септаккорд',
    'maj7',
    [0, 4, 7, 11],
    [0, 2, 4, 6],
    '1 · 3 · 5 · 7',
  ),
  min7: quality(
    'Minor seventh',
    'Малый минорный септаккорд',
    'm7',
    [0, 3, 7, 10],
    [0, 2, 4, 6],
    '1 · ♭3 · 5 · ♭7',
  ),
  halfDim7: quality(
    'Half-diminished seventh',
    'Полууменьшённый септаккорд',
    'm7♭5',
    [0, 3, 6, 10],
    [0, 2, 4, 6],
    '1 · ♭3 · ♭5 · ♭7',
  ),
  dim7: quality(
    'Diminished seventh',
    'Уменьшённый септаккорд',
    'dim7',
    [0, 3, 6, 9],
    [0, 2, 4, 6],
    '1 · ♭3 · ♭5 · 𝄫7',
  ),
  minMaj7: quality(
    'Minor major seventh',
    'Большой минорный септаккорд',
    'm(maj7)',
    [0, 3, 7, 11],
    [0, 2, 4, 6],
    '1 · ♭3 · 5 · 7',
  ),
  add9: quality(
    'Major add ninth',
    'Мажорное трезвучие с ноной',
    'add9',
    [0, 4, 7, 14],
    [0, 2, 4, 8],
    '1 · 3 · 5 · 9',
  ),
  ninth: quality(
    'Dominant ninth type',
    'Малый мажорный нонаккорд',
    '9',
    [0, 4, 7, 10, 14],
    [0, 2, 4, 6, 8],
    '1 · 3 · 5 · ♭7 · 9',
  ),
  maj9: quality(
    'Major ninth',
    'Большой мажорный нонаккорд',
    'maj9',
    [0, 4, 7, 11, 14],
    [0, 2, 4, 6, 8],
    '1 · 3 · 5 · 7 · 9',
  ),
  min9: quality(
    'Minor ninth',
    'Малый минорный нонаккорд',
    'm9',
    [0, 3, 7, 10, 14],
    [0, 2, 4, 6, 8],
    '1 · ♭3 · 5 · ♭7 · 9',
  ),
};
export type ChordQuality = keyof typeof chordQualities;
export type ChordStep = {
  degree: number;
  quality: ChordQuality;
  inversion: number;
  beats: number;
};
export type ChordKey = { tonic: number; mode: KeyMode };
export const MAX_CHORDS = 16;

export function validateKey(key: ChordKey) {
  if (
    !Number.isInteger(key.tonic) ||
    key.tonic < 0 ||
    key.tonic > 11 ||
    !Object.hasOwn(scaleSteps, key.mode)
  )
    throw new RangeError('Invalid chord key');
}
export function validateChord(chord: ChordStep) {
  if (
    !Object.hasOwn(chordQualities, chord.quality) ||
    !Number.isInteger(chord.degree) ||
    chord.degree < 0 ||
    chord.degree > 6 ||
    !Number.isInteger(chord.beats) ||
    chord.beats < 1 ||
    chord.beats > 8
  )
    throw new RangeError('Invalid chord');
  if (
    !Number.isInteger(chord.inversion) ||
    chord.inversion < 0 ||
    chord.inversion >= chordQualities[chord.quality].steps.length
  )
    throw new RangeError('Invalid bass position');
}
export function keyPitch(key: ChordKey) {
  validateKey(key);
  return spellPattern(
    keyTonics[key.mode][key.tonic],
    { steps: [0], degrees: [0] },
    3,
  )[0];
}
export function keyName(key: ChordKey, lang: MusicLanguage) {
  return `${pitchName(keyPitch(key), lang)} ${lang === 'ru' ? (key.mode === 'major' ? 'мажор' : 'минор') : key.mode}`;
}
export function chordNotes(key: ChordKey, chord: ChordStep): SpelledPitch[] {
  validateKey(key);
  validateChord(chord);
  const root = spellPattern(
    keyTonics[key.mode][key.tonic],
    { steps: [scaleSteps[key.mode][chord.degree]], degrees: [chord.degree] },
    3,
  )[0];
  const definition = chordQualities[chord.quality];
  const notes = definition.steps.map((step, i) => {
    const position = root.letter + definition.degrees[i];
    const letter = position % 7;
    const octave = root.octave + Math.floor(position / 7);
    const midi = root.midi + step;
    return {
      letter,
      octave,
      midi,
      accidental: midi - ((octave + 1) * 12 + naturalSteps[letter]),
    };
  });
  // Rotate into ascending order, including compound intervals such as ninths.
  const voiced = [
    ...notes.slice(chord.inversion),
    ...notes.slice(0, chord.inversion),
  ];
  return voiced.map((note, i) => {
    const copy = { ...note };
    if (i > 0) {
      while (copy.midi <= voiced[i - 1].midi) {
        copy.midi += 12;
        copy.octave++;
      }
    }
    voiced[i] = copy;
    return copy;
  });
}
export function chordSymbol(key: ChordKey, chord: ChordStep) {
  const root = chordNotes(key, { ...chord, inversion: 0 })[0];
  const bass = chordNotes(key, chord)[0];
  return (
    pitchName(root, 'en') +
    chordQualities[chord.quality].symbol +
    (chord.inversion ? '/' + pitchName(bass, 'en') : '')
  );
}
export function romanNumeral(key: ChordKey, chord: ChordStep) {
  validateKey(key);
  validateChord(chord);
  let numeral = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][chord.degree];
  const minor = [
    'minor',
    'min7',
    'min9',
    'minMaj7',
    'diminished',
    'halfDim7',
    'dim7',
  ].includes(chord.quality);
  if (minor) numeral = numeral.toLowerCase();
  const prefix =
    key.mode === 'minor' && [2, 5, 6].includes(chord.degree) ? '♭' : '';
  const suffix = {
    minor: '',
    diminished: '°',
    halfDim7: 'ø7',
    dim7: '°7',
    min7: '7',
    min9: '9',
    minMaj7: '(maj7)',
  };
  return (
    prefix +
    numeral +
    (minor
      ? suffix[chord.quality as keyof typeof suffix]
      : chordQualities[chord.quality].symbol)
  );
}
export function paletteChord(
  mode: KeyMode,
  degree: number,
  sevenths = false,
): ChordStep {
  if (
    !Object.hasOwn(scaleSteps, mode) ||
    !Number.isInteger(degree) ||
    degree < 0 ||
    degree > 6
  )
    throw new RangeError('Invalid palette degree');
  const triads: Record<KeyMode, ChordQuality[]> = {
    major: ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'],
    minor: ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'],
  };
  const tetrads: Record<KeyMode, ChordQuality[]> = {
    major: ['maj7', 'min7', 'min7', 'maj7', 'seventh', 'min7', 'halfDim7'],
    minor: ['min7', 'halfDim7', 'maj7', 'min7', 'min7', 'maj7', 'seventh'],
  };
  return {
    degree,
    quality: (sevenths ? tetrads : triads)[mode][degree],
    inversion: 0,
    beats: 4,
  };
}
export function commonToneNames(
  key: ChordKey,
  a: ChordStep,
  b: ChordStep,
  lang: MusicLanguage,
) {
  const next = chordNotes(key, b);
  return chordNotes(key, a)
    .filter((p) => next.some((n) => n.midi % 12 === p.midi % 12))
    .map((p) => pitchName(p, lang));
}
export type Texture = 'held' | 'pulse' | 'arpeggio';
const step = (degree: number, quality: ChordQuality, beats = 4): ChordStep => ({
  degree,
  quality,
  beats,
  inversion: 0,
});
export const progressionPresets = [
  {
    id: 'classical',
    en: 'Classical · a return home',
    ru: 'Классика · возвращение к тонике',
    mode: 'major' as KeyMode,
    tempo: 84,
    texture: 'held' as Texture,
    steps: [
      step(0, 'major'),
      step(3, 'major'),
      step(4, 'seventh'),
      step(0, 'major'),
    ],
    note: {
      en: 'I–IV–V7–I sketches tonic, preparation, dominant, and return. Try changing the final I to vi and compare the ending. A cadence also depends on rhythm and melody.',
      ru: 'I–IV–V7–I: тоника, подготовка, доминанта и возвращение. Замените последний I на vi и сравните окончания. Каденция зависит также от ритма и мелодии.',
    },
  },
  {
    id: 'minor',
    en: 'Minor · the leading tone',
    ru: 'Минор · вводный тон',
    mode: 'minor' as KeyMode,
    tempo: 80,
    texture: 'arpeggio' as Texture,
    steps: [
      step(0, 'minor'),
      step(3, 'minor'),
      step(4, 'seventh'),
      step(0, 'minor'),
    ],
    note: {
      en: 'The major third of V7 raises scale degree 7 in minor. Compare V7 with v7: which ending feels more directed to you?',
      ru: 'Большая терция V7 — повышенная VII ступень минора. Сравните V7 и v7: какое окончание кажется вам более направленным к тонике?',
    },
  },
  {
    id: 'blues',
    en: 'Blues · twelve bars',
    ru: 'Блюз · двенадцать тактов',
    mode: 'major' as KeyMode,
    tempo: 104,
    texture: 'pulse' as Texture,
    steps: [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 0].map((degree) =>
      step(degree, 'seventh'),
    ),
    note: {
      en: 'This twelve-bar variant uses I7, IV7, and V7. “7” names the chord type; I7 can be home in blues. These straight pulses demonstrate the changes, not blues phrasing or blue-note intonation.',
      ru: 'В этом варианте 12-тактовой формы звучат I7, IV7 и V7. «7» обозначает строение; I7 в блюзе может быть тоникой. Ровная пульсация показывает смену аккордов, но не блюзовую фразировку и интонацию blue notes.',
    },
  },
  {
    id: 'jazz',
    en: 'Jazz · ii–V–I',
    ru: 'Джаз · ii–V–I',
    mode: 'major' as KeyMode,
    tempo: 96,
    texture: 'held' as Texture,
    steps: [step(1, 'min7'), step(4, 'seventh'), step(0, 'maj7', 8)],
    note: {
      en: 'ii7–V7–Imaj7 follows descending fifths in the roots. Listen for the thirds and sevenths. Try ninths or inversions; this is a chord sketch, not a complete jazz arrangement.',
      ru: 'Корни ii7–V7–Imaj7 движутся по нисходящим квинтам. Вслушайтесь в терции и септимы. Попробуйте ноны или обращения; это гармонический эскиз, а не полная джазовая аранжировка.',
    },
  },
  {
    id: 'pop',
    en: 'Pop · four-chord loop',
    ru: 'Поп · четыре аккорда',
    mode: 'major' as KeyMode,
    tempo: 112,
    texture: 'arpeggio' as Texture,
    steps: [
      step(0, 'major'),
      step(4, 'major'),
      step(5, 'minor'),
      step(3, 'major'),
    ],
    note: {
      en: 'I–V–vi–IV is a recurring pop pattern. Move the first chord to the end and listen again: the same chords can suggest a different centre through order and emphasis.',
      ru: 'I–V–vi–IV — распространённый поп-оборот. Переставьте первый аккорд в конец: те же аккорды могут создавать ощущение другого центра благодаря порядку и акцентам.',
    },
  },
];

export type NoteEvent = {
  midi: number;
  at: number;
  duration: number;
  level: number;
};
export type ProgressionPlan = {
  events: NoteEvent[];
  starts: number[];
  duration: number;
};
export function planProgression(
  key: ChordKey,
  chords: ChordStep[],
  tempo: number,
  texture: Texture,
  repeats: number,
): ProgressionPlan {
  validateKey(key);
  if (
    !Number.isFinite(tempo) ||
    tempo < 40 ||
    tempo > 200 ||
    !Number.isInteger(repeats) ||
    repeats < 1 ||
    repeats > 4 ||
    !['held', 'pulse', 'arpeggio'].includes(texture) ||
    chords.length < 1 ||
    chords.length > MAX_CHORDS
  )
    throw new RangeError('Invalid progression settings');
  const secondsPerBeat = 60 / tempo;
  const events: NoteEvent[] = [],
    starts: number[] = [];
  let beat = 0;
  for (let repeat = 0; repeat < repeats; repeat++) {
    for (const chord of chords) {
      const notes = chordNotes(key, chord);
      starts.push(beat * secondsPerBeat);
      const count =
        texture === 'held'
          ? 1
          : texture === 'pulse'
            ? chord.beats
            : chord.beats * 2;
      const length = (chord.beats / count) * secondsPerBeat;
      for (let i = 0; i < count; i++) {
        const voices =
          texture === 'arpeggio' ? [notes[i % notes.length]] : notes;
        for (const note of voices)
          events.push({
            midi: note.midi,
            at: beat * secondsPerBeat + i * length,
            duration: length * 0.9,
            level: 1 / notes.length,
          });
      }
      beat += chord.beats;
    }
  }
  // A finite phrase, at most 3 min; repetitions are also bounded in the UI.
  const duration = beat * secondsPerBeat;
  if (duration > 180) throw new RangeError('Progression exceeds 180 seconds');
  return { events, starts, duration };
}
