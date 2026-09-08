import { test } from 'vitest';
import assert from 'node:assert/strict';
import { lessons, terms } from '../lib/learning.ts';
import { RULES, exerciseKinds, generate } from '../lib/exercises.ts';
import { notationLessonPresets } from '../lib/notation-experiments.ts';
import {
  TOPIC_IDS,
  TOPIC_KINDS,
  drilledTopics,
  paragraphAnchors,
  ruleKind,
  ruleTopic,
  termsByTopic,
  toneBedTopics,
  topicById,
  topics,
} from '../lib/topics.ts';

/**
 * lib/topics.ts is the primary key the whole site is addressed by, and almost
 * every field in it is a claim about data that lives somewhere else. These
 * tests are what stop the two drifting: nothing here is authored content, so
 * anything that disagrees with lib/learning.ts or the generator is a bug in
 * the table rather than a judgement call.
 */

test('The topic list is exactly the lessons, in their reading order', () => {
  assert.deepEqual(
    [...TOPIC_IDS],
    lessons.map((lesson) => lesson.id),
  );
  assert.equal(new Set(TOPIC_IDS).size, TOPIC_IDS.length, 'ids are unique');
  assert.deepEqual(
    topics.map((topic) => topic.order),
    topics.map((_, index) => index),
  );
  for (const topic of topics) {
    assert.equal(topicById[topic.id], topic);
    assert.equal(
      topic.module,
      null,
      'no module is assigned yet, and none is invented',
    );
  }
});

test('A topic id is usable as a URL segment without escaping', () => {
  // The id is the identity: it goes into #/<lang>/t/<id>/<lens> and into any
  // link a reader saves. Anything needing encoding would make those two differ.
  for (const id of TOPIC_IDS) {
    assert.match(id, /^[a-z][a-z-]*[a-z]$/, id);
    assert.equal(encodeURIComponent(id), id, id);
  }
});

test('Every topic has prose in all three languages, so no row is a stub', () => {
  // honesty rule 8: a topic exists only when its read lens has something to
  // read. A row whose body is empty would be a catalogue entry for nothing.
  for (const lesson of lessons) {
    assert.ok(lesson.paragraphs.length > 0, lesson.id);
    for (const paragraph of lesson.paragraphs)
      for (const lang of ['en', 'ru', 'de'])
        assert.ok(paragraph[lang]?.trim(), `${lesson.id} has no ${lang} prose`);
    for (const lang of ['en', 'ru', 'de'])
      assert.ok(
        lesson.title[lang]?.trim(),
        `${lesson.id} has no ${lang} title`,
      );
  }
});

test('Kind is disjoint from topic id, so the two facets can never collide', () => {
  // `tuning` is a topic; the kind covering it is `tone` for exactly this reason.
  // The encyclopedia shows both facets at once and a shared name announces the
  // same to a screen reader while filtering to something different.
  for (const kind of TOPIC_KINDS)
    assert.ok(!TOPIC_IDS.includes(kind), `${kind} is also a topic id`);
});

test('The kind census accounts for every term exactly once', () => {
  const census = { sign: 0, concept: 0, measure: 0, tone: 0 };
  for (const topic of topics)
    census[topic.kind] += termsByTopic[topic.id].length;
  assert.deepEqual(census, { sign: 38, concept: 27, measure: 25, tone: 7 });
  assert.equal(
    Object.values(census).reduce((a, b) => a + b, 0),
    terms.length,
    'the four kinds cover the glossary and nothing else',
  );
});

test('Terms and topics point at each other with no orphan on either side', () => {
  for (const term of terms)
    assert.ok(TOPIC_IDS.includes(term.lesson), `${term.lesson} is not a topic`);
  for (const id of TOPIC_IDS)
    assert.ok(termsByTopic[id].length > 0, `${id} has no terms`);
  assert.equal(
    TOPIC_IDS.reduce((total, id) => total + termsByTopic[id].length, 0),
    terms.length,
  );
});

const alphabetical = (a, b) => a.localeCompare(b);

test('Every rule the generator emits is a rule a topic teaches', () => {
  // The corpus rather than the declaration: a builder that invents a rule, or a
  // rule that no builder emits any more, both show up here.
  const emitted = new Map();
  for (const kind of exerciseKinds)
    for (const level of [1, 2, 3])
      for (let seed = 1; seed <= 400; seed++) {
        const item = generate(kind, level, seed, 'en');
        if (item) emitted.set(item.rule, kind);
      }
  assert.deepEqual(
    [...emitted.keys()].sort(alphabetical),
    [...RULES].sort(alphabetical),
  );
  for (const [rule, kind] of emitted)
    assert.equal(ruleKind[rule], kind, `${rule} is asked by ${kind}`);
  for (const rule of RULES)
    assert.ok(TOPIC_IDS.includes(ruleTopic[rule]), `${rule} resolves`);
});

test('The paragraph anchors are the rules of that topic, and nothing else', () => {
  const anchored = Object.values(paragraphAnchors).flat();
  assert.equal(anchored.length, RULES.length, 'every rule is anchored once');
  assert.deepEqual(
    [...anchored].sort(alphabetical),
    [...RULES].sort(alphabetical),
  );
  for (const rule of RULES)
    assert.ok(paragraphAnchors[ruleTopic[rule]].includes(rule), rule);
  // Eight of nineteen, and the site says so in words rather than as a ratio.
  assert.equal(drilledTopics.length, 8);
  for (const id of TOPIC_IDS)
    assert.equal(
      drilledTopics.includes(id),
      paragraphAnchors[id].length > 0,
      id,
    );
});

test('Each topic plays on exactly one bench, and the two sets cover all of them', () => {
  const engraved = Object.keys(notationLessonPresets);
  assert.equal(engraved.length + toneBedTopics.length, TOPIC_IDS.length);
  for (const id of engraved)
    assert.ok(!toneBedTopics.includes(id), `${id} is on both benches`);
  for (const id of TOPIC_IDS)
    assert.ok(
      engraved.includes(id) || toneBedTopics.includes(id),
      `${id} is on neither bench`,
    );
  // The seven without an engraving are the ones whose play link has to read
  // "hear this pitch" instead of "open in the notes lab".
  assert.deepEqual([...toneBedTopics].sort(alphabetical), [
    'chords',
    'dynamics',
    'intervals',
    'scales',
    'sound',
    'timbre',
    'tuning',
  ]);
  // Every topic can open a bench at all: the tone bench needs a frequency.
  for (const id of toneBedTopics) {
    const lesson = lessons.find((entry) => entry.id === id);
    assert.ok(Number.isFinite(lesson.hz), `${id} has no pitch to sound`);
  }
});
