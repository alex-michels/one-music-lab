import { german } from './german';
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
  en: import('./german').GermanKey,
  ru: string,
  symbol: string,
  steps: number[],
  degrees: number[],
  formula: string,
) => ({ en, ru, de: german[en], symbol, steps, degrees, formula });
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
/**
 * One card in the progression. `octave` is that chord's own register — the
 * written octave the key's tonic is spelled in while this chord is built, not
 * the root's own written octave, which can be one higher when the root letter
 * wraps past B. Keeping it the tonic's register is what holds degree spelling
 * steady across the whole progression; the editor shows the reader the octave
 * the chord actually sounds in instead. Absent means the default register.
 */
export type ChordStep = {
  degree: number;
  quality: ChordQuality;
  inversion: number;
  beats: number;
  octave?: number;
};
export type ChordKey = { tonic: number; mode: KeyMode };
export const MAX_CHORDS = 16;
/** The register the player accepts, which is the compass of a piano. */
export const MIN_MIDI = 24;
export const MAX_MIDI = 108;
/** The registers the lab offers a chord, as the written octave of the tonic. */
export const OCTAVES = { min: 1, max: 6, preferred: 3 };
const registerOf = (chord: ChordStep) => chord.octave ?? OCTAVES.preferred;

export function validateKey(key: ChordKey) {
  if (
    !Number.isInteger(key.tonic) ||
    key.tonic < 0 ||
    key.tonic > 11 ||
    !Object.hasOwn(scaleSteps, key.mode)
  )
    throw new RangeError('Invalid chord key');
  // Migration guard, not a permanent rule. The register used to live here, and
  // the test suites are plain JavaScript, so a stale caller would otherwise be
  // ignored and play at the default register with nothing to notice it.
  if ('octave' in key) throw new RangeError('Register belongs to the chord');
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
  if (
    chord.octave !== undefined &&
    (!Number.isInteger(chord.octave) ||
      chord.octave < OCTAVES.min ||
      chord.octave > OCTAVES.max)
  )
    throw new RangeError('Invalid chord register');
}
export function keyPitch(key: ChordKey) {
  validateKey(key);
  // Only the pitch class of this is ever shown, so the register is a constant.
  return spellPattern(
    keyTonics[key.mode][key.tonic],
    { steps: [0], degrees: [0] },
    OCTAVES.preferred,
  )[0];
}
export function keyName(key: ChordKey, lang: MusicLanguage) {
  if (lang === 'de') {
    const name = pitchName(keyPitch(key), lang);
    return key.mode === 'major' ? `${name}-Dur` : `${name.toLowerCase()}-Moll`;
  }
  return `${pitchName(keyPitch(key), lang)} ${lang === 'ru' ? (key.mode === 'major' ? 'мажор' : 'минор') : key.mode}`;
}
export function chordNotes(key: ChordKey, chord: ChordStep): SpelledPitch[] {
  validateKey(key);
  validateChord(chord);
  const root = spellPattern(
    keyTonics[key.mode][key.tonic],
    { steps: [scaleSteps[key.mode][chord.degree]], degrees: [chord.degree] },
    registerOf(chord),
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
/**
 * The registers THIS chord could move to and still be playable. It depends on
 * the chord, not only on the key: a ninth in its highest bass position spans
 * nearly two octaves and reaches close to the top of the keyboard, so it can
 * be lowered much further than it can be raised. The lab disables the ends of
 * the octave control instead of failing when Play is pressed.
 *
 * The answer does not depend on where the chord currently sits — moving a
 * chord an octave moves its whole range with it — so the same chord returns
 * the same window from every register it is asked at.
 */
export function octaveRange(key: ChordKey, chord: ChordStep) {
  const notes = chordNotes(key, chord);
  const low = Math.min(...notes.map((note) => note.midi));
  const high = Math.max(...notes.map((note) => note.midi));
  const here = registerOf(chord);
  return {
    min: Math.max(OCTAVES.min, here - Math.floor((low - MIN_MIDI) / 12)),
    max: Math.min(OCTAVES.max, here + Math.floor((MAX_MIDI - high) / 12)),
  };
}

/**
 * A chord's register can be made illegal by an edit that has nothing to do
 * with the register: transposing the key, switching to a wider chord type, or
 * moving the bass up an inversion all change how much room the chord needs.
 * Every such edit goes through here, so that a stored octave is pulled back
 * into range at the moment it stops fitting rather than throwing later, when
 * the reader presses Play and the error looks like a broken browser.
 */
export function clampChord(key: ChordKey, chord: ChordStep): ChordStep {
  const at = registerOf(chord);
  const room = octaveRange(key, chord);
  const octave = Math.min(room.max, Math.max(room.min, at));
  // Compared against the effective register, not the stored one, so a chord
  // that never named an octave is returned untouched rather than acquiring a
  // redundant field every time an unrelated edit passes through here.
  return octave === at ? chord : { ...chord, octave };
}
export function chordSymbol(
  key: ChordKey,
  chord: ChordStep,
  lang: MusicLanguage = 'en',
) {
  const root = chordNotes(key, { ...chord, inversion: 0 })[0];
  const bass = chordNotes(key, chord)[0];
  return (
    pitchName(root, lang === 'de' ? 'de' : 'en') +
    chordQualities[chord.quality].symbol +
    (chord.inversion ? '/' + pitchName(bass, lang === 'de' ? 'de' : 'en') : '')
  );
}
/** The bare degree numeral: case from the chord's third, flats from the mode. */
function degreeNumeral(key: ChordKey, chord: ChordStep) {
  const numeral = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][chord.degree];
  const minor = [
    'minor',
    'min7',
    'min9',
    'minMaj7',
    'diminished',
    'halfDim7',
    'dim7',
  ].includes(chord.quality);
  const prefix =
    key.mode === 'minor' && [2, 5, 6].includes(chord.degree) ? '♭' : '';
  return { minor, text: prefix + (minor ? numeral.toLowerCase() : numeral) };
}
export function romanNumeral(key: ChordKey, chord: ChordStep) {
  validateKey(key);
  validateChord(chord);
  const { minor, text } = degreeNumeral(key, chord);
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
    text +
    (minor
      ? suffix[chord.quality as keyof typeof suffix]
      : chordQualities[chord.quality].symbol)
  );
}

