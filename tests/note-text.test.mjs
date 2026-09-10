import { test, expect } from 'vitest';
import {
  noteTextParts,
  plainNoteText,
  markPitchName,
  noteTextValue,
} from '../lib/note-text.ts';
import { localizedText, localText } from '../lib/i18n.ts';
import { generateFrom, exerciseKinds, grade } from '../lib/exercises.ts';
import { lessons, terms } from '../lib/learning.ts';
import {
  notationProgramme,
  notationFigureDescriptions,
} from '../lib/notation-programme.ts';
import { progressionTemplates } from '../lib/chords.ts';

test('Only explicitly named notes are italic tokens; prepositions, words and invalid markup stay literal', () => {
  const value =
    'От [[до]] до [[соль]]; до завтра. [[До-диез]], [[фа-дубль-бемоль]], [[доход]], [[до завтра]], [[C]], <img onerror="x">.';
  expect(
    noteTextParts(value)
      .filter((p) => p.note)
      .map((p) => p.text),
  ).toEqual(['до', 'соль', 'До-диез', 'фа-дубль-бемоль']);
  expect(plainNoteText(value)).toBe(
    'От до до соль; до завтра. До-диез, фа-дубль-бемоль, [[доход]], [[до завтра]], [[C]], <img onerror="x">.',
  );
  expect(noteTextParts('')).toEqual([]);
  expect(noteTextParts('до рефрен сольфеджио')).toEqual([
    { text: 'до рефрен сольфеджио', note: false },
  ]);
  expect(plainNoteText('[[до]][[ре]]')).toBe('доре');
  expect(plainNoteText('🎵 [[ля]]')).toBe('🎵 ля');
  expect(noteTextValue('до конца')).toEqual({ text: 'до конца' });
  expect(noteTextValue('[[до]]')).toEqual({ text: 'до', markup: '[[до]]' });
});

test('Pitch formatting is opt-in and keeps octave descriptions and other locales plain', () => {
  expect(markPitchName('си-дубль-диез, малая октава', 'ru')).toBe(
    '[[си-дубль-диез]], малая октава',
  );
  expect(markPitchName('До', 'ru')).toBe('[[До]]');
  for (const label of ['до завтра', 'рефрен', 'сольфеджио', 'ля-диезный', 'C4'])
    expect(markPitchName(label, 'ru')).toBe(label);
  expect(markPitchName('до', 'en')).toBe('до');
  expect(markPitchName('H', 'de')).toBe('H');
});

test('Localized authoring keeps searchable text separate from Russian typography', () => {
  expect(localizedText('C', '[[до]]', 'C')).toEqual({
    en: 'C',
    ru: 'до',
    de: 'C',
    ruMarkup: '[[до]]',
  });
  expect(localText('Space', 'до конца')).toEqual({
    en: 'Space',
    ru: 'до конца',
    de: 'Leertaste',
  });
  const text = terms.find((t) => t.title.en === 'Octave register').body;
  const clef = terms.find((t) => t.title.en === 'C clef').title;
  expect(clef.ru).toBe('До-ключ');
  expect(noteTextParts(clef.ruMarkup)).toEqual([
    { text: 'До', note: true },
    { text: '-ключ', note: false },
  ]);
  expect(text.ru).toContain('от до до ближайшего си');
  expect(
    noteTextParts(text.ruMarkup)
      .filter((p) => p.note)
      .map((p) => p.text),
  ).toEqual(['до', 'си']);
  const fields = [
    ...lessons.flatMap((l) => [
      l.title,
      l.summary,
      l.formula,
      ...l.paragraphs,
      l.experiment,
    ]),
    ...terms.flatMap((t) => [t.title, t.body]),
    ...Object.values(notationProgramme).map((c) => c.text),
    ...Object.values(notationFigureDescriptions),
    ...progressionTemplates.map((t) => t.note),
  ];
  expect(fields.filter((f) => f.ruMarkup).length).toBeGreaterThan(35);
  for (const field of fields) {
    expect(field.ru).not.toContain('[[');
    if (field.ruMarkup) expect(plainNoteText(field.ruMarkup)).toBe(field.ru);
  }
});

test('Generated pitch typography preserves plain IDs, labels, prompts and grading across every generator', () => {
  const markedKinds = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (const kind of exerciseKinds)
      for (let seed = 0; seed < 36; seed++) {
        const item = generateFrom(kind, 3, seed, lang);
        for (const row of [item, ...(item.parts ?? [])]) {
          for (const field of ['prompt', 'explanation', 'answer'])
            if (row[field] !== undefined) {
              expect(row[field]).not.toContain('[[');
              if (row[field + 'Markup']) {
                expect(lang).toBe('ru');
                expect(plainNoteText(row[field + 'Markup'])).toBe(row[field]);
                markedKinds.add(kind);
              }
            }
          for (const option of row.options) {
            expect(option.id).not.toContain('[[');
            expect(option.label).not.toContain('[[');
            if (option.labelMarkup) {
              expect(lang).toBe('ru');
              expect(plainNoteText(option.labelMarkup)).toBe(option.label);
              markedKinds.add(kind);
            }
          }
        }
        if (!item.review && !item.parts)
          for (const option of item.options)
            expect(grade(item, option.id).correct).toBe(
              option.id === item.answer,
            );
      }
  expect([...markedKinds].sort((a, b) => a.localeCompare(b))).toEqual([
    'accidental-name',
    'accidental-scope',
    'clef-transform',
    'enharmonic',
    'octave-region',
    'performance-marks',
    'read-pitch',
    'short-excerpt',
  ]);
});
