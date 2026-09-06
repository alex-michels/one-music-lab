import { describe, expect, test } from 'vitest';
import {
  appliedDominant,
  chordNotes,
  chordQualities,
  chordSymbol,
  commonToneNames,
  keyName,
  keyPitch,
  keyTonics,
  MAX_CHORDS,
  paletteChord,
  planProgression,
  progressionTemplates,
  romanNumeral,
  templateGroups,
  templateSources,
  validateChord,
} from '../lib/chords.ts';
import { pitchLabel, pitchName } from '../lib/notation.ts';

const C = { tonic: 0, mode: 'major' };
const chord = (quality = 'major', extra = {}) => ({
  degree: 0,
  quality,
  inversion: 0,
  beats: 4,
  ...extra,
});
const names = (key, c) => chordNotes(key, c).map((p) => pitchName(p, 'en'));

test('C-root chords retain their interval spelling, including ninths and diminished sevenths', () => {
  const expected = {
    major: ['C', 'E', 'G'],
    minor: ['C', 'E♭', 'G'],
    diminished: ['C', 'E♭', 'G♭'],
    augmented: ['C', 'E', 'G♯'],
    sus2: ['C', 'D', 'G'],
    sus4: ['C', 'F', 'G'],
    seventh: ['C', 'E', 'G', 'B♭'],
    maj7: ['C', 'E', 'G', 'B'],
    min7: ['C', 'E♭', 'G', 'B♭'],
    halfDim7: ['C', 'E♭', 'G♭', 'B♭'],
    dim7: ['C', 'E♭', 'G♭', 'B𝄫'],
    minMaj7: ['C', 'E♭', 'G', 'B'],
    add9: ['C', 'E', 'G', 'D'],
    ninth: ['C', 'E', 'G', 'B♭', 'D'],
    maj9: ['C', 'E', 'G', 'B', 'D'],
    min9: ['C', 'E♭', 'G', 'B♭', 'D'],
  };
  for (const [quality, pitches] of Object.entries(expected))
    expect(names(C, chord(quality))).toEqual(pitches);
  expect(chordNotes(C, chord('add9')).map((p) => p.midi)).toEqual([
    48, 52, 55, 62,
  ]);
  expect(chordNotes(C, chord('minor')).map((p) => pitchName(p, 'ru'))).toEqual([
    'до',
    'ми-бемоль',
    'соль',
  ]);
});

test('Transposition preserves scale degrees, key spelling, and the raised leading tone of minor V7', () => {
  const Dflat = { tonic: 1, mode: 'major' };
  expect(names(Dflat, chord())).toEqual(['D♭', 'F', 'A♭']);
  expect(names({ tonic: 6, mode: 'major' }, chord())).toEqual([
    'F♯',
    'A♯',
    'C♯',
  ]);
  expect(
    names({ tonic: 0, mode: 'minor' }, chord('seventh', { degree: 4 })),
  ).toEqual(['G', 'B', 'D', 'F']);
  expect(
    names({ tonic: 0, mode: 'minor' }, paletteChord('minor', 4, true)),
  ).toEqual(['G', 'B♭', 'D', 'F']);
  expect(keyName(C, 'en')).toBe('C major');
  expect(keyName(C, 'ru')).toBe('до мажор');
  expect(keyName({ tonic: 0, mode: 'minor' }, 'ru')).toBe('до минор');
  expect(keyName({ tonic: 1, mode: 'minor' }, 'en')).toBe('C♯ minor');
});

test('Bass rotation retains the root and scientific octaves across B/C and compound intervals', () => {
  expect(
    chordNotes(C, chord('major', { inversion: 1 })).map((p) =>
      pitchLabel(p, 'en'),
    ),
  ).toEqual(['E3', 'G3', 'C4']);
  expect(chordSymbol(C, chord('major', { inversion: 2 }))).toBe('C/G');
  expect(
    chordNotes(
      { tonic: 11, mode: 'major' },
      chord('major', { inversion: 2 }),
    ).map((p) => pitchLabel(p, 'en')),
  ).toEqual(['F♯4', 'B4', 'D♯5']);
  expect(
    chordNotes(C, chord('ninth', { inversion: 4 })).map((p) => p.midi),
  ).toEqual([62, 72, 76, 79, 82]);
  expect(chordSymbol(C, chord('ninth', { inversion: 4 }))).toBe('C9/D');
});

