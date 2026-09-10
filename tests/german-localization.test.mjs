import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { expect, test } from 'vitest';
import { german } from '../lib/german.ts';
import {
  localText,
  translator,
  siteDescription,
  fixedNumber,
} from '../lib/i18n.ts';
import { lessons, terms, patterns } from '../lib/learning.ts';
import { scales } from '../lib/scales.ts';
import {
  chordQualities,
  chordNotes,
  chordSymbol,
  keyName,
  keyTonics,
  progressionTemplates,
  templateGroups,
} from '../lib/chords.ts';
import {
  experimentTonics,
  intervalLabels,
  keyboardPitch,
  localizedNoteName,
  octaveName,
  pitchLabel,
  pitchName,
  scaleName,
  spellPattern,
} from '../lib/notation.ts';
import { count } from '../lib/plural.ts';
import { LANGUAGES, langFromStorage } from '../lib/client-store.ts';

test('Every shipped lesson, term, formula, pattern and progression guide has three complete texts', () => {
  let texts = 0;
  function inspect(value) {
    if (!value || typeof value !== 'object') return;
    if ('en' in value && 'ru' in value) {
      for (const lang of LANGUAGES)
        expect(value[lang]?.trim(), value.en).toBeTruthy();
      expect(value.de, value.en).not.toMatch(/undefined|TODO|TRANSLATE/);
      texts++;
    }
    Object.values(value).forEach(inspect);
  }
  inspect([
    lessons,
    terms,
    patterns,
    scales,
    chordQualities,
    progressionTemplates,
    templateGroups,
    siteDescription,
  ]);
  expect(texts).toBeGreaterThan(180);
  for (const [en, de] of Object.entries(german)) {
    expect(de.trim(), en).not.toBe('');
    expect(translator('de')(en, 'Русский текст')).toBe(de);
    expect(translator('en')(en, 'Русский текст')).toBe(en);
    expect(translator('ru')(en, 'Русский текст')).toBe('Русский текст');
  }
  expect(localText('Sound lab', 'Лаборатория')).toEqual({
    en: 'Sound lab',
    ru: 'Лаборатория',
    de: 'Klanglabor',
  });
  const majorFormula = lessons.find((l) => l.id === 'scales').formula.de;
  expect(majorFormula).toContain('Dur');
  expect(majorFormula).toContain('Halbtönen');
  expect(majorFormula).toContain('2 – 2 – 1 – 2 – 2 – 2 – 1');
  expect(langFromStorage({ getItem: () => 'de' })).toBe('de');
  expect(langFromStorage({ getItem: () => 'DE' })).toBe('en');
});

test('German H/B and all single/double alterations follow written degrees, including exceptions', () => {
  // Beck, Theorie D2/D3 pp. 8–10; independent written vocabulary, not chromatic aliases.
  const rows = [
    'Ceses Ces C Cis Cisis',
    'Deses Des D Dis Disis',
    'Eses Es E Eis Eisis',
    'Feses Fes F Fis Fisis',
    'Geses Ges G Gis Gisis',
    'Ases As A Ais Aisis',
    'Heses B H His Hisis',
  ];
  rows.forEach((row, letter) =>
    row.split(' ').forEach((name, i) => {
      expect(
        pitchName({ letter, accidental: i - 2, octave: 4, midi: 60 }, 'de'),
      ).toBe(name);
    }),
  );
  const cases = [
    ['C', 'Major', 'C D E F G A H C', 'C-Dur'],
    ['Bb', 'Major', 'B C D Es F G A B', 'B-Dur'],
    ['B', 'Major', 'H Cis Dis E Fis Gis Ais H', 'H-Dur'],
    ['F#', 'Major', 'Fis Gis Ais H Cis Dis Eis Fis', 'Fis-Dur'],
    ['Gb', 'Major', 'Ges As B Ces Des Es F Ges', 'Ges-Dur'],
    ['C', 'Natural minor', 'C D Es F G As B C', 'c-Moll – natürlich'],
    ['C', 'Harmonic minor', 'C D Es F G As H C', 'c-Moll – harmonisch'],
    [
      'C',
      'Melodic minor (ascending)',
      'C D Es F G A H C',
      'c-Moll – melodisch (aufwärts)',
    ],
    [
      'C',
      'Melodic minor (descending)',
      'C B As G F Es D C',
      'c-Moll – melodisch (abwärts)',
    ],
    [
      'D#',
      'Harmonic minor',
      'Dis Eis Fis Gis Ais H Cisis Dis',
      'dis-Moll – harmonisch',
    ],
    [
      'Db',
      'Natural minor',
      'Des Es Fes Ges As Heses Ces Des',
      'des-Moll – natürlich',
    ],
    ['C', 'Dorian', 'C D Es F G A B C', 'Dorisch auf C'],
    ['C', 'Mixolydian', 'C D E F G A B C', 'Mixolydisch auf C'],
    ['C', 'Major pentatonic', 'C D E G A C', 'C-Dur-Pentatonik'],
    ['C', 'Minor pentatonic', 'C Es F G B C', 'c-Moll-Pentatonik'],
    [
      'C',
      'Blues (12-TET)',
      'C Es F Ges G B C',
      'Bluestonleiter auf C (12-TET)',
    ],
  ];
  for (const [root, name, expected, title] of cases) {
    const scale = scales.find((s) => s.en === name);
    const pitches = spellPattern(root, scale);
    expect(pitches.map((p) => pitchName(p, 'de')).join(' '), name).toBe(
      expected,
    );
    expect(
      scaleName(
        spellPattern(root, { steps: [0], degrees: [0] })[0],
        scale,
        'de',
      ),
    ).toBe(title);
  }
  // No supported theoretical key can lose a note name, even with double accidentals.
  for (const root of experimentTonics)
    for (const scale of scales) {
      for (const pitch of spellPattern(root, scale))
        expect(pitchLabel(pitch, 'de')).not.toMatch(/undefined|[♯♭]/);
    }
});

