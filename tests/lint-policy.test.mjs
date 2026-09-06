import { test } from 'vitest';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

test('Lint permits explicit list semantics but still rejects other redundant roles', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const directory = await mkdtemp(join(tmpdir(), 'oml-lint-policy-'));
  try {
    for (const [name, code, expected] of [
      ['ul-list', '<ul role="list"><li>A4</li></ul>', 0],
      ['ol-list', '<ol role="list"><li>A4</li></ol>', 0],
      ['native-list', '<ul><li>A4</li></ul>', 0],
      ['default-navigation', '<nav role="navigation">Lessons</nav>', 0],
      ['redundant-button', '<button role="button">Play</button>', 1],
      ['redundant-article', '<article role="article">Theory</article>', 1],
      ['redundant-listitem', '<ul><li role="listitem">A4</li></ul>', 1],
    ]) {
      const fixture = join(directory, name + '.jsx');
      await writeFile(
        fixture,
        `export default function Example() { return (${code}); }\n`,
      );
      const result = spawnSync(
        process.execPath,
        [
          join(root, 'node_modules/oxlint/bin/oxlint'),
          '--config',
          join(root, '.oxlintrc.json'),
          '--format',
          'json',
          fixture,
        ],
        { cwd: root, encoding: 'utf8', timeout: 30_000 },
      );
      assert.ifError(result.error);
      assert.equal(
        result.status,
        expected,
        `${name}: ${result.stdout}\n${result.stderr}`,
      );
      const report = JSON.parse(result.stdout);
      const violations = report.diagnostics.filter(
        (item) => item.code === 'jsx-a11y(no-redundant-roles)',
      );
      assert.equal(violations.length, expected, `${name}: ${result.stdout}`);
    }
  } finally {
    assert.ok(isAbsolute(directory));
    assert.equal(dirname(directory), tmpdir());
    assert.ok(basename(directory).startsWith('oml-lint-policy-'));
    await rm(directory, { recursive: true, force: true });
  }
});
