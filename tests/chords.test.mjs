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
  clampChord,
  fitsScale,
  fitToScale,
  MAX_MIDI,
  MIN_MIDI,
  OCTAVES,
  octaveRange,
  paletteChord,
  planProgression,
  progressionTemplates,
  romanNumeral,
  templateGroups,
  templateSources,
  textures,
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

test('Editorial examples match the played lament descent and minor-dominant substitution', () => {
  const minor = { ...C, mode: 'minor' };
  const lament = progressionTemplates.find((t) => t.id === 'lament');
  expect(lament.steps.map((c) => names(minor, c)[0])).toEqual([
    'C',
    'B♭',
    'A♭',
    'G',
  ]);
  const dominant = progressionTemplates.find((t) => t.id === 'minorDominant')
    .steps[2];
  for (const [lang, before, after] of [
    ['en', ['G', 'B', 'D', 'F'], ['G', 'B♭', 'D', 'F']],
    ['ru', ['соль', 'си', 'ре', 'фа'], ['соль', 'си-бемоль', 'ре', 'фа']],
    ['de', ['G', 'H', 'D', 'F'], ['G', 'B', 'D', 'F']],
  ]) {
    const label = (c) => chordNotes(minor, c).map((p) => pitchName(p, lang));
    expect(label(dominant)).toEqual(before);
    expect(label({ ...dominant, quality: 'min7' })).toEqual(after);
  }
  const half = progressionTemplates.find((t) => t.id === 'half');
  const authentic = progressionTemplates.find((t) => t.id === 'authentic');
  expect(names(C, half.steps.at(-1))).toEqual(['G', 'B', 'D']);
  expect(names(C, authentic.steps.at(-1))).toEqual(['C', 'E', 'G']);
});

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

test('A chord carries its own register, and the register never changes its spelling', () => {
  const triad = chord();
  expect(chordNotes(C, triad).map((p) => p.midi)).toEqual([48, 52, 55]);
  expect(chordNotes(C, { ...triad, octave: 4 }).map((p) => p.midi)).toEqual([
    60, 64, 67,
  ]);
  expect(chordNotes(C, { ...triad, octave: 1 }).map((p) => p.midi)).toEqual([
    24, 28, 31,
  ]);
  // A written pitch is a written pitch: only the octave number moves with it.
  expect(names(C, { ...triad, octave: 5 })).toEqual(['C', 'E', 'G']);
  expect(
    chordNotes(C, { ...triad, octave: 5 }).map((p) => pitchLabel(p, 'en')),
  ).toEqual(['C5', 'E5', 'G5']);
  expect(chordSymbol(C, { ...triad, octave: 6 })).toBe('C');
  expect(romanNumeral(C, { ...triad, octave: 6 })).toBe('I');

  // One card moves; its neighbours do not.
  const phrase = [chord(), { ...chord('minor', { degree: 5 }), octave: 2 }];
  expect(phrase.map((c) => chordNotes(C, c)[0].midi)).toEqual([48, 45]);

  // Cross-chord comparisons are pitch-class based, so they survive the move.
  expect(commonToneNames(C, phrase[0], phrase[1], 'en')).toEqual(['C', 'E']);
  expect(
    appliedDominant(
      C,
      { ...chord('seventh', { degree: 1 }), octave: 5 },
      { ...chord('major', { degree: 4 }), octave: 1 },
    ),
  ).toBe('V7/V');

  for (const bad of [0, 7, 3.5, NaN, Infinity, -1])
    expect(() => chordNotes(C, { ...triad, octave: bad })).toThrow(RangeError);
});

test('A register left on the key is refused rather than quietly ignored', () => {
  // These are plain-JavaScript tests, so no compiler catches a stale call site.
  // The register used to live on the key; a caller that still sets it there
  // must fail where it is wrong instead of playing at the default register.
  const triad = chord();
  for (const octave of [3, 4, undefined])
    expect(() => chordNotes({ ...C, octave }, triad)).toThrow(RangeError);
  expect(() => keyPitch({ ...C, octave: 3 })).toThrow(RangeError);
  expect(() => keyName({ ...C, octave: 3 }, 'en')).toThrow(RangeError);
  expect(keyName(C, 'ru')).toBe('до мажор');
});

