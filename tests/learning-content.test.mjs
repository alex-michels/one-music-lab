import { test } from 'vitest';
import assert from 'node:assert/strict';
import { lessons, terms } from '../lib/learning.ts';
import { ruleLabels, termAnchor } from '../lib/topics.ts';
import { RULES } from '../lib/exercises.ts';

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

test('Glossary headings have one capitalization convention and no ambiguous localized duplicates', () => {
  for (const lang of ['en', 'ru', 'de']) {
    const seen = new Set();
    for (const term of terms) {
      const title = term.title[lang];
      assert.equal(title, title.trim(), `${lang}: whitespace in ${title}`);
      assert.match(title, /^\p{Lu}/u, `${lang}: lowercase heading ${title}`);
      const key = title.toLocaleLowerCase(lang);
      assert.ok(!seen.has(key), `${lang}: duplicate heading ${title}`);
      seen.add(key);
    }
  }
  // A keyboard key and a position on a staff share an English word, not a German meaning.
  assert.equal(
    terms.find((t) => t.title.en === 'Space').title.de,
    'Zwischenraum',
  );
});

test('Capitalizing a glossary heading preserves every existing lowercase deep link', () => {
  const legacy = [
    'piano (p)',
    'forte (f)',
    'mezzo (mp, mf)',
    'crescendo',
    'decrescendo',
    'hairpin',
    'sforzato (sf, sfz)',
    'accent',
    'articulation',
    'staccato',
    'staccatissimo',
    'tenuto',
    'portato',
    'phrasing',
    'double bar',
    'final bar line',
    'repeat sign',
    'first and second endings',
    'da capo',
    'segno',
    'dal segno',
    'fine',
  ];
  for (const id of legacy) {
    const term = terms.find((t) => t.id === id);
    assert.ok(term, `${id} has lost its stable identity`);
    assert.equal(termAnchor(term), encodeURIComponent(id));
    assert.notEqual(
      term.title.en,
      id,
      'the display heading should be capitalized',
    );
    assert.ok(term.source?.url, `${id} lost its source during the title edit`);
  }
  assert.equal(new Set(terms.map(termAnchor)).size, terms.length);
  assert.equal(
    termAnchor({ title: { en: 'A ~ B', ru: 'А', de: 'A' } }),
    'A%20%7E%20B',
  );
});

test('Every practice rule has a localized skill label instead of an internal identifier', () => {
  assert.deepEqual(Object.keys(ruleLabels).sort(), [...RULES].sort());
  for (const rule of RULES) {
    const label = ruleLabels[rule];
    for (const lang of ['en', 'ru', 'de']) {
      assert.ok(label[lang].length > 8);
      assert.notEqual(label[lang], rule);
      assert.match(label[lang], /^\p{Lu}/u);
    }
    assert.match(label.ru, /[А-Яа-я]/);
    assert.notEqual(label.de, label.en);
  }
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