test('Classical German octave labels keep written registers across enharmonic boundaries', () => {
  const labels = ['C₂', 'C₁', 'C', 'c', 'c′', 'c″', 'c‴', 'c⁗', 'c⁗′'];
  const names = [
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
  labels.forEach((label, octave) => {
    const pitch = keyboardPitch((octave + 1) * 12);
    expect(localizedNoteName(pitch.midi, 'de')).toBe(label);
    expect(octaveName(pitch, 'de')).toBe(names[octave]);
  });
  expect(
    pitchLabel(spellPattern('C', { steps: [0], degrees: [0] })[0], 'ru'),
  ).toBe('до, первая октава');
  expect(localizedNoteName(71, 'en')).toBe('B4');
  expect(localizedNoteName(70, 'de')).toBe('ais′');
  expect(localizedNoteName(71, 'de')).toBe('h′');
  expect(localizedNoteName(72, 'de')).toBe('c″');
  expect(pitchLabel(spellPattern('C#', scales[0])[6], 'de')).toBe('his′');
  expect(pitchLabel(spellPattern('Gb', scales[0])[3], 'de')).toBe('ces″');
  expect(intervalLabels(58, 4, 2, 'de')).toEqual(['ais', 'cisis′']);
  expect(intervalLabels(71, 3, 2, 'de')).toEqual(['h′', 'd″']);
  for (const bad of [11, 120, 60.5, NaN, Infinity, -1])
    expect(() => keyboardPitch(bad)).toThrow(RangeError);
  for (const bad of [1.5, NaN, Infinity])
    expect(() => localizedNoteName(bad, 'de')).toThrow(RangeError);
  expect(localizedNoteName(11, 'de')).toBe('MIDI 11');
  expect(localizedNoteName(120, 'de')).toBe('MIDI 120');
  expect(() => intervalLabels(60, 13, 2, 'de')).toThrow(RangeError);
});

test('German keys and slash chords distinguish H from B without transposing the sound', () => {
  const chord = { degree: 0, quality: 'major', inversion: 1, beats: 4 };
  const h = { tonic: 11, mode: 'major' },
    b = { tonic: 10, mode: 'major' };
  expect(keyName(h, 'de')).toBe('H-Dur');
  expect(keyName(b, 'de')).toBe('B-Dur');
  expect(keyName({ tonic: 11, mode: 'minor' }, 'de')).toBe('h-Moll');
  expect(keyName({ tonic: 10, mode: 'minor' }, 'de')).toBe('b-Moll');
  expect(chordSymbol(h, chord, 'de')).toBe('H/Dis');
  expect(chordSymbol(b, chord, 'de')).toBe('B/D');
  expect(
    chordSymbol(h, { ...chord, quality: 'min7', inversion: 0 }, 'de'),
  ).toBe('Hm7');
  expect(chordSymbol(h, chord)).toBe('B/D♯');
  expect(chordSymbol(h, chord, 'ru')).toBe('B/D♯');
  for (const mode of ['major', 'minor'])
    for (let tonic = 0; tonic < keyTonics[mode].length; tonic++) {
      for (const quality of Object.keys(chordQualities)) {
        const step = { ...chord, quality };
        const before = chordNotes({ tonic, mode }, step);
        expect(chordSymbol({ tonic, mode }, step, 'de')).not.toMatch(
          /undefined/,
        );
        expect(chordNotes({ tonic, mode }, step)).toEqual(before);
      }
    }
});

test('German counters use musical nouns and correct singular/plural forms', () => {
  for (const [noun, one, other] of [
    ['beats', 'Zählzeit', 'Zählzeiten'],
    ['chords', 'Akkord', 'Akkorde'],
    ['octaves', 'Oktave', 'Oktaven'],
    ['semitones', 'Halbton', 'Halbtöne'],
  ]) {
    expect(count(1, 'de', noun)).toBe(`1 ${one}`);
    for (const n of [0, 2, 11, 21])
      expect(count(n, 'de', noun)).toBe(`${n} ${other}`);
    for (const bad of [-1, 1.2, Infinity, NaN])
      expect(() => count(bad, 'de', noun)).toThrow(RangeError);
  }
});

test('German decimal readouts use a comma without changing the value or other locales', () => {
  expect(fixedNumber(261.625565, 2, 'de')).toBe('261,63');
  expect(fixedNumber(-14.3, 1, 'de')).toBe('-14,3');
  expect(fixedNumber(440, 0, 'de')).toBe('440');
  expect(fixedNumber(440, 2, 'en')).toBe('440.00');
  expect(fixedNumber(440, 2, 'ru')).toBe('440.00');
  expect(() => fixedNumber(440, -1, 'de')).toThrow(RangeError);
});

test('German counters decline the drill lens nouns too', () => {
  for (const [noun, one, other] of [
    ['questions', 'Frage', 'Fragen'],
    ['mistakes', 'Fehler', 'Fehler'],
    ['terms', 'Begriff', 'Begriffe'],
    ['lessons', 'Lektion', 'Lektionen'],
  ]) {
    expect(count(1, 'de', noun)).toBe(`1 ${one}`);
    for (const n of [0, 2, 11, 21])
      expect(count(n, 'de', noun)).toBe(`${n} ${other}`);
  }
});

/**
 * The catalogue is a gate in one direction already: `GermanKey` makes an
 * English string with no entry a `tsc` failure, so nothing ships untranslated.
 * Nothing enforced the other direction, and 56 keys had outlived the copy they
 * translated — a reviewer reading the file could not tell which German was
 * live. A key nobody uses is a translation nobody can check.
 */
const root = fileURLToPath(new URL('../', import.meta.url));
/**
 * What git tracks, and nothing else.
 *
 * Walking the directory instead was wrong in a way that only CI could see: a
 * scratch `/work/` full of old migration scripts is gitignored here and absent
 * there, so two dead keys stayed alive on this machine and the gate passed
 * locally while failing in the run that matters. Build output under `dist/`
 * would have done the same, inlining every key it is looking for. Asking git
 * makes the corpus exactly what ships, and identical in both places.
 */
function sourceFiles() {
  const listed = execFileSync(
    'git',
    ['ls-files', '-z', '*.ts', '*.tsx', '*.mjs', '*.mts'],
    { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 },
  );
  return (
    listed
      .split('\0')
      .filter(Boolean)
      // Tests are excluded on purpose: a key kept alive only by a test that
      // mentions it is exactly the dead key this is looking for.
      .filter((path) => !path.startsWith('tests/'))
      .filter((path) => path !== 'lib/german.ts')
      .map((path) => join(root, path))
  );
}

test('Every German entry translates a string the site still says', () => {
  const files = sourceFiles(root);
  expect(files.length).toBeGreaterThan(20);
  const corpus = files.map((file) => readFileSync(file, 'utf8')).join(' ');
  const orphans = Object.keys(german).filter((key) => !corpus.includes(key));
  expect(
    orphans,
    'delete these from lib/german.ts, or use them: nothing outside the catalogue says them',
  ).toEqual([]);
  // And the catalogue is the size the site needs, not a historical record.
  expect(Object.keys(german).length).toBeGreaterThan(600);
});