/** The triad under a chord type. Suspensions replace the third and have none. */
const triadQuality: Record<
  ChordQuality,
  'major' | 'minor' | 'diminished' | 'augmented' | 'none'
> = {
  major: 'major',
  minor: 'minor',
  diminished: 'diminished',
  augmented: 'augmented',
  sus2: 'none',
  sus4: 'none',
  seventh: 'major',
  maj7: 'major',
  min7: 'minor',
  halfDim7: 'diminished',
  dim7: 'diminished',
  minMaj7: 'minor',
  add9: 'major',
  ninth: 'major',
  maj9: 'major',
  min9: 'minor',
};

/**
 * The `V/x` label for a chord acting as an applied (secondary) dominant: a
 * major-quality chord on a degree whose own scale triad is not major, whose
 * root then falls a perfect fifth to the next chord. Both conditions are
 * required, because a secondary dominant is defined by where it goes and not
 * by how it sounds alone. The scale's own dominant is never labelled, and
 * neither is a blues I7 moving to IV7, whose scale triad is already major.
 * Cases this cannot prove return null instead of guessing; the lab shows the
 * degree numeral for those, which is a description rather than an analysis.
 */
export function appliedDominant(
  key: ChordKey,
  chord: ChordStep,
  next: ChordStep | undefined,
): string | null {
  validateKey(key);
  validateChord(chord);
  if (!next || chord.degree === 4) return null;
  validateChord(next);
  if (triadQuality[chord.quality] !== 'major') return null;
  if (triadQuality[paletteChord(key.mode, chord.degree).quality] === 'major')
    return null;
  const root = chordNotes(key, { ...chord, inversion: 0 })[0].midi % 12;
  const target = chordNotes(key, { ...next, inversion: 0 })[0].midi % 12;
  if ((target - root + 12) % 12 !== 5) return null;
  const seventh = chordQualities[chord.quality].steps.includes(10);
  return `V${seventh ? '7' : ''}/${degreeNumeral(key, next).text}`;
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
/**
 * Every chord re-qualified to the type the palette gives on its degree, so a
 * progression written in one scale can be made to belong to another. Degree,
 * bass position, length and register are kept: this changes what each chord
 * is, not where it is or how long it lasts.
 *
 * The chord's size is preserved rather than the palette's switch position — a
 * triad becomes the diatonic triad, a seventh the diatonic seventh — because
 * the reader asked for the chords to fit the scale, not to change density. A
 * ninth has no diatonic equivalent in this palette and becomes the seventh on
 * its degree, which is the closest the model can offer and is undoable.
 *
 * A bass position that the new chord is too small for moves to its lowest
 * available one, and a register that no longer fits is clamped, because a
 * seventh needs more room than the triad it replaced.
 */
export function fitToScale(key: ChordKey, chords: ChordStep[]): ChordStep[] {
  validateKey(key);
  return chords.map((chord) => {
    validateChord(chord);
    const size = chordQualities[chord.quality].steps.length;
    const wanted = paletteChord(key.mode, chord.degree, size > 3).quality;
    if (wanted === chord.quality) return chord;
    return clampChord(key, {
      ...chord,
      quality: wanted,
      inversion: Math.min(
        chord.inversion,
        chordQualities[wanted].steps.length - 1,
      ),
    });
  });
}

/** Whether any chord is not the type its own scale degree would give. */
export function fitsScale(key: ChordKey, chords: ChordStep[]) {
  return fitToScale(key, chords).every((chord, i) => chord === chords[i]);
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
/**
 * Accompaniment figures after Hutchinson §14.3–14.5: block chords repeated in
 * quarters or eighths, arpeggios rising and falling, the Alberti low–high–
 * middle–high pattern, a bass note answered by afterbeats, and chords placed
 * on the upbeats. They are ways to hear the same harmony move, not claims
 * about a style: none of them is swing, strumming or a real instrument.
 */
export const textures = [
  'held',
  'pulse',
  'eighths',
  'arpeggio',
  'arpeggioDown',
  'alberti',
  'afterbeat',
  'offbeat',
] as const;
export type Texture = (typeof textures)[number];

/**
 * Alberti bass generalized past the triad it was named for: the lowest voice,
 * the highest, one of the voices between them, the highest again. A triad has
 * a single middle voice and gives the classical four-note cycle; a seventh or
 * a ninth walks through its middles across successive cycles.
 */
function albertiVoice(i: number, notes: SpelledPitch[]) {
  const middles = notes.slice(1, -1);
  const position = i % 4;
  if (position === 0) return notes[0];
  if (position === 2) return middles[Math.floor(i / 4) % middles.length];
  return notes.at(-1)!;
}

/**
 * `rate` is positions per beat; 0 means one event for the whole chord.
 * `voices` chooses what sounds at each position, and may choose nothing.
 */
const figures: Record<
  Texture,
  { rate: number; voices: (i: number, notes: SpelledPitch[]) => SpelledPitch[] }
> = {
  held: { rate: 0, voices: (_, notes) => notes },
  pulse: { rate: 1, voices: (_, notes) => notes },
  eighths: { rate: 2, voices: (_, notes) => notes },
  arpeggio: { rate: 2, voices: (i, notes) => [notes[i % notes.length]] },
  arpeggioDown: {
    rate: 2,
    voices: (i, notes) => [notes[notes.length - 1 - (i % notes.length)]],
  },
  alberti: { rate: 2, voices: (i, notes) => [albertiVoice(i, notes)] },
  // The bass takes the downbeat and the chords answer it after the beat.
  afterbeat: {
    rate: 2,
    voices: (i, notes) => (i === 0 ? [notes[0]] : i % 2 ? notes : []),
  },
  // Upbeats only: the chord change is heard late, on purpose.
  offbeat: { rate: 2, voices: (i, notes) => (i % 2 ? notes : []) },
};
const step = (degree: number, quality: ChordQuality, beats = 4): ChordStep => ({
  degree,
  quality,
  beats,
  inversion: 0,
});
const repeat = (count: number, degree: number, quality: ChordQuality) =>
  Array.from({ length: count }, () => step(degree, quality));

/**
 * Readings behind the templates below. Each template names the section that
 * supports its chord pattern, so a learner can check the claim and an editor
 * can tell a sourced progression from an invented one. Section text is not
 * reproduced; only the harmonic pattern, which is a fact rather than prose.
 * Access date and full provenance: docs/chords-lab.md.
 */
export const templateSources = {
  cadences: {
    label: 'Hutchinson · §7.4 Cadences',
    href: 'https://musictheory.pugetsound.edu/mt21c/cadences.html',
  },
  circle: {
    label: 'Hutchinson · §9.3 Circle-of-fifths progressions',
    href: 'https://musictheory.pugetsound.edu/mt21c/ShorterProgressionsFromTheCircleOfFifths.html',
  },
  function: {
    label: 'Hutchinson · §9.4 Harmonic function',
    href: 'https://musictheory.pugetsound.edu/mt21c/HarmonicFunction.html',
  },
  bestseller: {
    label: 'Hutchinson · §9.7 The best-seller progression',
    href: 'https://musictheory.pugetsound.edu/mt21c/BestsellerProgression.html',
  },
  twelveBar: {
    label: 'Hutchinson · §12.4 Twelve-bar blues',
    href: 'https://musictheory.pugetsound.edu/mt21c/TwelveBarBlues.html',
  },
  secondary: {
    label: 'Hutchinson · §17.3 Secondary dominants',
    href: 'https://musictheory.pugetsound.edu/mt21c/SecondaryDominantsInMajorAndMinor.html',
  },
  mixture: {
    label: 'Hutchinson · §19.1 Mode mixture',
    href: 'https://musictheory.pugetsound.edu/mt21c/ModeMixtureSection.html',
  },
  jazzProgressions: {
    label: 'Hutchinson · §31.8 Standard chord progressions',
    href: 'https://musictheory.pugetsound.edu/mt21c/StandardChordProgressions.html',
  },
  fourChord: {
    label: 'Hughes & Lavengood · Open Music Theory, “Four-Chord Schemas”',
    href: 'https://viva.pressbooks.pub/openmusictheory/chapter/4-chord-schemas/',
  },
  classicalSchemas: {
    label: 'Hughes & Shaffer · Open Music Theory, “Classical Schemas”',
    href: 'https://viva.pressbooks.pub/openmusictheory/chapter/classical-schemas/',
  },
  bluesHarmony: {
    label: 'Hughes & Lavengood · Open Music Theory, “Blues Harmony”',
    href: 'https://viva.pressbooks.pub/openmusictheory/chapter/blues-harmony/',
  },
  bluesFunction: {
    label: 'DeBenedetti · Harmonic Expansions §5.5',
    href: 'https://www.gmajormusictheory.org/HarmExpansions/Ch5/05_5.html',
  },
} as const;
export type TemplateSource = keyof typeof templateSources;

/** Families in the picker, in the order they are offered. */
export const templateGroups = [
  {
    id: 'start',
    de: german['Start here'],
    en: 'Start here',
    ru: 'С чего начать',
  },
  { id: 'cadence', de: german['Cadences'], en: 'Cadences', ru: 'Каденции' },
  {
    id: 'schema',
    de: german['Classical schemas'],
    en: 'Classical schemas',
    ru: 'Классические схемы',
  },
  {
    id: 'pop',
    de: german['Pop and rock loops'],
    en: 'Pop and rock loops',
    ru: 'Поп- и рок-петли',
  },
  {
    id: 'jazz',
    de: german['Jazz turnarounds'],
    en: 'Jazz turnarounds',
    ru: 'Джазовые обороты',
  },
  {
    id: 'blues',
    de: german['Blues forms'],
    en: 'Blues forms',
    ru: 'Блюзовые формы',
  },
  {
    id: 'colour',
    de: german['Colour and chromatics'],
    en: 'Colour and chromatics',
    ru: 'Краски и хроматика',
  },
] as const;
export type TemplateGroup = (typeof templateGroups)[number]['id'];

export type ProgressionTemplate = {
  id: string;
  group: TemplateGroup;
  en: string;
  ru: string;
  de: string;
  /** Roman numerals as written in the reading, shown beside the name. */
  pattern: string;
  mode: KeyMode;
  tempo: number;
  texture: Texture;
  steps: ChordStep[];
  note: Record<MusicLanguage, string>;
  source: TemplateSource;
};

/**
 * Starting points, not a canon. Each one is a documented pattern a learner can
 * hear, take apart and change; the editor treats every template as an ordinary
 * progression once it is loaded, and loading one is undoable. Roman numerals
 * follow this lab's convention (major scale as reference, so minor's lowered
 * third, sixth and seventh degrees are written with flats), which is not the
 * only convention in use. A pattern is a frame, not a rule, and hearing one of
 * these chord successions is not by itself evidence of a style or a cadence.
 */
export const progressionTemplates: ProgressionTemplate[] = [
  {
    id: 'blank',
    group: 'start',
    de: german['One chord · build your own'],
    en: 'One chord · build your own',
    ru: 'Один аккорд · соберите своё',
    pattern: 'I',
    mode: 'major',
    tempo: 84,
    texture: 'held',
    steps: [step(0, 'major')],
    note: {
      de: german[
        'An empty page: one tonic chord. Add from the palette, then change each chord’s type, bass and length. Nothing here is fixed, and every edit can be undone.'
      ],
      en: 'An empty page: one tonic chord. Add from the palette, then change each chord’s type, bass and length. Nothing here is fixed, and every edit can be undone.',
      ru: 'Чистый лист: одна тоника. Добавляйте аккорды из палитры, затем меняйте вид, бас и длительность каждого. Ничто не закреплено, и любое изменение можно отменить.',
    },
    source: 'function',
  },
  {
    id: 'authentic',
    group: 'cadence',
    de: german['Authentic cadence · a return home'],
    en: 'Authentic cadence · a return home',
    ru: 'Автентическая каденция · возвращение к тонике',
    pattern: 'I–IV–V7–I',
    mode: 'major',
    tempo: 84,
    texture: 'held',
    steps: [
      step(0, 'major'),
      step(3, 'major'),
      step(4, 'seventh'),
      step(0, 'major'),
    ],
    note: {
      de: german[
        'Tonic, preparation, dominant, return. Hutchinson defines an authentic cadence as a phrase ending V–I. Compare it with the other three endings in this group; a cadence also depends on rhythm, melody and phrase position, so a chord pair alone does not settle it.'
      ],
      en: 'Tonic, preparation, dominant, return. Hutchinson defines an authentic cadence as a phrase ending V–I. Compare it with the other three endings in this group; a cadence also depends on rhythm, melody and phrase position, so a chord pair alone does not settle it.',
      ru: 'Тоника, подготовка, доминанта, возвращение. У Хатчинсона автентическая каденция — окончание фразы V–I. Сравните её с тремя другими окончаниями этой группы: каденция зависит также от ритма, мелодии и положения во фразе, поэтому одна пара аккордов её не определяет.',
    },
    source: 'cadences',
  },
  {
    id: 'half',
    group: 'cadence',
    de: german['Half cadence · stopping on V'],
    en: 'Half cadence · stopping on V',
    ru: 'Половинная каденция · остановка на V',
    pattern: 'I–vi–ii–V',
    mode: 'major',
    tempo: 80,
    texture: 'held',
    steps: [
      step(0, 'major'),
      step(5, 'minor'),
      step(1, 'minor'),
      step(4, 'major', 8),
    ],
    note: {
      en: 'A half cadence ends a phrase on V, leaving the return to I open. Listen to the last chord, then load the Authentic cadence template and compare its ending on the tonic.',
      ru: 'Половинная каденция завершает фразу на V ступени, оставляя возвращение к тонике открытым. Послушайте последний аккорд, затем выберите шаблон «Автентическая каденция» и сравните его окончание на тонике.',
      de: 'Ein Halbschluss beendet eine Phrase auf der Dominante; die Rückkehr zur Tonika bleibt offen. Höre den letzten Akkord an, lade dann die Vorlage „Authentische Kadenz“ und vergleiche ihren Schluss auf der Tonika.',
    },
    source: 'cadences',
  },
  {
    id: 'deceptive',
    group: 'cadence',
    de: german['Deceptive cadence · V7 goes elsewhere'],
    en: 'Deceptive cadence · V7 goes elsewhere',
    ru: 'Прерванная каденция · V7 уходит в сторону',
    pattern: 'I–IV–V7–vi',
    mode: 'major',
    tempo: 82,
    texture: 'held',
    steps: [
      step(0, 'major'),
      step(3, 'major'),
      step(4, 'seventh'),
      step(5, 'minor', 8),
    ],
    note: {
      de: german[
        'The same first three chords as the authentic cadence, with vi in place of I. Hutchinson notes that the term covers V resolving to anything other than I, of which V–vi is only the commonest case. Change the last chord back to I and compare.'
      ],
      en: 'The same first three chords as the authentic cadence, with vi in place of I. Hutchinson notes that the term covers V resolving to anything other than I, of which V–vi is only the commonest case. Change the last chord back to I and compare.',
      ru: 'Первые три аккорда те же, что и в автентической каденции, но вместо I стоит vi. Хатчинсон отмечает, что термин охватывает разрешение V в любой аккорд, кроме I, а V–vi — лишь самый частый случай. Верните последний аккорд к I и сравните.',
    },
    source: 'cadences',
  },
  {
    id: 'plagal',
    group: 'cadence',
    de: german['Plagal ending · IV–I after the close'],
    en: 'Plagal ending · IV–I after the close',
    ru: 'Плагальный оборот · IV–I после окончания',
    pattern: 'I–V–I · IV–I',
    mode: 'major',
    tempo: 76,
    texture: 'held',
    steps: [
      step(0, 'major'),
      step(4, 'major'),
      step(0, 'major'),
      step(3, 'major'),
      step(0, 'major', 8),
    ],
    note: {
      de: german[
        'An authentic close followed by the IV–I gesture often added after it. Hutchinson’s harmonic-function chapter treats a IV that moves to I as a prolongation of the tonic rather than a preparation for the dominant, which is why this feels like an afterword and not a new departure.'
      ],
      en: 'An authentic close followed by the IV–I gesture often added after it. Hutchinson’s harmonic-function chapter treats a IV that moves to I as a prolongation of the tonic rather than a preparation for the dominant, which is why this feels like an afterword and not a new departure.',
      ru: 'Автентическое окончание, за которым следует оборот IV–I, часто добавляемый после него. В главе о гармонических функциях Хатчинсон рассматривает IV, идущий в I, как продление тоники, а не подготовку доминанты, — поэтому оборот воспринимается как послесловие, а не новый уход.',
    },
    source: 'function',
  },
  {
    id: 'minorDominant',
    group: 'schema',
    de: german['Minor key · the leading tone'],
    en: 'Minor key · the leading tone',
    ru: 'Минор · вводный тон',
    pattern: 'i–iv–V7–i',
    mode: 'minor',
    tempo: 80,
    texture: 'arpeggio',
    steps: [
      step(0, 'minor'),
      step(3, 'minor'),
      step(4, 'seventh'),
      step(0, 'minor'),
    ],
    note: {
      en: 'V7 contains the raised seventh degree of the minor scale: in C minor, its notes are G–B–D–F. Change this third chord to a minor seventh chord: G–B♭–D–F. Only B becomes B♭; the root stays G. Compare how the leading tone B and the natural minor seventh B♭ approach the tonic C.',
      ru: 'V7 содержит повышенную VII ступень минора: в до миноре это соль–си–ре–фа. Замените этот третий аккорд малым минорным септаккордом: соль–си-бемоль–ре–фа. Меняется только си на си-бемоль, а основной тон соль остаётся. Сравните, как вводный тон си и VII ступень натурального минора си-бемоль переходят в тонику до.',
      de: 'V7 enthält die erhöhte siebte Stufe der Molltonleiter: in c-Moll die Töne G–H–D–F. Ändere diesen dritten Akkord zu einem Mollseptakkord: G–B–D–F. Nur H wird zu B; der Grundton G bleibt. Vergleiche, wie der Leitton H und die natürliche siebte Mollstufe B zur Tonika C führen.',
    },
    source: 'function',
  },
  {
    id: 'lament',
    group: 'schema',
    de: german['Lament · a descending minor tetrachord'],
    en: 'Lament · a descending minor tetrachord',
    ru: 'Ламенто · нисходящий минорный тетрахорд',
    pattern: 'i–♭VII–♭VI–V',
    mode: 'minor',
    tempo: 72,
    texture: 'held',
    steps: [
      step(0, 'minor'),
      step(6, 'major'),
      step(5, 'major'),
      step(4, 'major'),
    ],
    note: {
      en: 'The bass descends from the tonic to the fifth degree through the natural minor scale: C–B♭–A♭–G in C minor. Open Music Theory traces this lament schema from repeated bass patterns in early laments to rock. The final major chord contains the raised seventh degree, the leading tone, before the loop returns to the tonic.',
      ru: 'Бас спускается от тоники к V ступени по звукам натурального минора: до–си-бемоль–ля-бемоль–соль в до миноре. Open Music Theory прослеживает схему ламенто от повторяющегося баса старинных плачей до рока. Последний мажорный аккорд содержит повышенную VII ступень — вводный тон, после которого цикл возвращается к тонике.',
      de: 'Der Bass steigt von der Tonika zur fünften Stufe durch die natürliche Molltonleiter ab: C–B–As–G in c-Moll. Open Music Theory verfolgt dieses Lamentoschema vom wiederkehrenden Bass früher Klagegesänge bis zum Rock. Der letzte Durakkord enthält die erhöhte siebte Stufe, den Leitton, bevor der Zyklus zur Tonika zurückkehrt.',
    },
    source: 'classicalSchemas',
  },
  {
    id: 'circleFifths',
    group: 'schema',
    de: german['Circle of fifths · roots falling by fifths'],
    en: 'Circle of fifths · roots falling by fifths',
    ru: 'Круг квинт · основные тоны по нисходящим квинтам',
    pattern: 'iii–vi–ii–V–I',
    mode: 'major',
    tempo: 88,
    texture: 'held',
    steps: [
      step(2, 'minor'),
      step(5, 'minor'),
      step(1, 'minor'),
      step(4, 'major'),
      step(0, 'major', 8),
    ],
    note: {
      de: german[
        'Every root falls a perfect fifth to the next. Hutchinson gives iii–vi–ii–V as a circle segment and ii–V–I as its shortest form; the chain can be lengthened, rotated or started anywhere. Try switching every chord to its seventh to hear the jazz version of the same motion.'
      ],
      en: 'Every root falls a perfect fifth to the next. Hutchinson gives iii–vi–ii–V as a circle segment and ii–V–I as its shortest form; the chain can be lengthened, rotated or started anywhere. Try switching every chord to its seventh to hear the jazz version of the same motion.',
      ru: 'Каждый основной тон опускается на чистую квинту. Хатчинсон приводит iii–vi–ii–V как отрезок круга, а ii–V–I — как его кратчайшую форму; цепочку можно удлинять, поворачивать и начинать с любого места. Смените все аккорды на септаккорды, чтобы услышать джазовый вариант того же движения.',
    },
    source: 'circle',
  },
  {
    id: 'singerSongwriter',
    group: 'pop',
    de: german['Singer/songwriter · four chords'],
    en: 'Singer/songwriter · four chords',
    ru: 'Сингер-сонграйтер · четыре аккорда',
    pattern: 'I–V–vi–IV',
    mode: 'major',
    tempo: 112,
    texture: 'arpeggio',
    steps: [
      step(0, 'major'),
      step(4, 'major'),
      step(5, 'minor'),
      step(3, 'major'),
    ],
    note: {
      de: german[
        'Open Music Theory groups the common pop loops by which chord the major tonic is approached from; here it is IV, a plagal approach. Move the first chord to the end and listen again: the same four chords can suggest a different centre through order and emphasis.'
      ],
      en: 'Open Music Theory groups the common pop loops by which chord the major tonic is approached from; here it is IV, a plagal approach. Move the first chord to the end and listen again: the same four chords can suggest a different centre through order and emphasis.',
      ru: 'В Open Music Theory популярные петли различают по тому, откуда подходит мажорная тоника; здесь это IV — плагальный подход. Переставьте первый аккорд в конец и послушайте снова: те же четыре аккорда могут создавать ощущение другого центра благодаря порядку и акцентам.',
    },
    source: 'fourChord',
  },
  {
    id: 'singerSongwriterMinor',
    group: 'pop',
    de: german['Singer/songwriter, rotated · minor or major?'],
    en: 'Singer/songwriter, rotated · minor or major?',
    ru: 'Сингер-сонграйтер, поворот · минор или мажор?',
    pattern: 'vi–IV–I–V',
    mode: 'major',
    tempo: 108,
    texture: 'arpeggio',
    steps: [
      step(5, 'minor'),
      step(3, 'major'),
      step(0, 'major'),
      step(4, 'major'),
    ],
    note: {
      de: german[
        'The same cycle begun on vi. Open Music Theory calls this rotation tonally ambiguous: it can be heard as vi–IV–I–V in the major key or i–♭VI–♭III–♭VII in the relative minor, because neither reading gets an authentic cadence. Decide for yourself which chord sounds like home.'
      ],
      en: 'The same cycle begun on vi. Open Music Theory calls this rotation tonally ambiguous: it can be heard as vi–IV–I–V in the major key or i–♭VI–♭III–♭VII in the relative minor, because neither reading gets an authentic cadence. Decide for yourself which chord sounds like home.',
      ru: 'Тот же цикл, начатый с vi. В Open Music Theory этот поворот назван тонально неоднозначным: его можно услышать как vi–IV–I–V в мажоре или как i–♭VI–♭III–♭VII в параллельном миноре, потому что ни в одном прочтении нет автентической каденции. Решите сами, какой аккорд звучит как дом.',
    },
    source: 'fourChord',
  },
  {
    id: 'dooWop',
    group: 'pop',
    de: german['Doo-wop · the ballad cycle'],
    en: 'Doo-wop · the ballad cycle',
    ru: 'Ду-воп · балладный цикл',
    pattern: 'I–vi–IV–V',
    mode: 'major',
    tempo: 100,
    texture: 'pulse',
    steps: [
      step(0, 'major'),
      step(5, 'minor'),
      step(3, 'major'),
      step(4, 'major'),
    ],
    note: {
      de: german[
        'Named for its use in rock ballads of the 1950s and early 1960s. Of the common four-chord cycles this is the one that approaches the tonic from V, the traditional authentic motion — which is what makes it sound the most classical of the three.'
      ],
      en: 'Named for its use in rock ballads of the 1950s and early 1960s. Of the common four-chord cycles this is the one that approaches the tonic from V, the traditional authentic motion — which is what makes it sound the most classical of the three.',
      ru: 'Назван по применению в рок-балладах 1950-х и начала 1960-х. Из распространённых четырёхаккордовых циклов именно здесь тоника достигается от V — традиционным автентическим движением, из-за чего цикл звучит наиболее «классически».',
    },
    source: 'fourChord',
  },
  {
    id: 'dooWopTwo',
    group: 'pop',
    de: german['Doo-wop with ii · one chord swapped'],
    en: 'Doo-wop with ii · one chord swapped',
    ru: 'Ду-воп с ii · один аккорд заменён',
    pattern: 'I–vi–ii–V',
    mode: 'major',
    tempo: 100,
    texture: 'pulse',
    steps: [
      step(0, 'major'),
      step(5, 'minor'),
      step(1, 'minor'),
      step(4, 'major'),
    ],
    note: {
      de: german[
        'ii replaces IV. Open Music Theory explains the swap by shared function: both prepare the dominant, so the cycle keeps its shape while changing colour. Play this against the previous template and listen only to the third chord.'
      ],
      en: 'ii replaces IV. Open Music Theory explains the swap by shared function: both prepare the dominant, so the cycle keeps its shape while changing colour. Play this against the previous template and listen only to the third chord.',
      ru: 'ii заменяет IV. В Open Music Theory замена объясняется общей функцией: оба аккорда готовят доминанту, поэтому цикл сохраняет форму и меняет краску. Сыграйте его рядом с предыдущим примером, слушая только третий аккорд.',
    },
    source: 'fourChord',
  },
  {
    id: 'hopscotch',
    group: 'pop',
    de: german['Hopscotch · step, step, skip'],
    en: 'Hopscotch · step, step, skip',
    ru: 'Хопскотч · шаг, шаг, скачок',
    pattern: 'IV–V–vi–I',
    mode: 'major',
    tempo: 116,
    texture: 'arpeggio',
    steps: [
      step(3, 'major'),
      step(4, 'major'),
      step(5, 'minor'),
      step(0, 'major'),
    ],
    note: {
      de: german[
        'Open Music Theory names this recent cycle after its root motion: two steps up, then a skip. The major tonic arrives from vi, an approach belonging to no traditional cadence, which is why the loop can turn without ever sounding closed.'
      ],
      en: 'Open Music Theory names this recent cycle after its root motion: two steps up, then a skip. The major tonic arrives from vi, an approach belonging to no traditional cadence, which is why the loop can turn without ever sounding closed.',
      ru: 'В Open Music Theory этот недавний цикл назван по движению основных тонов: два шага вверх, затем скачок. Мажорная тоника приходит от vi — такой подход не принадлежит ни одной традиционной каденции, поэтому петля вращается, ни разу не звуча завершённой.',
    },
    source: 'fourChord',
  },
  {
    id: 'jazzTwoFive',
    group: 'jazz',
    de: german['ii–V–I · the shortest circle'],
    en: 'ii–V–I · the shortest circle',
    ru: 'ii–V–I · кратчайший отрезок круга',
    pattern: 'ii7–V7–Imaj7',
    mode: 'major',
    tempo: 96,
    texture: 'held',
    steps: [step(1, 'min7'), step(4, 'seventh'), step(0, 'maj7', 8)],
    note: {
      en: 'Hutchinson describes ii–V–I as a common jazz progression. The roots descend by fifths. With suitable voicing, thirds and sevenths can connect by step or remain on the same pitch; this depends on how the notes are arranged. Try different inversions and compare the bass and upper notes.',
      ru: 'Хатчинсон описывает ii–V–I как распространённый джазовый оборот. Основные тоны движутся по нисходящим квинтам. При подходящем расположении голосов терции и септимы могут переходить поступенно или оставаться на одной высоте. Попробуйте разные обращения и сравните движение баса и верхних звуков.',
      de: 'Hutchinson beschreibt ii–V–I als verbreitete Jazzprogression. Die Grundtöne gehen in fallenden Quinten weiter. Bei passender Stimmführung können sich Terzen und Septimen schrittweise verbinden oder als gemeinsamer Ton liegen bleiben; entscheidend ist die Anordnung der Töne. Probiere verschiedene Umkehrungen und vergleiche Bass und Oberstimmen.',
    },
    source: 'jazzProgressions',
  },
  {
    id: 'jazzMinorTwoFive',
    group: 'jazz',
    de: german['Minor ii–V–i · half-diminished start'],
    en: 'Minor ii–V–i · half-diminished start',
    ru: 'Минорный ii–V–i · с полууменьшённого',
    pattern: 'iiø7–V7–i(maj7)',
    mode: 'minor',
    tempo: 88,
    texture: 'held',
    steps: [step(1, 'halfDim7'), step(4, 'seventh'), step(0, 'minMaj7', 8)],
    note: {
      de: german[
        'The minor form of the same motion. The second degree carries a half-diminished seventh, and the dominant keeps its major third. The tonic here is a minor triad with a major seventh — a chord Hutchinson describes as characteristic of jazz. Change it to a plain minor seventh and compare.'
      ],
      en: 'The minor form of the same motion. The second degree carries a half-diminished seventh, and the dominant keeps its major third. The tonic here is a minor triad with a major seventh — a chord Hutchinson describes as characteristic of jazz. Change it to a plain minor seventh and compare.',
      ru: 'Минорная форма того же движения. На второй ступени стоит полууменьшённый септаккорд, доминанта сохраняет большую терцию. Тоника здесь — минорное трезвучие с большой септимой; Хатчинсон описывает этот аккорд как характерный для джаза. Смените его на малый минорный септаккорд и сравните.',
    },
    source: 'jazzProgressions',
  },
  {
    id: 'turnaround',
    group: 'jazz',
    de: german['Turnaround · back to the top'],
    en: 'Turnaround · back to the top',
    ru: 'Тёрнэраунд · возвращение к началу',
    pattern: 'iii7–vi7–ii7–V7',
    mode: 'major',
    tempo: 104,
    texture: 'held',
    steps: [
      step(2, 'min7'),
      step(5, 'min7'),
      step(1, 'min7'),
      step(4, 'seventh'),
    ],
    note: {
      en: 'This turnaround ends on V7 and prepares a return to the beginning of a form. Repeating the template joins V7 to iii7. Add a tonic chord after V7 to compare that loop with a direct return to I.',
      ru: 'Этот тёрнэраунд заканчивается на V7 и подготавливает возвращение к началу формы. При повторении шаблона после V7 снова звучит iii7. Добавьте тонический аккорд после V7 и сравните этот цикл с прямым возвращением к I ступени.',
      de: 'Dieser Turnaround endet auf V7 und bereitet die Rückkehr zum Formanfang vor. Beim Wiederholen der Vorlage folgt auf V7 wieder iii7. Füge nach V7 einen Tonikaakkord hinzu und vergleiche den Zyklus mit einer direkten Rückkehr zur I. Stufe.',
    },
    source: 'jazzProgressions',
  },
  {
    id: 'blues',
    group: 'blues',
    de: german['Twelve-bar blues · the basic frame'],
    en: 'Twelve-bar blues · the basic frame',
    ru: 'Двенадцать тактов блюза · основа',
    pattern: 'I7 · IV7 · V7',
    mode: 'major',
    tempo: 104,
    texture: 'pulse',
    steps: [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 0].map((degree) =>
      step(degree, 'seventh'),
    ),
    note: {
      en: 'Three four-bar phrases use I7, IV7 and V7. In blues, the dominant-seventh chord type can serve as tonic, subdominant or dominant: I7 can be a point of rest. The even pulses here let you hear the chord changes; blues phrasing, swing and blue-note intonation require further exploration.',
      ru: 'Три четырёхтактовые фразы используют I7, IV7 и V7. В блюзе малый мажорный септаккорд может выполнять тоническую, субдоминантовую или доминантовую функцию: I7 может быть устойчивой опорой. Ровная пульсация здесь помогает услышать смену аккордов; блюзовая фразировка, свинг и интонация блюзовых нот требуют отдельного изучения.',
      de: 'Drei viertaktige Phrasen verwenden I7, IV7 und V7. Im Blues kann der Akkordtyp des Dominantseptakkords als Tonika, Subdominante oder Dominante auftreten: I7 kann ein Ruhepunkt sein. Die gleichmäßigen Impulse machen hier die Akkordwechsel hörbar; Bluesphrasierung, Swing und die Intonation der Blue Notes verdienen eine eigene Untersuchung.',
    },
    source: 'bluesFunction',
  },
  {
    id: 'bluesQuickChange',
    group: 'blues',
    de: german['Twelve bars, quick change · IV in bar two'],
    en: 'Twelve bars, quick change · IV in bar two',
    ru: 'Двенадцать тактов, быстрая смена · IV во втором такте',
    pattern: 'I7–IV7–I7 … V7',
    mode: 'major',
    tempo: 104,
    texture: 'pulse',
    steps: [0, 3, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4].map((degree) =>
      step(degree, 'seventh'),
    ),
    note: {
      de: german[
        'Two of the commonest alterations at once: IV in the second bar, and a dominant in the last bar to turn the form around. Open Music Theory describes the twelve-bar blues as a frame that survives such changes — it is hard to find a blues that alters nothing.'
      ],
      en: 'Two of the commonest alterations at once: IV in the second bar, and a dominant in the last bar to turn the form around. Open Music Theory describes the twelve-bar blues as a frame that survives such changes — it is hard to find a blues that alters nothing.',
      ru: 'Сразу два самых частых изменения: IV во втором такте и доминанта в последнем, возвращающая форму к началу. В Open Music Theory 12-тактовый блюз описан как рамка, выдерживающая такие изменения: блюз, в котором не изменено ничего, найти трудно.',
    },
    source: 'bluesHarmony',
  },
  {
    id: 'minorBlues',
    group: 'blues',
    de: german['Minor blues · sevenths turn minor'],
    en: 'Minor blues · sevenths turn minor',
    ru: 'Минорный блюз · септаккорды становятся минорными',
    pattern: 'i7 · iv7 · iiø7–V7',
    mode: 'minor',
    tempo: 92,
    texture: 'pulse',
    steps: [
      ...repeat(4, 0, 'min7'),
      ...repeat(2, 3, 'min7'),
      ...repeat(2, 0, 'min7'),
      step(1, 'halfDim7'),
      step(4, 'seventh'),
      ...repeat(2, 0, 'min7'),
    ],
    note: {
      de: german[
        'The tonic and subdominant become minor sevenths while the dominant keeps its major third. Because the major V falling to a minor iv sounds anticlimactic, the last phrase replaces V–IV–i with the minor ii–V–i.'
      ],
      en: 'The tonic and subdominant become minor sevenths while the dominant keeps its major third. Because the major V falling to a minor iv sounds anticlimactic, the last phrase replaces V–IV–i with the minor ii–V–i.',
      ru: 'Тоника и субдоминанта становятся малыми минорными септаккордами, а доминанта сохраняет большую терцию. Поскольку переход мажорной V в минорную iv звучит спадом, в последней фразе вместо V–IV–i стоит минорный ii–V–i.',
    },
    source: 'bluesHarmony',
  },
  {
    id: 'jazzBlues',
    group: 'blues',
    de: german['Jazz blues · ii–V inside the form'],
    en: 'Jazz blues · ii–V inside the form',
    ru: 'Джазовый блюз · ii–V внутри формы',
    pattern: 'I7 … VI7–ii7–V7',
    mode: 'major',
    tempo: 116,
    texture: 'pulse',
    steps: [
      step(0, 'seventh'),
      step(3, 'seventh'),
      step(0, 'seventh'),
      step(0, 'seventh'),
      step(3, 'seventh'),
      step(3, 'seventh'),
      step(0, 'seventh'),
      step(5, 'seventh'),
      step(1, 'min7'),
      step(4, 'seventh'),
      step(0, 'seventh'),
      step(5, 'seventh'),
    ],
    note: {
      de: german[
        'The blues frame with jazz motion added: bar eight turns vi into a dominant that leads to ii, and the last phrase uses ii–V–I in place of the plagal V–IV–I. Watch for the V7/ii label on the eighth chord — the lab marks it only because the next chord confirms it.'
      ],
      en: 'The blues frame with jazz motion added: bar eight turns vi into a dominant that leads to ii, and the last phrase uses ii–V–I in place of the plagal V–IV–I. Watch for the V7/ii label on the eighth chord — the lab marks it only because the next chord confirms it.',
      ru: 'Блюзовая рамка с добавленным джазовым движением: в восьмом такте vi превращается в доминанту, ведущую к ii, а в последней фразе вместо плагального V–IV–I звучит ii–V–I. Обратите внимание на отметку V7/ii у восьмого аккорда: лаборатория ставит её только потому, что следующий аккорд её подтверждает.',
    },
    source: 'bluesHarmony',
  },
  {
    id: 'borrowedFour',
    group: 'colour',
    de: german['Borrowed iv · a minor chord in a major key'],
    en: 'Borrowed iv · a minor chord in a major key',
    ru: 'Заимствованная iv · минорный аккорд в мажоре',
    pattern: 'I–IV–iv–I',
    mode: 'major',
    tempo: 76,
    texture: 'held',
    steps: [
      step(0, 'major'),
      step(3, 'major'),
      step(3, 'minor'),
      step(0, 'major', 8),
    ],
    note: {
      de: german[
        'The same subdominant twice, major then minor. Hutchinson calls borrowing from the parallel minor mode mixture, and names the lowered sixth degree as its commonest carrier — that is the one note that changes here. Nothing in the key signature moves; only the chord’s third.'
      ],
      en: 'The same subdominant twice, major then minor. Hutchinson calls borrowing from the parallel minor mode mixture, and names the lowered sixth degree as its commonest carrier — that is the one note that changes here. Nothing in the key signature moves; only the chord’s third.',
      ru: 'Одна и та же субдоминанта дважды: мажорная, затем минорная. Хатчинсон называет заимствование из одноимённого минора модальным обменом и указывает пониженную VI ступень как его самый частый носитель — именно этот звук здесь и меняется. Ключевые знаки остаются прежними; меняется только терция аккорда.',
    },
    source: 'mixture',
  },
  {
    id: 'appliedDominant',
    group: 'colour',
    de: german['Applied dominant · a dominant of the dominant'],
    en: 'Applied dominant · a dominant of the dominant',
    ru: 'Побочная доминанта · доминанта к доминанте',
    pattern: 'I–V7/V–V–I',
    mode: 'major',
    tempo: 84,
    texture: 'held',
    steps: [
      step(0, 'major'),
      step(1, 'seventh'),
      step(4, 'major'),
      step(0, 'major', 8),
    ],
    note: {
      en: 'The second chord turns the scale’s ii into a major triad with a minor seventh, pointing towards V. In this lab, the V7/V label requires the next root to be a fifth below. Change the third chord to another root and the label disappears: the lab no longer has the immediate resolution it uses as evidence. This is a deliberately limited analysis, not a rule that all applied dominants must resolve immediately.',
      ru: 'Второй аккорд превращает минорное трезвучие II ступени в малый мажорный септаккорд, направленный к V ступени. Здесь подпись V7/V появляется, только если основной тон следующего аккорда находится квинтой ниже. Выберите для третьего аккорда другой основной тон — и подпись исчезнет: лаборатория больше не видит непосредственного разрешения, на которое опирается анализ. Это ограничение модели, а не требование немедленного разрешения любой побочной доминанты.',
      de: 'Der zweite Akkord macht aus dem leitereigenen Mollakkord der II. Stufe einen Durakkord mit kleiner Septime, der zur Dominante führt. Das Labor zeigt V7/V nur, wenn der nächste Grundton eine Quinte tiefer liegt. Wähle für den dritten Akkord einen anderen Grundton: Die Bezeichnung verschwindet, weil die unmittelbare Auflösung als Beleg fehlt. Diese Analyse ist bewusst begrenzt; Zwischendominanten müssen sich nicht immer sofort auflösen.',
    },
    source: 'secondary',
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
    !(textures as readonly string[]).includes(texture) ||
    chords.length < 1 ||
    chords.length > MAX_CHORDS
  )
    throw new RangeError('Invalid progression settings');
  const secondsPerBeat = 60 / tempo;
  const figure = figures[texture];
  const events: NoteEvent[] = [],
    starts: number[] = [];
  let beat = 0;
  for (let repeat = 0; repeat < repeats; repeat++) {
    for (const chord of chords) {
      const notes = chordNotes(key, chord);
      // The register is per chord, so a phrase can contain one card that no
      // longer fits. Say which chord, here, rather than letting the player
      // reject the note later where the reader is told to check their browser.
      for (const note of notes)
        if (note.midi < MIN_MIDI || note.midi > MAX_MIDI)
          throw new RangeError(
            `Chord ${chordSymbol(key, chord)} lies outside the keyboard`,
          );
      starts.push(beat * secondsPerBeat);
      const count = figure.rate === 0 ? 1 : chord.beats * figure.rate;
      const length = (chord.beats / count) * secondsPerBeat;
      for (let i = 0; i < count; i++) {
        const voices = figure.voices(i, notes);
        for (const note of voices)
          events.push({
            midi: note.midi,
            at: beat * secondsPerBeat + i * length,
            duration: length * 0.9,
            // The voices sounding together share one level, so a figure that
            // plays one note at a time is not quieter than a block chord.
            level: 1 / voices.length,
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
