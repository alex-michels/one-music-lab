import { expect, test } from 'vitest';
import {
  experimentTonics,
  octaveName,
  pitchLabel,
  pitchName,
  scaleName,
  spellPattern,
} from '../lib/notation.ts';
import { scales } from '../lib/scales.ts';
import { patterns } from '../lib/learning.ts';
import { frequencyForMidi } from '../lib/music.ts';

const scale = (name) => scales.find((s) => s.en === name);
const names = (tonic, name, lang = 'en') =>
  spellPattern(tonic, scale(name)).map((p) => pitchName(p, lang));

// Independently written key-signature examples, including enharmonic keys.
// These assert musical spellings, rather than recomputing the production formula.
const majorKeys = {
  C: 'C D E F G A B C',
  'C#': 'C♯ D♯ E♯ F♯ G♯ A♯ B♯ C♯',
  Db: 'D♭ E♭ F G♭ A♭ B♭ C D♭',
  D: 'D E F♯ G A B C♯ D',
  'D#': 'D♯ E♯ F𝄪 G♯ A♯ B♯ C𝄪 D♯',
  Eb: 'E♭ F G A♭ B♭ C D E♭',
  E: 'E F♯ G♯ A B C♯ D♯ E',
  F: 'F G A B♭ C D E F',
  'F#': 'F♯ G♯ A♯ B C♯ D♯ E♯ F♯',
  Gb: 'G♭ A♭ B♭ C♭ D♭ E♭ F G♭',
  G: 'G A B C D E F♯ G',
  'G#': 'G♯ A♯ B♯ C♯ D♯ E♯ F𝄪 G♯',
  Ab: 'A♭ B♭ C D♭ E♭ F G A♭',
  A: 'A B C♯ D E F♯ G♯ A',
  'A#': 'A♯ B♯ C𝄪 D♯ E♯ F𝄪 G𝄪 A♯',
  Bb: 'B♭ C D E♭ F G A B♭',
  B: 'B C♯ D♯ E F♯ G♯ A♯ B',
};
const minorKeys = {
  C: 'C D E♭ F G A♭ B♭ C',
  'C#': 'C♯ D♯ E F♯ G♯ A B C♯',
  Db: 'D♭ E♭ F♭ G♭ A♭ B𝄫 C♭ D♭',
  D: 'D E F G A B♭ C D',
  'D#': 'D♯ E♯ F♯ G♯ A♯ B C♯ D♯',
  Eb: 'E♭ F G♭ A♭ B♭ C♭ D♭ E♭',
  E: 'E F♯ G A B C D E',
  F: 'F G A♭ B♭ C D♭ E♭ F',
  'F#': 'F♯ G♯ A B C♯ D E F♯',
  Gb: 'G♭ A♭ B𝄫 C♭ D♭ E𝄫 F♭ G♭',
  G: 'G A B♭ C D E♭ F G',
  'G#': 'G♯ A♯ B C♯ D♯ E F♯ G♯',
  Ab: 'A♭ B♭ C♭ D♭ E♭ F♭ G♭ A♭',
  A: 'A B C D E F G A',
  'A#': 'A♯ B♯ C♯ D♯ E♯ F♯ G♯ A♯',
  Bb: 'B♭ C D♭ E♭ F G♭ A♭ B♭',
  B: 'B C♯ D E F♯ G A B',
};
for (const tonic of experimentTonics) {
  test(`${tonic} major and natural minor preserve their written key`, () => {
    expect(names(tonic, 'Major')).toEqual(majorKeys[tonic].split(' '));
    expect(names(tonic, 'Natural minor')).toEqual(minorKeys[tonic].split(' '));
  });
}

