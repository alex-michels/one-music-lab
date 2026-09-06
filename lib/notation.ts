export type MusicLanguage = import('./client-store').Lang;
export type SpelledPitch = {
  letter: number;
  accidental: number;
  octave: number;
  midi: number;
};
export type SpelledPattern = {
  en: string;
  ru: string;
  de: string;
  steps: readonly number[];
  /** Zero-based diatonic positions; 7 is the octave, not the seventh. */
  degrees: readonly number[];
};
export type SpelledScale = SpelledPattern & {
  title: Record<MusicLanguage, string>;
};

const letters = 'CDEFGAB';
const naturalSteps = [0, 2, 4, 5, 7, 9, 11];
const russianNotes = ['до', 'ре', 'ми', 'фа', 'соль', 'ля', 'си'];
// Columns: double flat, flat, natural, sharp, double sharp. H♭ is B;
// A𝄫 is Ases and H𝄫 is Heses (Beck, Theorie D2/D3, pp. 8–10).
const germanNotes = [
  ['Ceses', 'Ces', 'C', 'Cis', 'Cisis'],
  ['Deses', 'Des', 'D', 'Dis', 'Disis'],
  ['Eses', 'Es', 'E', 'Eis', 'Eisis'],
  ['Feses', 'Fes', 'F', 'Fis', 'Fisis'],
  ['Geses', 'Ges', 'G', 'Gis', 'Gisis'],
  ['Ases', 'As', 'A', 'Ais', 'Aisis'],
  ['Heses', 'B', 'H', 'His', 'Hisis'],
];
const germanOctaves = [
  'Subkontraoktave',
  'Kontraoktave',
  'große Oktave',
  'kleine Oktave',
  'eingestrichene Oktave',
  'zweigestrichene Oktave',
  'dreigestrichene Oktave',
  'viergestrichene Oktave',
  'fünfgestrichene Oktave',
];
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
  if (lang === 'de') return germanNotes[pitch.letter][pitch.accidental + 2];
  return lang === 'ru'
    ? russianNotes[pitch.letter] + russianAccidentals[pitch.accidental + 2]
    : letters[pitch.letter] + accidentals[pitch.accidental + 2];
}

export function octaveName(pitch: SpelledPitch, lang: MusicLanguage): string {
  if (lang === 'de') return germanOctaves[pitch.octave];
  return lang === 'ru'
    ? russianOctaves[pitch.octave]
    : `octave ${pitch.octave}`;
}

export function pitchLabel(pitch: SpelledPitch, lang: MusicLanguage): string {
  const name = pitchName(pitch, lang);
  if (lang === 'de') {
    if (pitch.octave < 2) return name + (pitch.octave === 0 ? '₂' : '₁');
    if (pitch.octave === 2) return name;
    return (
      name.toLowerCase() + ['', '′', '″', '‴', '⁗', '⁗′'][pitch.octave - 3]
    );
  }
  return lang === 'ru'
    ? `${name}, ${octaveName(pitch, lang)}`
    : `${name}${pitch.octave}`;
}

export function scaleName(
  tonic: SpelledPitch,
  pattern: SpelledScale,
  lang: MusicLanguage,
): string {
  const title = pattern.title[lang];
  const name = pitchName(tonic, lang);
  return title.replace(
    '{tonic}',
    lang === 'de' && title.includes('-Moll') ? name.toLowerCase() : name,
  );
}

/** Chromatic keyboard labels have no key context; prefer sharps, as in EN.
 * Degree-aware scale/chord spellings must continue to use spellPattern instead.
 */
export function keyboardPitch(midi: number): SpelledPitch {
  if (!Number.isInteger(midi) || midi < 12 || midi > 119)
    throw new RangeError('Keyboard note must be MIDI 12–119');
  const position = midi % 12;
  const letter = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6][position];
  return {
    letter,
    accidental: position - naturalSteps[letter],
    octave: Math.floor(midi / 12) - 1,
    midi,
  };
}

/** The frequency display can exceed the named keyboard range with extreme tuning.
 * Preserve an exact MIDI identifier there, instead of inventing an octave name.
 */
export function localizedNoteName(midi: number, lang: MusicLanguage): string {
  if (!Number.isInteger(midi))
    throw new RangeError('Note number must be an integer');
  if (midi < 12 || midi > 119) return `MIDI ${midi}`;
  return pitchLabel(keyboardPitch(midi), lang);
}

/** A third keeps its third's letter, even when another key sounds identical. */
export function intervalLabels(
  midi: number,
  step: number,
  degree: number,
  lang: MusicLanguage,
): string[] {
  const root = keyboardPitch(midi);
  const tonic = pitchName(root, 'en').replace('♯', '#');
  return spellPattern(
    tonic,
    { steps: [0, step], degrees: [0, degree] },
    root.octave,
  ).map((pitch) => pitchLabel(pitch, lang));
}