test('The offered registers are exactly those that keep the chord playable', () => {
  expect(octaveRange(C, chord())).toEqual({
    min: OCTAVES.min,
    max: OCTAVES.max,
  });
  // A ninth chord in its highest bass position already reaches near the top of
  // the keyboard, so it cannot be raised at all — which is the whole reason
  // the register belongs to the chord rather than to the phrase.
  const B = { tonic: 11, mode: 'major' };
  const tall = { degree: 6, quality: 'maj9', inversion: 4, beats: 4 };
  expect(Math.max(...chordNotes(B, tall).map((p) => p.midi))).toBe(105);
  expect(octaveRange(B, tall).max).toBe(3);
  // A tall chord no longer limits its neighbours: that coupling is gone.
  expect(octaveRange(B, chord()).max).toBe(OCTAVES.max);

  // The range is a property of the chord, not of where it currently sits, so
  // asking from any register gives the same answer. Without this, an
  // implementation that wrongly re-anchors on the current octave would pass
  // every other assertion here.
  for (let octave = OCTAVES.min; octave <= OCTAVES.max; octave++)
    expect(octaveRange(B, { ...tall, octave })).toEqual(octaveRange(B, tall));

  // The range is right rather than merely safe: every octave inside it plays,
  // and the octave just outside it would not.
  for (const mode of ['major', 'minor'])
    for (let tonic = 0; tonic < 12; tonic++)
      for (let degree = 0; degree < 7; degree++)
        for (const quality of Object.keys(chordQualities)) {
          const key = { tonic, mode };
          const step = {
            degree,
            quality,
            inversion: chordQualities[quality].steps.length - 1,
            beats: 4,
          };
          const range = octaveRange(key, step);
          const where = `${mode} ${tonic} ${degree} ${quality}`;
          expect(range.min, where).toBeLessThanOrEqual(range.max);
          for (let octave = range.min; octave <= range.max; octave++) {
            const midi = chordNotes(key, { ...step, octave }).map(
              (p) => p.midi,
            );
            expect(Math.min(...midi), where).toBeGreaterThanOrEqual(MIN_MIDI);
            expect(Math.max(...midi), where).toBeLessThanOrEqual(MAX_MIDI);
            // Russian names only exist for written octaves 0-8, so the range
            // is load-bearing for the localization, not only for the audio.
            for (const pitch of chordNotes(key, { ...step, octave }))
              for (const language of ['en', 'ru'])
                expect(pitchLabel(pitch, language), where).not.toContain(
                  'undefined',
                );
          }
          if (range.max < OCTAVES.max)
            expect(
              Math.max(
                ...chordNotes(key, { ...step, octave: range.max + 1 }).map(
                  (p) => p.midi,
                ),
              ),
              where,
            ).toBeGreaterThan(MAX_MIDI);
          if (range.min > OCTAVES.min)
            expect(
              Math.min(
                ...chordNotes(key, { ...step, octave: range.min - 1 }).map(
                  (p) => p.midi,
                ),
              ),
              where,
            ).toBeLessThan(MIN_MIDI);
        }
});

test('An edit that shrinks a chord’s room pulls its register back into range', () => {
  // The bug this exists to prevent: park a chord at a register that fits, then
  // change something that has nothing to do with the register, and the chord
  // is left off the keyboard until Play fails with an error about the browser.
  const wide = {
    degree: 6,
    quality: 'maj9',
    inversion: 4,
    beats: 4,
    octave: 6,
  };
  expect(() => validateChord(wide)).not.toThrow();
  expect(Math.max(...chordNotes(C, wide).map((p) => p.midi))).toBeGreaterThan(
    MAX_MIDI,
  );
  const fixed = clampChord(C, wide);
  expect(fixed.octave).toBe(octaveRange(C, wide).max);
  expect(
    Math.max(...chordNotes(C, fixed).map((p) => p.midi)),
  ).toBeLessThanOrEqual(MAX_MIDI);

  // Transposition is the same hazard: this is the smallest real case, a chord
  // the control permits at octave 6 in C that no longer fits in D.
  const edge = {
    degree: 6,
    quality: 'add9',
    inversion: 0,
    beats: 4,
    octave: 6,
  };
  const D = { tonic: 2, mode: 'major' };
  expect(Math.max(...chordNotes(D, edge).map((p) => p.midi))).toBe(111);
  expect(clampChord(D, edge).octave).toBe(5);

  // A chord already in range is returned unchanged, identity included, so the
  // clamp can be applied on every edit without churning the draft.
  const fine = chord();
  expect(clampChord(C, fine)).toBe(fine);

  // Clamping is idempotent and always lands inside the offered band.
  for (const mode of ['major', 'minor'])
    for (let tonic = 0; tonic < 12; tonic++)
      for (let degree = 0; degree < 7; degree++)
        for (const quality of Object.keys(chordQualities))
          for (let octave = OCTAVES.min; octave <= OCTAVES.max; octave++) {
            const key = { tonic, mode };
            const step = {
              degree,
              quality,
              inversion: chordQualities[quality].steps.length - 1,
              beats: 4,
              octave,
            };
            const once = clampChord(key, step);
            const where = `${mode} ${tonic} ${degree} ${quality} @${octave}`;
            expect(clampChord(key, once), where).toEqual(once);
            const midi = chordNotes(key, once).map((p) => p.midi);
            expect(Math.min(...midi), where).toBeGreaterThanOrEqual(MIN_MIDI);
            expect(Math.max(...midi), where).toBeLessThanOrEqual(MAX_MIDI);
          }
});