test('Every available key, degree, chord quality and bass is spellable and playable without aliases', () => {
  for (const mode of ['major', 'minor'])
    for (let tonic = 0; tonic < 12; tonic++)
      for (let degree = 0; degree < 7; degree++)
        for (const quality of Object.keys(chordQualities)) {
          const key = { tonic, mode };
          const root = chordNotes(key, chord(quality, { degree }))[0];
          for (
            let inversion = 0;
            inversion < chordQualities[quality].steps.length;
            inversion++
          ) {
            const notes = chordNotes(
              key,
              chord(quality, { degree, inversion }),
            );
            expect(
              notes.every(
                (n, i) =>
                  n.midi >= 24 &&
                  n.midi <= 108 &&
                  Math.abs(n.accidental) <= 2 &&
                  (i === 0 || n.midi > notes[i - 1].midi),
              ),
            ).toBe(true);
            expect(new Set(notes.map((n) => n.midi % 12)).size).toBe(
              notes.length,
            );
            expect(
              notes.some(
                (n) =>
                  n.letter === root.letter && n.accidental === root.accidental,
              ),
            ).toBe(true);
            for (const lang of ['en', 'ru'])
              expect(
                notes.every((p) => !pitchLabel(p, lang).includes('undefined')),
              ).toBe(true);
          }
        }
  expect(keyTonics.major).toHaveLength(12);
});

test('Diatonic palettes and Roman numerals distinguish type, scale reference and extensions', () => {
  expect(
    Array.from({ length: 7 }, (_, degree) =>
      romanNumeral(C, paletteChord('major', degree)),
    ),
  ).toEqual(['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']);
  expect(
    Array.from({ length: 7 }, (_, degree) =>
      romanNumeral(C, paletteChord('major', degree, true)),
    ),
  ).toEqual(['Imaj7', 'ii7', 'iii7', 'IVmaj7', 'V7', 'vi7', 'viiø7']);
  const minor = { ...C, mode: 'minor' };
  expect(
    Array.from({ length: 7 }, (_, degree) =>
      romanNumeral(minor, paletteChord('minor', degree)),
    ),
  ).toEqual(['i', 'ii°', '♭III', 'iv', 'v', '♭VI', '♭VII']);
  expect(
    Array.from({ length: 7 }, (_, degree) =>
      chordSymbol(minor, paletteChord('minor', degree, true)),
    ),
  ).toEqual(['Cm7', 'Dm7♭5', 'E♭maj7', 'Fm7', 'Gm7', 'A♭maj7', 'B♭7']);
  expect(romanNumeral(C, chord('dim7'))).toBe('i°7');
  expect(romanNumeral(C, chord('min9'))).toBe('i9');
  expect(romanNumeral(C, chord('minMaj7'))).toBe('i(maj7)');
  expect(
    commonToneNames(C, chord(), chord('minor', { degree: 5 }), 'en'),
  ).toEqual(['C', 'E']);
  expect(
    commonToneNames(C, chord(), chord('minor', { degree: 1 }), 'ru'),
  ).toEqual([]);
});

