import { test, expect } from 'vitest';
import { lessons, terms } from '../lib/learning.ts';
import {
  notationProgramme,
  notationReferences,
  notationFigureDescriptions,
  notationForwardLinks,
} from '../lib/notation-programme.ts';
import { readFile } from 'node:fs/promises';

const languages = ['en', 'ru', 'de'];
const reference = (name) => {
  const matches = terms.filter((term) => (term.id ?? term.title.en) === name);
  expect(
    matches,
    `unambiguous existing reference identity: ${name}`,
  ).toHaveLength(1);
  return matches[0];
};

test('Content retains the thirteen lessons and assigns dotted/tied rhythm to permanent task 022 in F05', () => {
  expect(Object.keys(notationProgramme)).toEqual([
    'note-names',
    'staff',
    'clefs',
    'accidental-signs',
    'accidental-scope',
    'enharmonics',
    'durations',
    'dots-ties',
    'beat-division',
    'tempo',
    'dynamics',
    'articulation',
    'repeats',
  ]);
  expect(notationProgramme['dots-ties'].tasks).toEqual(['022']);
  expect(notationProgramme['dots-ties'].module).toBe('F05');
  for (const id of Object.keys(notationProgramme))
    expect(lessons.filter((lesson) => lesson.id === id)).toHaveLength(1);
});

test('Standalone notation references expose sources for their own subject without changing legacy sound entries', () => {
  for (const term of terms.filter((entry) =>
    Object.hasOwn(notationProgramme, entry.lesson),
  )) {
    expect(term.source?.title, term.title.en).toBeTruthy();
    expect(new URL(term.source.url).protocol).toBe('https:');
  }
  expect(reference('Rest').source.url).toContain('writing-rests');
  expect(reference('Whole-bar rest').source.url).toContain('writing-rests');
  expect(reference('Stem').source.url).toContain('inside-the-staff#stems');
  expect(reference('Slur').source.url).toContain('expressive-marks-as-curves');
  expect(reference('Middle C').source.url).toContain('unsw.edu.au');
  const legacy = terms.filter(
    (term) =>
      !Object.hasOwn(notationProgramme, term.lesson) &&
      term.title.en !== 'Chord symbols',
  );
  expect(legacy).toHaveLength(12);
  expect(legacy.every((term) => !('source' in term))).toBe(true);
});

test('Aliases retain duration equivalence and culturally qualified ornament lookup without replacing term identities', () => {
  const durations = reference('Duration names and aliases');
  for (const name of [
    'semibreve',
    'minim',
    'crotchet',
    'quaver',
    'semiquaver',
    'demisemiquaver',
    'hemidemisemiquaver',
  ])
    expect(
      durations.aliases.en.split(';').map((word) => word.trim()),
    ).toContain(name);
  const mordent = reference('Mordent');
  expect(mordent.aliases.en).toContain('upper mordent');
  expect(mordent.aliases.en).toContain('lower mordent');
  expect(mordent.aliases.ru).toContain('перечёркнутый мордент');
  expect(mordent.aliases.de).toContain('Pralltriller');
  for (const entry of notationReferences)
    for (const lang of languages) {
      expect(entry.title[lang].trim()).not.toBe('');
      expect(entry.body[lang].trim().length).toBeGreaterThan(30);
      if ('aliases' in entry) expect(entry.aliases[lang].trim()).not.toBe('');
    }
});

test('Chords reuse a real subject and deferred traditions link to existing curriculum homes', async () => {
  expect(reference('Chord symbols').lesson).toBe('chords');
  expect(lessons.some((lesson) => lesson.id === 'chords')).toBe(true);
  expect(reference('Tablature').forwardModules).toContain('N05');
  expect(reference('Figured bass').forwardModules).toContain('H04');
  expect(reference('Chant divisions').forwardModules).toContain('N04');
  for (const [module, href] of Object.entries(notationForwardLinks)) {
    const url = new URL(href);
    expect(url.hash).toBe(`#${module.toLowerCase()}`);
    const path = url.pathname.split('/blob/main/')[1];
    const content = await readFile(
      new URL(`../${path}`, import.meta.url),
      'utf8',
    );
    expect(content).toContain(`## ${module}`);
  }
  for (const entry of notationReferences) {
    if ('relatedTopics' in entry)
      for (const topic of entry.relatedTopics)
        expect(lessons.some((lesson) => lesson.id === topic)).toBe(true);
    if ('forwardModules' in entry)
      // Not `module`: assigning that name is a lint error, because a bundler
      // gives it a meaning of its own.
      for (const forward of entry.forwardModules)
        expect(notationForwardLinks[forward]).toBeTruthy();
  }
});

test('New figures have localized teaching alternatives and distinguish repeat, duration and performance meanings', () => {
  expect(Object.keys(notationFigureDescriptions)).toHaveLength(30);
  for (const [id, description] of Object.entries(notationFigureDescriptions)) {
    expect(
      Object.values(notationProgramme).some((lesson) =>
        lesson.figures.includes(id),
      ),
      id,
    ).toBe(true);
    for (const lang of languages)
      expect(description[lang].length, `${id}/${lang}`).toBeGreaterThan(40);
  }
  expect(notationFigureDescriptions['repeat-dc-fine'].en).toContain(
    'not on the first',
  );
  expect(notationFigureDescriptions['tuplet-13-12'].en).toContain('thirteen');
  expect(notationFigureDescriptions['dynamic-fp'].en).toContain(
    'soft continuation',
  );
  expect(notationFigureDescriptions['accidental-tie-scope'].en).toContain(
    'untied',
  );
  expect(notationFigureDescriptions['organ-staves'].en).toContain('pedal');
});

test('Corrected reading does not reinstate universal tuplet ratios or cross-system lessons', () => {
  const tuplets = lessons.find((lesson) => lesson.id === 'beat-division')
    .paragraphs[0];
  for (const lang of languages) {
    expect(tuplets[lang]).toContain('3:2');
    expect(tuplets[lang]).toContain('7:4');
    expect(tuplets[lang]).toContain('7:8');
  }
  expect(notationProgramme['note-names'].text.ru).not.toContain('H —');
  expect(notationProgramme['accidental-signs'].text.en).not.toContain(
    'German examples',
  );
  expect(reference('Pitch-name systems').body.en).toContain('German H');
  for (const lang of languages) {
    const returns = lessons.find((lesson) => lesson.id === 'repeats')
      .paragraphs[1][lang];
    expect(returns).toContain('al Coda');
  }
  expect(reference('Mancando: historical vocabulary').source.url).toBe(
    'https://www.dolmetsch.com/defsm.htm',
  );
});
