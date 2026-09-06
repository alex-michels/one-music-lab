import { test } from 'vitest';
import assert from 'node:assert/strict';
import { browserEngines, selectedEngines } from '../vitest.config.ts';

// Which engines a run covers decides what the result is worth, so the rule is
// asserted rather than left to a comment.

// The value is always passed explicitly: reading the ambient OML_BROWSERS here
// would make the result depend on how the suite itself was started.
test('A release is checked against the three engines by default', () => {
  assert.deepEqual([...browserEngines], ['chromium', 'firefox', 'webkit']);
  for (const unset of ['', '  ', ',']) {
    assert.deepEqual(
      selectedEngines(unset, false),
      ['chromium', 'firefox', 'webkit'],
      JSON.stringify(unset),
    );
  }
});

test('A machine that cannot launch an engine may narrow the run', () => {
  assert.deepEqual(selectedEngines('chromium,webkit', false), [
    'chromium',
    'webkit',
  ]);
  assert.deepEqual(selectedEngines(' firefox , chromium ', false), [
    'firefox',
    'chromium',
  ]);
});

test('A misspelled engine stops the run instead of silently shrinking it', () => {
  assert.throws(
    () => selectedEngines('chrome', false),
    /unknown engines: chrome/,
  );
  assert.throws(
    () => selectedEngines('chromium,safari', false),
    /unknown engines: safari/,
  );
});

test('Measuring coverage narrows to the engine the provider supports', () => {
  // The v8 provider refuses a multi-engine browser setup, so the coverage run
  // measures Chromium and the matrix run covers the rest.
  assert.deepEqual(selectedEngines('', true), ['chromium']);
  // An explicit request still wins, so the limitation cannot hide a choice.
  assert.deepEqual(selectedEngines('webkit', true), ['webkit']);
});