// Written from the readings, not from lib/chords.ts: the chord symbols each
// template must produce in C major or C minor, and the Roman numerals the
// picker advertises. A wrong degree, quality or order fails here.
const expectedTemplates = {
  blank: ['C'],
  authentic: ['C', 'F', 'G7', 'C'],
  half: ['C', 'Am', 'Dm', 'G'],
  deceptive: ['C', 'F', 'G7', 'Am'],
  plagal: ['C', 'G', 'C', 'F', 'C'],
  minorDominant: ['Cm', 'Fm', 'G7', 'Cm'],
  lament: ['Cm', 'B♭', 'A♭', 'G'],
  circleFifths: ['Em', 'Am', 'Dm', 'G', 'C'],
  singerSongwriter: ['C', 'G', 'Am', 'F'],
  singerSongwriterMinor: ['Am', 'F', 'C', 'G'],
  dooWop: ['C', 'Am', 'F', 'G'],
  dooWopTwo: ['C', 'Am', 'Dm', 'G'],
  hopscotch: ['F', 'G', 'Am', 'C'],
  jazzTwoFive: ['Dm7', 'G7', 'Cmaj7'],
  jazzMinorTwoFive: ['Dm7♭5', 'G7', 'Cm(maj7)'],
  turnaround: ['Em7', 'Am7', 'Dm7', 'G7'],
  blues: [
    'C7',
    'C7',
    'C7',
    'C7',
    'F7',
    'F7',
    'C7',
    'C7',
    'G7',
    'F7',
    'C7',
    'C7',
  ],
  bluesQuickChange: [
    'C7',
    'F7',
    'C7',
    'C7',
    'F7',
    'F7',
    'C7',
    'C7',
    'G7',
    'F7',
    'C7',
    'G7',
  ],
  minorBlues: [
    'Cm7',
    'Cm7',
    'Cm7',
    'Cm7',
    'Fm7',
    'Fm7',
    'Cm7',
    'Cm7',
    'Dm7♭5',
    'G7',
    'Cm7',
    'Cm7',
  ],
  jazzBlues: [
    'C7',
    'F7',
    'C7',
    'C7',
    'F7',
    'F7',
    'C7',
    'A7',
    'Dm7',
    'G7',
    'C7',
    'A7',
  ],
  borrowedFour: ['C', 'F', 'Fm', 'C'],
  appliedDominant: ['C', 'D7', 'G', 'C'],
};
const expectedNumerals = {
  half: ['I', 'vi', 'ii', 'V'],
  lament: ['i', '♭VII', '♭VI', 'V'],
  circleFifths: ['iii', 'vi', 'ii', 'V', 'I'],
  hopscotch: ['IV', 'V', 'vi', 'I'],
  jazzMinorTwoFive: ['iiø7', 'V7', 'i(maj7)'],
  minorBlues: [
    'i7',
    'i7',
    'i7',
    'i7',
    'iv7',
    'iv7',
    'i7',
    'i7',
    'iiø7',
    'V7',
    'i7',
    'i7',
  ],
  borrowedFour: ['I', 'IV', 'iv', 'I'],
};

test('Every template spells the progression its name and Roman numerals claim', () => {
  expect(new Set(progressionTemplates.map((p) => p.id)).size).toBe(
    progressionTemplates.length,
  );
  expect(
    Object.keys(expectedTemplates).sort((a, b) => a.localeCompare(b)),
  ).toEqual(
    progressionTemplates.map((p) => p.id).sort((a, b) => a.localeCompare(b)),
  );
  for (const template of progressionTemplates) {
    const key = { ...C, mode: template.mode };
    expect(
      template.steps.map((c) => chordSymbol(key, c)),
      template.id,
    ).toEqual(expectedTemplates[template.id]);
    if (expectedNumerals[template.id])
      expect(
        template.steps.map((c) => romanNumeral(key, c)),
        template.id,
      ).toEqual(expectedNumerals[template.id]);
  }
});