const cExamples = [
  ['Major', 'C D E F G A B C', 'до ре ми фа соль ля си до'],
  [
    'Natural minor',
    'C D E♭ F G A♭ B♭ C',
    'до ре ми-бемоль фа соль ля-бемоль си-бемоль до',
  ],
  [
    'Harmonic minor',
    'C D E♭ F G A♭ B C',
    'до ре ми-бемоль фа соль ля-бемоль си до',
  ],
  [
    'Melodic minor (ascending)',
    'C D E♭ F G A B C',
    'до ре ми-бемоль фа соль ля си до',
  ],
  [
    'Melodic minor (descending)',
    'C B♭ A♭ G F E♭ D C',
    'до си-бемоль ля-бемоль соль фа ми-бемоль ре до',
  ],
  ['Dorian', 'C D E♭ F G A B♭ C', 'до ре ми-бемоль фа соль ля си-бемоль до'],
  ['Mixolydian', 'C D E F G A B♭ C', 'до ре ми фа соль ля си-бемоль до'],
  ['Major pentatonic', 'C D E G A C', 'до ре ми соль ля до'],
  ['Minor pentatonic', 'C E♭ F G B♭ C', 'до ми-бемоль фа соль си-бемоль до'],
  [
    'Blues (12-TET)',
    'C E♭ F G♭ G B♭ C',
    'до ми-бемоль фа соль-бемоль соль си-бемоль до',
  ],
];
test.each(cExamples)(
  '%s uses the appropriate degrees in both languages',
  (name, en, ru) => {
    expect(names('C', name)).toEqual(en.split(' '));
    expect(names('C', name, 'ru')).toEqual(ru.split(' '));
  },
);

test('Harmonic and melodic alterations keep degree letters in every tonic', () => {
  for (const tonic of experimentTonics) {
    const natural = spellPattern(tonic, scale('Natural minor'));
    const harmonic = spellPattern(tonic, scale('Harmonic minor'));
    const ascending = spellPattern(tonic, scale('Melodic minor (ascending)'));
    const descending = spellPattern(tonic, scale('Melodic minor (descending)'));
    for (let i = 0; i < 8; i++) {
      expect(harmonic[i].letter).toBe(natural[i].letter);
      expect(ascending[i].letter).toBe(natural[i].letter);
      expect(harmonic[i].midi - natural[i].midi).toBe(i === 6 ? 1 : 0);
      expect(ascending[i].midi - natural[i].midi).toBe(
        i === 5 || i === 6 ? 1 : 0,
      );
    }
    expect(descending).toEqual([...natural].reverse());
  }
  expect(names('G#', 'Harmonic minor')).toEqual(
    'G♯ A♯ B C♯ D♯ E F𝄪 G♯'.split(' '),
  );
  expect(names('G#', 'Harmonic minor', 'ru')[6]).toBe('фа-дубль-диез');
  expect(names('Db', 'Natural minor', 'ru')[5]).toBe('си-дубль-бемоль');
});

test('Every experiment note sounds exactly its own step above the tonic', () => {
  for (const tonic of experimentTonics)
    for (const pattern of Object.values(patterns).flat()) {
      const pitches = spellPattern(tonic, pattern);
      const root = spellPattern(tonic, { steps: [0], degrees: [0] })[0];
      for (const [i, pitch] of pitches.entries()) {
        expect(pitch.midi).toBe(root.midi + pattern.steps[i]);
        for (const lang of ['en', 'ru']) {
          expect(pitchLabel(pitch, lang)).not.toContain('undefined');
          expect(pitchLabel(pitch, lang)).toContain(pitchName(pitch, lang));
        }
      }
      if (pitches.length === 8)
        expect(new Set(pitches.slice(0, 7).map((p) => p.letter)).size).toBe(7);
    }
});

test('The written spelling stays put while the tuning changes the sound', () => {
  // spellPattern takes no tuning, which is the point: the same written E♭
  // sounds at different frequencies under different maps and references.
  const third = spellPattern('C', scale('Natural minor'))[2];
  expect(pitchName(third, 'en')).toBe('E♭');
  expect(pitchName(third, 'ru')).toBe('ми-бемоль');

  const equal = frequencyForMidi(third.midi, 440, 'equal');
  expect(frequencyForMidi(third.midi, 440, 'just')).not.toBe(equal);
  expect(frequencyForMidi(third.midi, 440, 'pythagorean')).not.toBe(equal);
  expect(frequencyForMidi(third.midi, 432, 'equal')).toBeLessThan(equal);
});

