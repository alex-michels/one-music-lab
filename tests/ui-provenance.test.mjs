import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const inventory = JSON.parse(
  await readFile(join(root, 'docs/ui-provenance.json'), 'utf8'),
);

test('Every copied UI/helper file has an explicit provenance classification', async () => {
  assert.equal(inventory.schemaVersion, 1);
  assert.match(inventory.baselineCommit, /^[a-f0-9]{40}$/);
  const entries = await readdir(join(root, 'components/ui'), {
    recursive: true,
    withFileTypes: true,
  });
  const actual = ['hooks/use-mobile.ts', 'lib/utils.ts'];
  for (const entry of entries) {
    assert.ok(
      !entry.isSymbolicLink(),
      'Copied code must not escape the audited directory',
    );
    if (entry.isFile() && /\.[cm]?[jt]sx?$/.test(entry.name)) {
      actual.push(
        relative(root, join(entry.parentPath, entry.name)).replaceAll(
          '\\',
          '/',
        ),
      );
    }
  }
  assert.deepEqual(
    Object.keys(inventory.files).sort(),
    actual.sort(),
    'Classify added/removed copies in the same PR; do not silently exclude them',
  );
});

test('Locally changed copies cannot be classified as unchanged vendor code', async () => {
  const notices = await readFile(join(root, 'THIRD-PARTY-NOTICES.md'), 'utf8');
  for (const [path, record] of Object.entries(inventory.files)) {
    assert.match(record.baselineSha256, /^[a-f0-9]{64}$/, path);
    const source = (await readFile(join(root, path), 'utf8')).replaceAll(
      '\r\n',
      '\n',
    );
    const currentHash = createHash('sha256').update(source).digest('hex');
    const expected =
      currentHash === record.baselineSha256 ? 'unchanged' : 'modified';
    assert.equal(
      record.status,
      expected,
      `${path}: update the provenance record and modification notice`,
    );
    if (expected === 'modified') {
      assert.ok(
        notices.includes('`' + path + '`'),
        `${path}: missing modification notice`,
      );
    }
  }
});
