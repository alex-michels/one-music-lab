import { expect, test } from 'vitest';
import {
  course,
  chapters,
  readingOrder,
  lessonPosition,
  lessonBridges,
  courseProblems,
  courseAddresses,
  collectionTitle,
  chaptersFor,
  lessonAvailable,
} from '../lib/course.ts';
import { lessons } from '../lib/learning.ts';
import { hashOf, routeFromHash, LENSES } from '../lib/client-store.ts';
import {
  diagnosticQuestions,
  diagnosticResult,
} from '../lib/entry-diagnostic.ts';

const context = {
  lang: 'en',
  topics: lessons.map((lesson) => lesson.id),
  ...courseAddresses,
};

test('All existing lessons join one book, with sound before notation and pitch spelling before harmony', () => {
  expect(courseProblems(course)).toEqual([]);
  expect(new Set(readingOrder)).toEqual(
    new Set(lessons.map((lesson) => lesson.id)),
  );
  expect(readingOrder.slice(0, 4)).toEqual([
    'sound',
    'note-names',
    'staff',
    'clefs',
  ]);
  expect(readingOrder.indexOf('enharmonics')).toBeLessThan(
    readingOrder.indexOf('intervals'),
  );
  expect(readingOrder.indexOf('intervals')).toBeLessThan(
    readingOrder.indexOf('scales'),
  );
  expect(readingOrder.indexOf('scales')).toBeLessThan(
    readingOrder.indexOf('chords'),
  );
  expect(readingOrder.indexOf('durations')).toBeLessThan(
    readingOrder.indexOf('dots-ties'),
  );
  expect(readingOrder.at(-1)).toBe('repeats');
  for (const section of course) {
    expect(section.id).toMatch(/^[a-z]+(?:-[a-z]+)*$/);
    for (const lang of ['en', 'ru', 'de']) {
      expect(section.title[lang].length).toBeGreaterThan(0);
      expect(section.introduction[lang].length).toBeGreaterThan(30);
      for (const chapter of section.chapters) {
        expect(chapter.title[lang].length).toBeGreaterThan(0);
        expect(chapter.goal[lang].length).toBeGreaterThan(30);
        for (const id of chapter.lessons)
          expect(lessonBridges[id][lang].length).toBeGreaterThan(30);
      }
    }
  }
});

test('Reading boundaries end cleanly and each transition is reversible across chapters and sections', () => {
  expect(lessonPosition(null)).toBeNull();
  expect(lessonPosition('unwritten')).toBeNull();
  expect(lessonPosition('sound').previous).toBeNull();
  expect(lessonPosition('repeats').next).toBeNull();
  expect(lessonPosition('note-names').next).toBe('staff');
  expect(lessonPosition('chords').next).toBe('timbre');
  expect(lessonPosition('timbre').section.id).toBe('expression');
  for (const topic of readingOrder) {
    const position = lessonPosition(topic);
    expect(position.chapter.lessons[position.inChapter]).toBe(topic);
    if (position.next)
      expect(lessonPosition(position.next).previous).toBe(topic);
    if (position.previous)
      expect(lessonPosition(position.previous).next).toBe(topic);
  }
});

test('The authoring gate rejects omissions, duplicates, missing lessons and forward/cyclic prerequisites', () => {
  const invalid = structuredClone(course);
  invalid.push(structuredClone(invalid[0]));
  invalid[0].chapters[0].lessons = ['sound', 'ghost'];
  invalid[0].chapters[0].prerequisites = ['chords'];
  invalid[0].chapters.push({
    ...invalid[0].chapters[0],
    id: 'empty',
    lessons: [],
  });
  invalid.push({ ...invalid[1], id: 'empty-section', chapters: [] });
  const problems = courseProblems(invalid);
  expect(problems).toContain('Unknown lesson: ghost');
  expect(problems).toContain('Duplicate section: foundations');
  expect(problems).toContain('Duplicate chapter: first-sounds');
  expect(problems).toContain('Repeated lesson: sound');
  expect(problems).toContain('Prerequisite must precede first-sounds: chords');
  expect(problems).toContain('Empty chapter: empty');
  expect(problems).toContain('Empty section: empty-section');
  expect(courseProblems([], ['new-topic'])).toEqual([
    'Missing lesson: new-topic',
  ]);
  const self = structuredClone(course);
  self[0].chapters[0].prerequisites = ['sound'];
  expect(courseProblems(self)).toContain(
    'Prerequisite must precede first-sounds: sound',
  );
});

