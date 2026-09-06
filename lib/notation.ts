export type MusicLanguage = 'en' | 'ru';
export type SpelledPitch = {
  letter: number;
  accidental: number;
  octave: number;
  midi: number;
};
export type SpelledPattern = {
  en: string;
  ru: string;
  steps: readonly number[];
  /** Zero-based diatonic positions; 7 is the octave, not the seventh. */
  degrees: readonly number[];
};
export type SpelledScale = SpelledPattern & {
  title: { en: string; ru: string };
};

const letters = 'CDEFGAB';
const naturalSteps = [0, 2, 4, 5, 7, 9, 11];
const russianNotes = ['до', 'ре', 'ми', 'фа', 'соль', 'ля', 'си'];
const accidentals = ['𝄫', '♭', '', '♯', '𝄪'];
const russianAccidentals = [
  '-дубль-бемоль',
  '-бемоль',
  '',
  '-диез',
  '-дубль-диез',
];
const russianOctaves = [
  'субконтроктава',
  'контроктава',
  'большая октава',
  'малая октава',
  'первая октава',
  'вторая октава',
  'третья октава',
  'четвёртая октава',
  'пятая октава',
];

// Explicit spellings keep enharmonic tonics distinct even on the same key.
export const experimentTonics = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
];

/** Western staff spelling, independent of the chosen frequency/tuning map.
 * See docs/music-notation.md for scope, degree formulas and verified sources.
 */
export function spellPattern(
  tonic: string,
  pattern: Pick<SpelledPattern, 'steps' | 'degrees'>,
  octave = 4,
): SpelledPitch[] {
  if (!/^[A-G](#|b)?$/.test(tonic))
    throw new RangeError('Invalid tonic spelling');
  if (!Number.isInteger(octave) || octave < 0 || octave > 8)
    throw new RangeError('Written octave must be between 0 and 8');
  if (!pattern.steps.length || pattern.steps.length !== pattern.degrees.length)
    throw new RangeError('Every pitch needs a step and a diatonic position');
  const rootLetter = letters.indexOf(tonic[0]);
  const alteration = tonic.endsWith('#') ? 1 : tonic.endsWith('b') ? -1 : 0;
  const rootMidi = (octave + 1) * 12 + naturalSteps[rootLetter] + alteration;
  return pattern.steps.map((step, i) => {
    const degree = pattern.degrees[i];
    if (
      !Number.isInteger(step) ||
      step < 0 ||
      step > 12 ||
      !Number.isInteger(degree) ||
      degree < 0 ||
      degree > 7
    )
      throw new RangeError(
        'Experiment steps and diatonic positions must fit one octave',
      );
    const position = rootLetter + degree;
    const letter = position % 7;
    const writtenOctave = octave + Math.floor(position / 7);
    const midi = rootMidi + step;
    const accidental = midi - ((writtenOctave + 1) * 12 + naturalSteps[letter]);
    if (writtenOctave > 8 || Math.abs(accidental) > 2)
      throw new RangeError(
        'Pitch exceeds supported octaves or double accidentals',
      );
    return { letter, accidental, octave: writtenOctave, midi };
  });
}

export function pitchName(pitch: SpelledPitch, lang: MusicLanguage): string {
  return lang === 'ru'
    ? russianNotes[pitch.letter] + russianAccidentals[pitch.accidental + 2]
    : letters[pitch.letter] + accidentals[pitch.accidental + 2];
}

export function octaveName(pitch: SpelledPitch, lang: MusicLanguage): string {
  return lang === 'ru'
    ? russianOctaves[pitch.octave]
    : `octave ${pitch.octave}`;
}

export function pitchLabel(pitch: SpelledPitch, lang: MusicLanguage): string {
  const name = pitchName(pitch, lang);
  return lang === 'ru'
    ? `${name}, ${octaveName(pitch, lang)}`
    : `${name}${pitch.octave}`;
}

export function scaleName(
  tonic: SpelledPitch,
  pattern: SpelledScale,
  lang: MusicLanguage,
): string {
  return pattern.title[lang].replace('{tonic}', pitchName(tonic, lang));
}