test('Every template is playable inside the editor and audio bounds it declares', () => {
  const groups = new Set(templateGroups.map((g) => g.id));
  const used = new Set();
  for (const template of progressionTemplates) {
    const key = { ...C, mode: template.mode };
    expect(groups.has(template.group), template.id).toBe(true);
    used.add(template.group);
    expect(Object.hasOwn(templateSources, template.source), template.id).toBe(
      true,
    );
    expect(template.steps.length).toBeGreaterThan(0);
    expect(template.steps.length).toBeLessThanOrEqual(MAX_CHORDS);
    for (const chord of template.steps) validateChord(chord);
    // Four passes is the most the transport offers, and the planner refuses
    // anything over three minutes: no template may be unplayable as loaded.
    const plan = planProgression(
      key,
      template.steps,
      template.tempo,
      template.texture,
      4,
    );
    expect(plan.duration).toBeLessThanOrEqual(180);
    expect(plan.starts).toHaveLength(template.steps.length * 4);
    expect(
      planProgression(key, template.steps, template.tempo, template.texture, 1)
        .duration,
    ).toBeCloseTo(
      (template.steps.reduce((sum, c) => sum + c.beats, 0) * 60) /
        template.tempo,
    );
    for (const lang of ['en', 'ru']) {
      expect(template[lang].length, template.id).toBeGreaterThan(3);
      expect(template.note[lang].length, template.id).toBeGreaterThan(40);
    }
    expect(template.en, template.id).not.toBe(template.ru);
    expect(template.note.en, template.id).not.toBe(template.note.ru);
    expect(template.pattern, template.id).toMatch(/[IiVv]/);
    // Transposition must not break a template in any offered key.
    for (let tonic = 0; tonic < 12; tonic++)
      for (const chord of template.steps)
        expect(() =>
          chordSymbol({ tonic, mode: template.mode }, chord),
        ).not.toThrow();
  }
  expect([...used].sort((a, b) => a.localeCompare(b))).toEqual(
    templateGroups.map((g) => g.id).sort((a, b) => a.localeCompare(b)),
  );
  for (const source of Object.values(templateSources))
    expect(source.href).toMatch(/^https:\/\//);
});

test('The twelve-bar forms are twelve bars of four beats, not twelve beats', () => {
  for (const id of ['blues', 'bluesQuickChange', 'minorBlues', 'jazzBlues']) {
    const template = progressionTemplates.find((p) => p.id === id);
    expect(template.steps, id).toHaveLength(12);
    expect(
      template.steps.reduce((sum, c) => sum + c.beats, 0),
      id,
    ).toBe(48);
  }
});

test('An applied dominant is labelled only when the next chord proves it', () => {
  const dominantOfFive = chord('seventh', { degree: 1 });
  const five = chord('major', { degree: 4 });
  expect(appliedDominant(C, dominantOfFive, five)).toBe('V7/V');
  // Same chord, unproven: nothing follows it, or what follows is not a fifth below.
  expect(appliedDominant(C, dominantOfFive, undefined)).toBeNull();
  expect(appliedDominant(C, dominantOfFive, chord())).toBeNull();
  // A triad works too, and the target keeps its own case but loses extensions.
  expect(
    appliedDominant(
      C,
      chord('major', { degree: 5 }),
      chord('min7', { degree: 1 }),
    ),
  ).toBe('V/ii');
  expect(
    appliedDominant(
      C,
      chord('seventh', { degree: 5 }),
      chord('min7', { degree: 1 }),
    ),
  ).toBe('V7/ii');
  expect(
    appliedDominant(
      C,
      chord('seventh', { degree: 2 }),
      chord('minor', { degree: 5 }),
    ),
  ).toBe('V7/vi');
  // The key's own dominant is never an applied dominant, in either mode.
  expect(appliedDominant(C, five, chord())).toBeNull();
  const Cm = { tonic: 0, mode: 'minor' };
  expect(
    appliedDominant(Cm, chord('seventh', { degree: 4 }), chord('minor')),
  ).toBeNull();
  // Blues I7 to IV7: the scale triad on that degree is already major, so the
  // lab declines to call it applied. ♭VII in minor is diatonic for the same reason.
  expect(
    appliedDominant(C, chord('seventh'), chord('seventh', { degree: 3 })),
  ).toBeNull();
  expect(
    appliedDominant(
      Cm,
      chord('major', { degree: 6 }),
      chord('major', { degree: 2 }),
    ),
  ).toBeNull();
  // A minor or suspended chord is never a dominant, whatever follows it.
  for (const quality of ['min7', 'sus4', 'diminished', 'halfDim7'])
    expect(appliedDominant(C, chord(quality, { degree: 1 }), five)).toBeNull();
  // In minor a major tonic pointing at iv is an applied dominant of iv.
  expect(
    appliedDominant(Cm, chord('seventh'), chord('minor', { degree: 3 })),
  ).toBe('V7/iv');
  for (const bad of [{ degree: 7 }, { beats: 0 }])
    expect(() => appliedDominant(C, chord('major', bad), five)).toThrow(
      RangeError,
    );
  expect(() =>
    appliedDominant(C, dominantOfFive, chord('major', { degree: -1 })),
  ).toThrow(RangeError);
});

test('Playback planning respects beats, fractional tempo, repetitions and exact texture onsets', () => {
  const phrase = [
    chord('major', { beats: 2 }),
    chord('seventh', { degree: 4, beats: 1 }),
  ];
  const held = planProgression(C, phrase, 120, 'held', 2);
  expect(held.starts).toEqual([0, 1, 1.5, 2.5]);
  expect(held.duration).toBe(3);
  expect(
    held.events.slice(0, 3).map((e) => [e.midi, e.at, e.duration]),
  ).toEqual([
    [48, 0, 0.9],
    [52, 0, 0.9],
    [55, 0, 0.9],
  ]);
  const pulse = planProgression(
    C,
    [chord('major', { beats: 2 })],
    120,
    'pulse',
    1,
  );
  expect(pulse.events.map((e) => e.at)).toEqual([0, 0, 0, 0.5, 0.5, 0.5]);
  const arp = planProgression(
    C,
    [chord('major', { beats: 2 })],
    120,
    'arpeggio',
    1,
  );
  expect(arp.events.map((e) => [e.midi, e.at])).toEqual([
    [48, 0],
    [52, 0.25],
    [55, 0.5],
    [48, 0.75],
  ]);
  expect(planProgression(C, [chord()], 84.5, 'held', 1).duration).toBeCloseTo(
    240 / 84.5,
  );
  expect(
    planProgression(
      C,
      Array.from({ length: 15 }, () => chord('major', { beats: 8 })),
      40,
      'held',
      1,
    ).duration,
  ).toBe(180);
  expect(
    planProgression(
      C,
      Array.from({ length: 16 }, () => chord('major', { beats: 1 })),
      200,
      'held',
      4,
    ).starts,
  ).toHaveLength(64);
});

describe('Invalid inputs never create a phrase', () => {
  test('invalid keys, degrees, qualities, bass indices and beats', () => {
    for (const bad of [
      { tonic: -1, mode: 'major' },
      { tonic: 12, mode: 'major' },
      { tonic: 0.5, mode: 'major' },
      { tonic: NaN, mode: 'major' },
      { tonic: 0, mode: 'toString' },
    ])
      expect(() => keyPitch(bad)).toThrow(RangeError);
    for (const change of [
      { quality: 'toString' },
      { degree: -1 },
      { degree: 7 },
      { degree: 0.2 },
      { beats: 0 },
      { beats: 9 },
      { beats: NaN },
      { beats: 1.5 },
      { inversion: -1 },
      { inversion: 3 },
      { inversion: 0.5 },
    ])
      expect(() => chordNotes(C, chord('major', change))).toThrow(RangeError);
    for (const degree of [-1, 7, NaN, 0.1])
      expect(() => paletteChord('major', degree)).toThrow(RangeError);
    expect(() => paletteChord('toString', 0)).toThrow(RangeError);
  });
  test('tempo, repeat count, texture, empty/oversized/too-long phrases', () => {
    for (const tempo of [NaN, Infinity, 39.9, 200.1])
      expect(() => planProgression(C, [chord()], tempo, 'held', 1)).toThrow(
        RangeError,
      );
    for (const repeats of [0, 5, 0.5, NaN])
      expect(() => planProgression(C, [chord()], 80, 'held', repeats)).toThrow(
        RangeError,
      );
    expect(() => planProgression(C, [chord()], 80, 'swing', 1)).toThrow(
      RangeError,
    );
    for (const size of [0, 17])
      expect(() =>
        planProgression(
          C,
          Array.from({ length: size }, () => chord()),
          80,
          'held',
          1,
        ),
      ).toThrow(RangeError);
    expect(() =>
      planProgression(
        C,
        Array.from({ length: 16 }, () => chord('major', { beats: 8 })),
        40,
        'held',
        1,
      ),
    ).toThrow('180 seconds');
  });
});
