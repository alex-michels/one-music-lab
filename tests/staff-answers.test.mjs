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

test('German accepts both names of A double-flat as the same spelled pitch, and no other language does', () => {
  const doubleFlatA = { letter: 5, accidental: -2 };
  // “Ases” is the displayed form; “Asas” is the more frequent textbook one.
  expect(pitchName({ ...doubleFlatA, octave: 4, midi: 67 }, 'de')).toBe('Ases');
  for (const typed of ['Asas', 'asas', ' ASAS ', 'Ases'])
    expect(parseNoteName(typed, 'de')).toEqual(doubleFlatA);
  // The enharmonic G stays a different answer, and the variant is German only.
  expect(parseNoteName('G', 'de')).toEqual({ letter: 4, accidental: 0 });
  expect(parseNoteName('Asas', 'en')).toBeNull();
  expect(parseNoteName('Asas', 'ru')).toBeNull();
  for (const invented of ['Asasas', 'Esas', 'Hesas', 'Aes'])
    expect(parseNoteName(invented, 'de')).toBeNull();
});

test('The middle note of a sign-scope bar is a true neighbour inside the readable band', () => {
  const firstLetters = new Set();
  const directions = new Set();
  for (const level of [1, 3])
    for (let seed = 1; seed <= 400; seed++) {
      const item = generate('accidental-scope', level, seed, 'en');
      if (item.figure) continue;
      const { clef, pitches } = item.staff;
      const [first, middle] = pitches.map((pitch) => staffStep(pitch, clef));
      // One staff step away: B goes to the C above it, not a seventh below.
      expect(Math.abs(middle - first)).toBe(1);
      expect(pitches[1].accidental).toBe(0);
      // Inside the staff or on a single ledger line, like the note it follows.
      for (const step of [first, middle]) {
        expect(step).toBeGreaterThanOrEqual(-3);
        expect(step).toBeLessThanOrEqual(11);
      }
      firstLetters.add(pitches[0].letter);
      directions.add(middle - first);
    }
  // B, the letter that used to wrap, is among the cases; so is the top of the band.
  expect(firstLetters.has(6)).toBe(true);
  expect(directions).toEqual(new Set([1, -1]));
});

test('A clef-transform question names the new clef in a full phrase and its key reads the same place in that clef', () => {
  const clefs = {
    en: {
      'treble clef': 'treble',
      'bass clef': 'bass',
      'alto clef': 'alto',
      'tenor clef': 'tenor',
    },
    ru: {
      скрипичном: 'treble',
      басовом: 'bass',
      альтовом: 'alto',
      теноровом: 'tenor',
    },
    de: {
      Violinschlüssel: 'treble',
      Bassschlüssel: 'bass',
      Altschlüssel: 'alto',
      Tenorschlüssel: 'tenor',
    },
  };
  const stems = {
    en: /^The same place on the staff, read in the (.+)\. Which note is it\?$/,
    ru: /^То же место на стане прочитайте в (\S+) ключе\. Какая это нота\?$/,
    de: /^Dieselbe Stelle im System, im (\S+) gelesen\. Welcher Ton ist das\?$/,
  };
  const targets = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (let seed = 1; seed <= 120; seed++) {
      const item = generate('clef-transform', 2, seed, lang);
      const stem = item.prompt.match(stems[lang]);
      expect(stem, item.prompt).not.toBeNull();
      const to = clefs[lang][stem[1]];
      expect(to, item.prompt).toBeDefined();
      const {
        clef,
        pitches: [pitch],
      } = item.staff;
      expect(to).not.toBe(clef);
      // The staff position stays; only the clef that names it changes.
      const reread = pitchAtStep(staffStep(pitch, clef), to, pitch.accidental);
      expect(item.options.find((o) => o.id === item.answer).label).toBe(
        pitchName(reread, lang),
      );
      targets.add(`${lang}:${to}`);
    }
  expect(targets.size).toBe(12);
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
