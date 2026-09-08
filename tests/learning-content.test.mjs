import { test } from 'vitest';
import assert from 'node:assert/strict';
import { lessons, terms } from '../lib/learning.ts';

test('Every lesson id and every glossary headword is unique', () => {
  const ids = lessons.map((l) => l.id);
  assert.equal(new Set(ids).size, ids.length, 'two lessons share an id');
  // The glossary keys its React list on the English title, so a repeat is not
  // merely untidy: duplicate keys break reconciliation and leave stale cards
  // in the page when the search filter changes.
  const titles = terms.map((t) => t.title.en);
  const repeated = titles.filter((t, i) => titles.indexOf(t) !== i);
  assert.deepEqual(
    repeated,
    [],
    `duplicate glossary headwords: ${repeated.join(', ')}`,
  );
  for (const term of terms)
    assert.ok(
      ids.includes(term.lesson),
      `term "${term.title.en}" points at missing lesson "${term.lesson}"`,
    );
});

test('Every lesson carries two paragraphs in all three languages', () => {
  for (const lesson of lessons) {
    assert.equal(lesson.paragraphs.length, 2, `${lesson.id} paragraph count`);
    for (const field of [
      'title',
      'category',
      'summary',
      'formula',
      'experiment',
    ])
      for (const lang of ['en', 'ru', 'de'])
        assert.ok(
          lesson[field][lang]?.trim().length > 0,
          `${lesson.id}.${field}.${lang} is empty`,
        );
    for (const [i, paragraph] of lesson.paragraphs.entries())
      for (const lang of ['en', 'ru', 'de'])
        assert.ok(
          paragraph[lang]?.trim().length > 20,
          `${lesson.id}.p${i + 1}.${lang} is too short to be prose`,
        );
  }
});
