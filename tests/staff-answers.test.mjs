import { test, expect } from 'vitest';
import { parseNoteName } from '../lib/staff-answers.ts';
import { pitchName } from '../lib/notation.ts';
import { generate } from '../lib/exercises.ts';
import { pitchAtStep, staffStep } from '../lib/staff.ts';

test('All 105 localized spellings round-trip without enharmonic substitution', () => {
  for (const lang of ['en', 'ru', 'de'])
    for (let letter = 0; letter < 7; letter++)
      for (let accidental = -2; accidental <= 2; accidental++) {
        const name = pitchName(
          { letter, accidental, octave: 4, midi: 0 },
          lang,
        );
        expect(parseNoteName(` ${name.toUpperCase()} `, lang)).toEqual({
          letter,
          accidental,
        });
      }
  expect(parseNoteName('H', 'de')).toEqual({ letter: 6, accidental: 0 });
  expect(parseNoteName('B', 'de')).toEqual({ letter: 6, accidental: -1 });
  expect(parseNoteName('B', 'en')).toEqual({ letter: 6, accidental: 0 });
  expect(parseNoteName('Eb', 'en')).toEqual({ letter: 2, accidental: -1 });
  expect(parseNoteName('F##', 'en')).toEqual({ letter: 3, accidental: 2 });
  expect(parseNoteName('до диез', 'ru')).toEqual({ letter: 0, accidental: 1 });
  expect(parseNoteName('ми‐бемоль', 'ru')).toEqual({
    letter: 2,
    accidental: -1,
  });
  for (const [name, lang] of [
    ['', 'en'],
    ['H', 'en'],
    ['C###', 'en'],
    ['C#', 'ru'],
    ['до', 'de'],
    ['C4', 'en'],
  ])
    expect(parseNoteName(name, lang)).toBeNull();
});

test('Accidental-scope drawings encode the effective sounding pitch and suppress repeated signs', () => {
  const cases = new Set();
  let staffCases = 0;
  for (let seed = 1; seed <= 100; seed++) {
    const item = generate('accidental-scope', 3, seed, 'en');
    // Engraved contextual cases have an independent MEI oracle in notation-contexts.
    if (item.figure) continue;
    staffCases++;
    const [first, middle, last] = item.staff.pitches;
    cases.add(item.rule);
    expect(middle.letter).not.toBe(first.letter);
    expect(item.staff.accidentalVisibility).toEqual([true, false, false]);
    expect(last.accidental).toBe(
      item.staff.barlines[0] === 1 ? 0 : first.accidental,
    );
    expect(pitchName(last, 'en')).toBe(
      item.options.find((o) => o.id === item.answer).label,
    );
  }
  expect(staffCases).toBeGreaterThan(0);
  expect(cases.size).toBe(2);
});

test('A wrong-clef distractor really names the same staff position in the other clef', () => {
  const observed = new Set();
  for (let seed = 1; seed <= 100; seed++) {
    const item = generate('read-pitch', 2, seed, 'en');
    const option = item.options.find((o) => o.tag === 'read-the-other-clef');
    if (!option) continue;
    const {
      clef,
      pitches: [pitch],
    } = item.staff;
    // The first alternative to treble is bass; to any other clef it is treble.
    const otherClef = clef === 'treble' ? 'bass' : 'treble';
    const other = pitchAtStep(
      staffStep(pitch, clef),
      otherClef,
      pitch.accidental,
    );
    expect(option.label).toBe(pitchName(other, 'en'));
    observed.add(clef);
  }
  expect([...observed].sort((a, b) => a.localeCompare(b))).toEqual([
    'alto',
    'bass',
    'tenor',
    'treble',
  ]);
});
