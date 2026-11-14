import { expect, test } from 'vitest';
import {
  chapterProgress,
  courseProgress,
  lessonReadAt,
  resumePoint,
} from '../lib/course-progress.ts';
import { chapters, readingOrder } from '../lib/course.ts';

test('Progress counts each marked lesson of the book once and ignores unknown or repeated markers', () => {
  expect(courseProgress([])).toEqual({ done: 0, total: readingOrder.length });
  expect(courseProgress(['sound', 'sound', 'no-such-lesson', 'clefs'])).toEqual(
    { done: 2, total: readingOrder.length },
  );
  expect(courseProgress(readingOrder)).toEqual({
    done: readingOrder.length,
    total: readingOrder.length,
  });
  const reading = chapters.find((chapter) => chapter.id === 'reading-pitch');
  expect(chapterProgress(reading, ['sound', 'clefs', 'staff'])).toEqual({
    done: 2,
    total: 5,
  });
  // The chapter totals are the book: no lesson is counted in two chapters.
  expect(
    chapters.reduce(
      (sum, chapter) => sum + chapterProgress(chapter, readingOrder).done,
      0,
    ),
  ).toBe(readingOrder.length);
});

test('Only a saved reading address names a lesson in progress', () => {
  expect(lessonReadAt('#/ru/t/clefs/read')).toBe('clefs');
  expect(lessonReadAt('#/de/t/clefs/read~clef-transform')).toBe('clefs');
  // A topic named without a view opens its text.
  expect(lessonReadAt('#/en/t/tempo')).toBe('tempo');
  for (const address of [
    null,
    '',
    '#/en/read',
    '#/ru/c/rhythm/read',
    '#/de/s/foundations/read',
    '#/en/t/not-a-lesson/read',
    // An instrument or a drill is a visit, not a lesson being read.
    '#/en/t/chords/play',
    '#/en/t/staff/drill',
    '#/en/t/sound/define',
    '#chords',
    '#lab',
    'javascript:alert(1)',
  ])
    expect(lessonReadAt(address), String(address)).toBeNull();
});

test('A new reader is offered the first lesson, and says so', () => {
  expect(resumePoint([], null)).toMatchObject({
    topic: 'sound',
    reason: 'start',
    position: 1,
  });
  expect(resumePoint([], null).chapter.id).toBe('first-sounds');
  // A name that is not a lesson is not a lesson in progress.
  expect(resumePoint([], 'not-a-lesson')).toMatchObject({
    topic: 'sound',
    reason: 'start',
  });
});

test('The last opened lesson is offered again until the reader marks it', () => {
  expect(resumePoint(['sound'], 'clefs')).toMatchObject({
    topic: 'clefs',
    reason: 'resume',
    position: 2,
  });
  // Opened before anything was marked: still a lesson in progress, not a start.
  expect(resumePoint([], 'tempo')).toMatchObject({
    topic: 'tempo',
    reason: 'resume',
    position: 4,
  });
});

test('Once the last opened lesson is marked, the first unmarked lesson is next, including one skipped earlier', () => {
  expect(resumePoint(['sound', 'clefs'], 'clefs')).toMatchObject({
    topic: 'note-names',
    reason: 'next',
    position: 2,
  });
  expect(
    resumePoint(['sound', 'note-names', 'staff'], 'staff').chapter.id,
  ).toBe('reading-pitch');
  expect(resumePoint(['sound'], null)).toMatchObject({
    topic: 'note-names',
    reason: 'next',
  });
});

test('A finished book has nothing left to offer', () => {
  expect(resumePoint(readingOrder, 'repeats')).toBeNull();
  expect(resumePoint([...readingOrder, 'ghost'], null)).toBeNull();
});
