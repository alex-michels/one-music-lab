import { test } from 'vitest';
import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  authoredProductionCode,
  modifiedCopies,
  unchangedCopies,
} from '../vitest.config.ts';

const root = fileURLToPath(new URL('../', import.meta.url));
const posix = (path) => path.split('\\').join('/');
const expand = (patterns) =>
  new Set(
    patterns.flatMap((pattern) => globSync(pattern, { cwd: root })).map(posix),
  );

const inventory = JSON.parse(
  readFileSync(root + 'docs/ui-provenance.json', 'utf8'),
);
// What the report actually measures: the authored globs plus the copies we
// changed, minus the untouched copies those globs happen to sweep up.
const covered = expand([...authoredProductionCode, ...modifiedCopies]);
for (const path of unchangedCopies) covered.delete(path);

test('Every authored source file is inside the coverage denominator', () => {
  // An unloaded or awkward file must show up at 0%, never vanish from the
  // report. Imported copies we never touched are the one separate category.
  const authored = globSync(
    [
      'app/**/*.{ts,tsx}',
      'components/**/*.{ts,tsx}',
      'hooks/**/*.{ts,tsx}',
      'lib/**/*.{ts,tsx}',
    ],
    { cwd: root },
  )
    .map(posix)
    .filter((path) => inventory.files[path]?.status !== 'unchanged');

  assert.ok(authored.length > 0, 'the search found source files at all');
  const missing = authored.filter((path) => !covered.has(path));
  assert.deepEqual(
    missing,
    [],
    'add new authored files to authoredProductionCode in vitest.config.ts',
  );
});

test('Imported copies follow their provenance classification', () => {
  const classified = Object.entries(inventory.files);
  assert.deepEqual(
    modifiedCopies,
    classified
      .filter(([, record]) => record.status === 'modified')
      .map(([path]) => path)
      .sort(),
    'locally changed copies are maintained here, so they are measured here',
  );
  assert.deepEqual(
    unchangedCopies,
    classified
      .filter(([, record]) => record.status === 'unchanged')
      .map(([path]) => path)
      .sort(),
  );

  for (const path of modifiedCopies) {
    assert.ok(covered.has(path), `${path} must be measured`);
  }
  for (const path of unchangedCopies) {
    assert.ok(
      !covered.has(path),
      `${path} is untouched vendor code and is reported separately`,
    );
  }
});

test('The denominator names the authored configuration explicitly', () => {
  for (const path of ['next.config.ts', 'vite.config.ts']) {
    assert.ok(
      authoredProductionCode.includes(path),
      `${path} is executable project configuration and belongs in the list`,
    );
  }
});