test('Section and chapter addresses survive every language and view without changing lesson addresses', () => {
  for (const lang of ['en', 'ru', 'de'])
    for (const lens of LENSES) {
      for (const [kind, ids] of [
        ['section', courseAddresses.sections],
        ['chapter', courseAddresses.chapters],
      ])
        for (const id of ids) {
          const route = {
            lang,
            lens,
            topic: null,
            anchor: null,
            collection: { kind, id },
          };
          expect(routeFromHash(hashOf(route), context)).toEqual(route);
          expect(collectionTitle(route.collection)[lang]).toBeTruthy();
          const selected = chaptersFor(route.collection);
          expect(selected.length).toBeGreaterThan(0);
          if (kind === 'chapter')
            expect(selected.map((chapter) => chapter.id)).toEqual([id]);
        }
      const old = {
        lang,
        lens,
        topic: 'staff',
        anchor: 'read-a-notated-pitch',
      };
      expect(routeFromHash(hashOf(old), context)).toEqual(old);
      expect(
        hashOf({ ...old, collection: { kind: 'chapter', id: 'rhythm' } }),
      ).toBe(hashOf(old));
    }
  expect(chaptersFor(undefined)).toEqual(chapters);
  expect(collectionTitle(undefined)).toBeNull();
  for (const kind of ['section', 'chapter']) {
    expect(collectionTitle({ kind, id: 'missing' })).toBeNull();
    expect(chaptersFor({ kind, id: 'missing' })).toEqual([]);
  }
});

test('Malformed/stale collection links recover to a usable index', () => {
  for (const hash of [
    '#/ru/c/unknown/read',
    '#/ru/s/unknown/play',
    '#/ru/c',
    '#/ru/s/',
    '#/ru/c/rhythm/read/extra',
  ]) {
    expect(routeFromHash(hash, context)).toEqual({
      lang: 'ru',
      lens: 'read',
      topic: null,
      anchor: null,
    });
  }
  expect(routeFromHash('#/de/c/rhythm/invalid', context)).toEqual({
    lang: 'de',
    lens: 'read',
    topic: null,
    anchor: null,
    collection: { kind: 'chapter', id: 'rhythm' },
  });
  expect(routeFromHash('#/c/rhythm', { ...context, lang: 'de' }).lang).toBe(
    'de',
  );
  expect(
    routeFromHash('#/en/c/rhythm/read', { lang: 'en', topics: [] }).collection,
  ).toBeUndefined();
});

test('Practice links never substitute a different topic for an unwritten exercise', () => {
  for (const lens of ['read', 'play', 'define'])
    expect(lessonAvailable('sound', lens)).toBe(true);
  expect(lessonAvailable('sound', 'drill')).toBe(false);
  expect(lessonAvailable('chords', 'drill')).toBe(false);
  expect(lessonAvailable('staff', 'drill')).toBe(true);
});

test('Diagnostic keys express musical outcomes and every alternative explains its mistake in each language', () => {
  expect(diagnosticQuestions.map((question) => question.answer)).toEqual([
    'hz',
    'pitch',
    'three',
    'root',
    'timbre',
  ]);
  for (const question of diagnosticQuestions) {
    expect(readingOrder).toContain(question.topic);
    expect(
      question.options.filter((option) => option.id === question.answer),
    ).toHaveLength(1);
    expect(new Set(question.options.map((option) => option.id)).size).toBe(
      question.options.length,
    );
    expect(question.source.url).toMatch(/^https:\/\//);
    for (const lang of ['en', 'ru', 'de']) {
      expect(question.prompt[lang].length).toBeGreaterThan(30);
      for (const option of question.options) {
        expect(option.label[lang]).toBeTruthy();
        expect(option.feedback[lang].length).toBeGreaterThan(30);
      }
    }
  }
});

test('A diagnostic suggests the earliest missed/skipped explanation, never marks an incomplete check successful', () => {
  const correct = diagnosticQuestions.map((question) => question.answer);
  expect(diagnosticResult(correct)).toEqual({ review: [], recommended: null });
  expect(diagnosticResult([])).toBeNull();
  expect(diagnosticResult([...correct, 'extra'])).toBeNull();
  expect(diagnosticResult(Array.from({ length: 5 }))).toBeNull();
  for (let i = 0; i < correct.length; i++) {
    for (const answer of [
      null,
      ...diagnosticQuestions[i].options
        .filter((option) => option.id !== correct[i])
        .map((option) => option.id),
    ]) {
      const responses = [...correct];
      responses[i] = answer;
      expect(diagnosticResult(responses)).toEqual({
        review: [diagnosticQuestions[i].topic],
        recommended: diagnosticQuestions[i].topic,
      });
    }
    const invalid = [...correct];
    invalid[i] = 'bogus';
    expect(diagnosticResult(invalid)).toBeNull();
  }
  expect(diagnosticResult([null, 'pitch', null, 'third', 'timbre'])).toEqual({
    review: ['sound', 'dots-ties', 'chords'],
    recommended: 'sound',
  });
});