test('A phrase carrying a chord off the keyboard is refused by name', () => {
  const off = { degree: 6, quality: 'maj9', inversion: 4, beats: 4, octave: 6 };
  expect(() => planProgression(C, [chord(), off], 120, 'held', 1)).toThrow(
    /outside the keyboard/,
  );
  // Naming the chord is the point: the player's own error blames the browser.
  expect(() => planProgression(C, [chord(), off], 120, 'held', 1)).toThrow(
    /Bmaj9/,
  );
  expect(() =>
    planProgression(C, [chord(), clampChord(C, off)], 120, 'held', 1),
  ).not.toThrow();
});

test('Each accompaniment figure places the voices its name describes', () => {
  const two = [chord('major', { beats: 2 })];
  const plan = (texture) => planProgression(C, two, 120, texture, 1);
  const shape = (texture) =>
    plan(texture).events.map((e) => [e.midi, e.at, e.level]);
  const third = 1 / 3;
  // Held: one event per voice for the whole chord.
  expect(shape('held')).toEqual([
    [48, 0, third],
    [52, 0, third],
    [55, 0, third],
  ]);
  // Repeated block chords, in quarters and in eighths.
  expect(plan('pulse').events.map((e) => e.at)).toEqual([
    0, 0, 0, 0.5, 0.5, 0.5,
  ]);
  expect(plan('eighths').events.map((e) => e.at)).toEqual([
    0, 0, 0, 0.25, 0.25, 0.25, 0.5, 0.5, 0.5, 0.75, 0.75, 0.75,
  ]);
  // Arpeggios: one voice at a time, and a lone voice is not made quiet.
  expect(shape('arpeggio')).toEqual([
    [48, 0, 1],
    [52, 0.25, 1],
    [55, 0.5, 1],
    [48, 0.75, 1],
  ]);
  expect(shape('arpeggioDown').map(([midi]) => midi)).toEqual([55, 52, 48, 55]);
  // Alberti: low, high, middle, high.
  expect(shape('alberti').map(([midi]) => midi)).toEqual([48, 55, 52, 55]);
  // A seventh chord has two middle voices, so the cycle walks through them.
  expect(
    planProgression(
      C,
      [chord('seventh', { beats: 4 })],
      120,
      'alberti',
      1,
    ).events.map((e) => e.midi),
  ).toEqual([48, 58, 52, 58, 48, 58, 55, 58]);
  // Afterbeat: the bass takes the downbeat, the chords answer after it.
  expect(shape('afterbeat')).toEqual([
    [48, 0, 1],
    [48, 0.25, third],
    [52, 0.25, third],
    [55, 0.25, third],
    [48, 0.75, third],
    [52, 0.75, third],
    [55, 0.75, third],
  ]);
  // Offbeat: upbeats only, with no downbeat at all.
  expect(plan('offbeat').events.map((e) => e.at)).toEqual([
    0.25, 0.25, 0.25, 0.75, 0.75, 0.75,
  ]);
  // Every figure marks the chord change at the same moment for the highlight.
  for (const texture of textures)
    expect(plan(texture).starts, texture).toEqual([0]);
  expect(() => planProgression(C, two, 120, 'swing', 1)).toThrow(RangeError);
});