test('Written octaves follow the letter across enharmonic C/B boundaries', () => {
  const bSharp = spellPattern('B#', { steps: [0, 1], degrees: [0, 1] });
  expect(bSharp.map((p) => pitchLabel(p, 'en'))).toEqual(['B♯4', 'C♯5']);
  expect(bSharp.map((p) => p.midi)).toEqual([72, 73]);
  const cFlat = spellPattern('Cb', scale('Major'));
  expect(cFlat.map((p) => pitchLabel(p, 'en'))).toEqual([
    'C♭4',
    'D♭4',
    'E♭4',
    'F♭4',
    'G♭4',
    'A♭4',
    'B♭4',
    'C♭5',
  ]);
  expect(pitchLabel(cFlat[0], 'ru')).toBe('до-бемоль, первая октава');
  expect(octaveName(cFlat.at(-1), 'ru')).toBe('вторая октава');
  expect(octaveName(cFlat[0], 'en')).toBe('octave 4');
  expect(spellPattern('C', { steps: [0], degrees: [0] }, 0)[0].midi).toBe(12);
  expect(spellPattern('C', { steps: [0], degrees: [0] }, 8)[0].midi).toBe(108);
});

test('Scale titles use professional local key names and preserve mode names', () => {
  const c = spellPattern('C', { steps: [0], degrees: [0] })[0];
  expect(scaleName(c, scale('Natural minor'), 'en')).toBe('C minor — natural');
  expect(scaleName(c, scale('Natural minor'), 'ru')).toBe(
    'до минор — натуральный',
  );
  expect(scaleName(c, scale('Dorian'), 'en')).toBe('C Dorian');
  expect(scaleName(c, scale('Dorian'), 'ru')).toBe('Дорийский лад от до');
});

test('Intervals and chords use their own degree spellings', () => {
  expect(
    spellPattern('C', patterns.intervals[0]).map((p) => pitchName(p, 'en')),
  ).toEqual(['C', 'D♭']);
  expect(
    spellPattern('C', patterns.intervals[5]).map((p) => pitchName(p, 'en')),
  ).toEqual(['C', 'F♯']);
  const expected = [
    'C E G',
    'C E♭ G',
    'C E♭ G♭',
    'C E G♯',
    'C E G B♭',
    'C E G B',
    'C E♭ G B♭',
  ];
  patterns.chords.forEach((p, i) =>
    expect(spellPattern('C', p).map((n) => pitchName(n, 'en'))).toEqual(
      expected[i].split(' '),
    ),
  );
});

test('Malformed or unsupported notation fails explicitly', () => {
  const one = { steps: [0], degrees: [0] };
  for (const tonic of ['', 'H', 'c', 'C##', 'C#4', 'Db ', 'C♯'])
    expect(() => spellPattern(tonic, one)).toThrow(RangeError);
  for (const octave of [-1, 9, 4.5, NaN, Infinity])
    expect(() => spellPattern('C', one, octave)).toThrow(RangeError);
  for (const bad of [
    { steps: [], degrees: [] },
    { steps: [0], degrees: [] },
    ...[-1, 13, 0.5, NaN, Infinity].map((n) => ({ steps: [n], degrees: [0] })),
    ...[-1, 8, 0.5, NaN, Infinity].map((n) => ({ steps: [0], degrees: [n] })),
    { steps: [3], degrees: [0] },
    { steps: [0], degrees: [2] },
  ])
    expect(() => spellPattern('C', bad)).toThrow(RangeError);
  expect(() => spellPattern('B', scale('Major'), 8)).toThrow(RangeError);
});
