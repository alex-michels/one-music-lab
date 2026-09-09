import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  DRILL_STORAGE_KEY,
  EMPTY_LEDGER,
  drawRule,
  ledgerFromStorage,
  recordAnswer,
  serializeLedger,
  sessionStorageOrNull,
} from '../lib/client-store.ts';
import { RULES } from '../lib/exercises.ts';
import { exerciseExplanations } from '../lib/learning.ts';

const TAGS = Object.keys(exerciseExplanations);
const vocabulary = { rules: RULES, tags: TAGS };
const holding = (text) => ({ getItem: () => text });

test('An answer is added to the rule it was asked about, and the ledger is never mutated', () => {
  const first = recordAnswer(EMPTY_LEDGER, 'dot-adds-half', {
    correct: false,
    tag: 'forgot-the-dot',
  });
  assert.equal(EMPTY_LEDGER.size, 0, 'the ledger passed in must be untouched');
  assert.deepEqual(first.get('dot-adds-half'), {
    asked: 1,
    missed: 1,
    tag: 'forgot-the-dot',
  });
  // A right answer counts the question and leaves the last mistake standing:
  // the row still has something to explain, which is what it is there for.
  const second = recordAnswer(first, 'dot-adds-half', {
    correct: true,
    tag: 'correct',
  });
  assert.deepEqual(second.get('dot-adds-half'), {
    asked: 2,
    missed: 1,
    tag: 'forgot-the-dot',
  });
  assert.equal(first.get('dot-adds-half').asked, 1);
  // A later mistake replaces the explanation, because it is the newer one.
  const third = recordAnswer(second, 'dot-adds-half', {
    correct: false,
    tag: 'added-wrong',
  });
  assert.equal(third.get('dot-adds-half').tag, 'added-wrong');
  assert.equal(third.get('dot-adds-half').missed, 2);
});

test('A ledger survives a round trip through storage', () => {
  const saved = recordAnswer(
    recordAnswer(EMPTY_LEDGER, 'tied-values-add', {
      correct: false,
      tag: 'added-wrong',
    }),
    'same-place-other-clef',
    { correct: true, tag: 'correct' },
  );
  const text = serializeLedger(saved);
  const read = ledgerFromStorage(holding(text), vocabulary);
  const byRule = (a, b) => a[0].localeCompare(b[0]);
  assert.deepEqual(
    [...read.entries()].sort(byRule),
    [...saved.entries()].sort(byRule),
  );
});

test('Nothing unreadable, unknown or impossible reaches a ledger row', () => {
  const cases = [
    [null, 'no saved value'],
    ['', 'an empty string'],
    ['{oh no', 'text that is not JSON'],
    ['[]', 'an array'],
    ['"a string"', 'a JSON string'],
    ['null', 'JSON null'],
    ['{"no-such-rule":{"asked":3,"missed":1,"tag":null}}', 'an unknown rule'],
    [
      '{"dot-adds-half":{"asked":-1,"missed":0,"tag":null}}',
      'a negative count',
    ],
    ['{"dot-adds-half":{"asked":1.5,"missed":0,"tag":null}}', 'a fraction'],
    ['{"dot-adds-half":{"asked":"3","missed":0,"tag":null}}', 'a numeral'],
    [
      '{"dot-adds-half":{"asked":1,"missed":2,"tag":null}}',
      'more misses than questions',
    ],
    ['{"dot-adds-half":null}', 'a null row'],
    ['{"dot-adds-half":{}}', 'a row with no counts'],
  ];
  for (const [text, why] of cases)
    assert.equal(
      ledgerFromStorage(holding(text), vocabulary).size,
      0,
      `${why} must not become a row`,
    );
  // A tag nobody emits is dropped without taking the counts with it: the
  // tally is still true, and the row simply has no explanation to show.
  const patched = ledgerFromStorage(
    holding('{"dot-adds-half":{"asked":2,"missed":1,"tag":"no-such-tag"}}'),
    vocabulary,
  );
  assert.deepEqual(patched.get('dot-adds-half'), {
    asked: 2,
    missed: 1,
    tag: null,
  });
});

test('Storage that throws on read is an empty ledger, not a crash', () => {
  const hostile = {
    getItem() {
      throw new DOMException('blocked');
    },
  };
  assert.equal(ledgerFromStorage(hostile, vocabulary).size, 0);
  assert.equal(ledgerFromStorage(undefined, vocabulary).size, 0);
  assert.equal(DRILL_STORAGE_KEY, 'oml-drill-session');
});

test('A missed rule is drawn twice as often as one that has not been missed', () => {
  const rules = ['dot-adds-half', 'tied-values-add'];
  const ledger = recordAnswer(EMPTY_LEDGER, 'dot-adds-half', {
    correct: false,
    tag: 'forgot-the-dot',
  });
  // Weights 2 and 1 over a total of 3: the first rule owns the first two
  // thirds of the roll and the second owns the last third.
  assert.equal(drawRule(rules, ledger, 0), 'dot-adds-half');
  assert.equal(drawRule(rules, ledger, 0.65), 'dot-adds-half');
  assert.equal(drawRule(rules, ledger, 0.67), 'tied-values-add');
  // Both ends of the range name a rule rather than falling off the list.
  assert.equal(drawRule(rules, ledger, 1), 'tied-values-add');
  assert.equal(drawRule(rules, ledger, -1), 'dot-adds-half');
  // With nothing missed the split is even.
  assert.equal(drawRule(rules, EMPTY_LEDGER, 0.49), 'dot-adds-half');
  assert.equal(drawRule(rules, EMPTY_LEDGER, 0.51), 'tied-values-add');
  assert.throws(() => drawRule([], EMPTY_LEDGER, 0), RangeError);
});

test('Every rule the drill can draw resolves to an explanation-bearing vocabulary', () => {
  // The ledger is keyed on Rule and the explanations are keyed on ErrorTag, so
  // the two lists have to stay the ones the component hands to storage.
  assert.ok(RULES.length > 0);
  assert.ok(TAGS.includes('correct'));
  assert.equal(sessionStorageOrNull(), globalThis.sessionStorage ?? null);
});