test('Every texture stays inside the audio bounds at the longest phrase allowed', () => {
  // Sixteen chords of eight beats over four passes is the most the transport
  // can ask for. These are the same limits lib/chord-audio.ts enforces before
  // it schedules anything, checked here where every texture can be compared.
  const phrase = Array.from({ length: MAX_CHORDS }, () =>
    chord('maj9', { beats: 8 }),
  );
  for (const texture of textures) {
    const plan = planProgression(C, phrase, 200, texture, 4);
    expect(plan.duration, texture).toBeLessThanOrEqual(180);
    expect(plan.events.length, texture).toBeGreaterThan(0);
    expect(plan.events.length, texture).toBeLessThanOrEqual(5120);
    for (const event of plan.events) {
      expect(event.duration, texture).toBeGreaterThanOrEqual(0.02);
      expect(event.at + event.duration, texture).toBeLessThanOrEqual(
        plan.duration,
      );
      expect(event.level, texture).toBeGreaterThan(0);
      expect(event.level, texture).toBeLessThanOrEqual(1);
      expect(event.midi, texture).toBeGreaterThanOrEqual(MIN_MIDI);
      expect(event.midi, texture).toBeLessThanOrEqual(MAX_MIDI);
    }
  }
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

test('Fitting to the scale re-qualifies each chord and keeps everything else', () => {
  // The case the owner hit: I-IV-V7-I is built on degrees both scales share,
  // so changing the palette scale moves nothing. This is what makes it minor.
  const cadence = progressionTemplates.find((p) => p.id === 'authentic').steps;
  const Cm = { tonic: 0, mode: 'minor' };
  expect(cadence.map((c) => chordSymbol(C, c))).toEqual(['C', 'F', 'G7', 'C']);
  expect(cadence.map((c) => chordSymbol(Cm, c))).toEqual(['C', 'F', 'G7', 'C']);
  expect(fitsScale(C, cadence)).toBe(true);
  expect(fitsScale(Cm, cadence)).toBe(false);
  expect(fitToScale(Cm, cadence).map((c) => chordSymbol(Cm, c))).toEqual([
    'Cm',
    'Fm',
    'Gm7',
    'Cm',
  ]);
  // Everything that is not the chord's type survives: degree, bass, length.
  expect(fitToScale(Cm, cadence).map((c) => [c.degree, c.beats])).toEqual(
    cadence.map((c) => [c.degree, c.beats]),
  );
  // Fitting twice changes nothing more, and a fitted phrase reports as fitted.
  const fitted = fitToScale(Cm, cadence);
  expect(fitsScale(Cm, fitted)).toBe(true);
  expect(fitToScale(Cm, fitted)).toEqual(fitted);

  // Size is preserved rather than the palette's switch: a triad becomes the
  // diatonic triad and a seventh the diatonic seventh.
  expect(
    fitToScale(C, [chord('minor'), chord('maj7', { degree: 4 })]).map((c) =>
      chordSymbol(C, c),
    ),
  ).toEqual(['C', 'G7']);
  // A ninth has no diatonic equivalent here and becomes its degree's seventh.
  expect(
    fitToScale(C, [chord('min9', { degree: 1 })]).map((c) => chordSymbol(C, c)),
  ).toEqual(['Dm7']);

  // Size is preserved, so a four-note chord keeps its bass position too.
  expect(fitToScale(C, [chord('seventh', { inversion: 3 })])[0]).toMatchObject({
    quality: 'maj7',
    inversion: 3,
  });
  // Only a ninth shrinks, and its bass moves to the lowest the seventh has.
  expect(
    fitToScale(C, [chord('min9', { degree: 1, inversion: 4 })])[0],
  ).toMatchObject({ quality: 'min7', inversion: 3 });
  // A chord already of the right type is returned by identity, so an unchanged
  // phrase does not churn the undo history.
  const already = chord();
  expect(fitToScale(C, [already])[0]).toBe(already);

  // The seventh degree of a major scale carries the diminished triad, and a
  // chord parked at the top of its range stays playable after the change.
  const high = {
    degree: 6,
    quality: 'major',
    inversion: 0,
    beats: 4,
    octave: 6,
  };
  const B = { tonic: 11, mode: 'major' };
  expect(fitsScale(B, [high])).toBe(false);
  const fixed = fitToScale(B, [high])[0];
  expect(fixed.quality).toBe('diminished');
  expect(chordSymbol(B, fixed)).toBe('A♯dim');
  expect(
    Math.max(...chordNotes(B, fixed).map((p) => p.midi)),
  ).toBeLessThanOrEqual(MAX_MIDI);

  // Every template, in either scale, fits cleanly and stays playable.
  for (const template of progressionTemplates)
    for (const mode of ['major', 'minor']) {
      const key = { tonic: 0, mode };
      const result = fitToScale(key, template.steps);
      expect(fitsScale(key, result), template.id).toBe(true);
      for (const step of result)
        for (const pitch of chordNotes(key, step)) {
          expect(pitch.midi, template.id).toBeGreaterThanOrEqual(MIN_MIDI);
          expect(pitch.midi, template.id).toBeLessThanOrEqual(MAX_MIDI);
        }
    }
});
