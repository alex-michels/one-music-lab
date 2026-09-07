import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const roadmap = readFileSync(
  new URL('../ROADMAP.md', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');
const root = fileURLToPath(new URL('../', import.meta.url));
const read = (path) =>
  readFileSync(resolve(root, path), 'utf8').replace(/\r\n/g, '\n');
const curriculumFiles = readdirSync(resolve(root, 'docs/curriculum')).map(
  (file) => `docs/curriculum/${file}`,
);
const sources = read('docs/sources.md');
const guide = read('docs/roadmap-guide.md');
const taskPattern = /^- \[([ x])\] \*\*(\d{3,})\.\*\* \[(.+)\]\(([^)]+)\)$/gm;
const tasks = [...roadmap.matchAll(taskPattern)].map(
  ([, state, id, title, detail]) => ({ state, id, title, detail }),
);
const aliases = [
  ...guide.matchAll(/^\| (\d{3,}) \| ([\w./]+) \| ([A-Z]\d{2}) \|$/gm),
].map(([, id, old, module]) => ({ id, old, module }));
const byId = new Map(tasks.map((task) => [task.id, task]));
const modules = curriculumFiles.flatMap((file) =>
  [
    ...read(file).matchAll(
      /^## ([A-Z]\d{2})\n([\s\S]*?)(?=^## |$(?![\s\S]))/gm,
    ),
  ].map(([, code, body]) => ({ code, body, file })),
);
const supportingFiles = [
  ...curriculumFiles,
  'docs/roadmap-guide.md',
  'docs/engineering.md',
  'docs/release-criteria.md',
  'docs/releases.md',
  'docs/sources.md',
  'docs/project-audit.md',
  'docs/infrastructure-decisions.md',
];
const phaseCounts = [40, 28, 30, 22, 31, 29, 42, 31, 40, 30, 64, 20, 16, 17];
const trackCounts = { A: 25, B: 14, C: 16, D: 16 };
const expectedIds = [
  ...phaseCounts.flatMap((count, index) =>
    Array.from({ length: count }, (_, n) => `${index + 1}.${n + 1}`),
  ),
  ...Object.entries(trackCounts).flatMap(([track, count]) =>
    Array.from({ length: count }, (_, n) => `${track}${n + 1}`),
  ),
];

test('Every original topic is represented exactly once by a completion checkbox', () => {
  const topicAliases = aliases.filter((a) =>
    /^(\d+\.\d+|[A-D]\d+)$/.test(a.old),
  );
  const actual = topicAliases.map((a) => a.old);
  assert.equal(expectedIds.length, 511);
  assert.equal(
    actual.length,
    expectedIds.length,
    'No topic may be silently dropped or duplicated',
  );
  const compareIds = (left, right) => left.localeCompare(right, 'en');
  assert.deepEqual(
    [...actual].sort(compareIds),
    [...expectedIds].sort(compareIds),
  );
  assert.equal(new Set(actual).size, actual.length);
  const detailedIds = [];
  for (const entry of modules) {
    const ids = [...entry.body.matchAll(/^- (\d+\.\d+|[A-D]\d+) — .+$/gm)].map(
      (m) => m[1],
    );
    assert.ok(ids.length, entry.code);
    detailedIds.push(...ids);
    assert.deepEqual(
      topicAliases
        .filter((a) => a.module === entry.code)
        .map((a) => a.old)
        .sort(),
      [...ids].sort(),
    );
    for (const old of ids) {
      const alias = topicAliases.find((a) => a.old === old);
      assert.equal(
        byId.get(alias.id).detail,
        `${entry.file}#${entry.code.toLowerCase()}`,
      );
    }
  }
  assert.deepEqual(detailedIds.sort(), [...expectedIds].sort());
  assert.equal(topicAliases.find((a) => a.old === '2.3').id, '003');
  assert.equal(topicAliases.find((a) => a.old === '2.1').id, '012');
});

test('Each curriculum module has four delivery layers and separate ready/published gates', () => {
  assert.equal(modules.length, 128);
  assert.equal(new Set(modules.map((m) => m.code)).size, modules.length);
  for (const { code, body } of modules) {
    for (const label of [
      'Теория:',
      'Лаборатория:',
      'Тренажёр:',
      'Энциклопедия:',
      'G — готово к публикации:',
      'Опубликовано владельцем:',
    ]) {
      assert.ok(body.includes(`**${label}**`), `${code} lacks ${label}`);
    }
    assert.match(
      body,
      /^- (\d+\.\d+|[A-D]\d+) — /m,
      `${code} must map original topics`,
    );
    const sourceLine = body.match(
      /Источники для разработки: (S\d{2}(?:,S\d{2})*)\./,
    )?.[1];
    assert.ok(sourceLine, `${code} needs source leads`);
    for (const source of sourceLine.split(',')) {
      assert.ok(
        sources.includes(`| ${source} |`),
        `${code} refers to unknown source ${source}`,
      );
    }
  }
});

test('Curriculum prerequisites resolve and contain no cycles', () => {
  const graph = new Map(
    modules.map(({ code, body }) => {
      const deps = body.match(/Зависимости: ([^.]+)\./)?.[1];
      assert.ok(deps, `${code} must state prerequisites`);
      return [code, deps === '—' ? [] : deps.split(',')];
    }),
  );
  assert.ok(graph.has('F01'));
  assert.deepEqual(graph.get('F01'), []);
  const visited = new Set();
  const active = new Set();
  function visit(id) {
    assert.ok(graph.has(id), `Unknown prerequisite ${id}`);
    assert.ok(!active.has(id), `Dependency cycle through ${id}`);
    if (visited.has(id)) return;
    active.add(id);
    for (const dependency of graph.get(id)) visit(dependency);
    active.delete(id);
    visited.add(id);
  }
  for (const id of graph.keys()) visit(id);
  assert.equal(visited.size, graph.size);
});

test('Roadmap contains only grouped tasks with unique, continuous numbers', () => {
  assert.equal(new Set(tasks.map((task) => task.id)).size, tasks.length);
  assert.deepEqual(
    tasks.map((task) => Number(task.id)).sort((a, b) => a - b),
    Array.from({ length: tasks.length }, (_, i) => i + 1),
    'Numbers cannot be dropped, duplicated or restarted within a section',
  );
  assert.equal(
    roadmap
      .replace(taskPattern, '')
      .replace(/^# One Music Lab — Roadmap$/m, '')
      .replace(/^\[x\] — сделано; \[ \] — не сделано\..+$/m, '')
      .replace(/^## .+$/gm, '')
      .trim(),
    '',
    'Move audit and acceptance prose to docs',
  );
  assert.ok(tasks.length >= 714);
  for (const task of tasks) assert.ok(task.title.length < 180, task.id);
  assert.equal(aliases.length, tasks.length);
  assert.deepEqual(aliases.map((a) => a.id).sort(), [...byId.keys()].sort());
  assert.equal(new Set(aliases.map((a) => a.old)).size, aliases.length);
});

test('Engineering aliases retain every group and resolve to their own requirements', () => {
  const groupSizes = [13, 5, 7, 6, 9, 8, 4, 4, 6, 3, 10];
  const expected = groupSizes.flatMap((count, n) =>
    Array.from(
      { length: count },
      (_, i) => `P${String(n).padStart(2, '0')}/${i + 1}`,
    ),
  );
  const actual = aliases.filter((a) => /^P\d{2}\/\d+$/.test(a.old));
  assert.deepEqual(actual.map((a) => a.old).sort(), expected.sort());
  for (const { id, old, module: group } of actual) {
    assert.equal(group, old.split('/')[0]);
    assert.equal(byId.get(id).detail, `docs/engineering.md#task-${id}`);
    assert.ok(read('docs/engineering.md').includes(`### task-${id}\n`));
  }
});

test('Publication has its own task and cannot precede completion of its topics', () => {
  const releases = aliases.filter((a) => a.old.endsWith('/publication'));
  assert.equal(releases.length, modules.length);
  assert.deepEqual(
    releases.map((a) => a.module).sort(),
    modules.map((m) => m.code).sort(),
  );
  for (const release of releases) {
    const task = byId.get(release.id);
    assert.equal(
      task.detail,
      `docs/releases.md#${release.module.toLowerCase()}`,
    );
    const topics = aliases.filter(
      (a) => a.module === release.module && a !== release,
    );
    assert.ok(topics.every((a) => a.id !== release.id));
    if (task.state === 'x') {
      assert.ok(
        topics.every((a) => byId.get(a.id).state === 'x'),
        release.module,
      );
    }
  }
});

test('Requirements and audit are not competing completion registers; all sources survive', () => {
  for (const file of supportingFiles)
    assert.doesNotMatch(read(file), /^\s*- \[[ x]\]/m, file);
  const sourceIds = [...sources.matchAll(/^\| (S\d{2}) \|/gm)].map((m) => m[1]);
  assert.equal(new Set(sourceIds).size, sourceIds.length);
  for (let n = 1; n <= 34; n++)
    assert.ok(sourceIds.includes(`S${String(n).padStart(2, '0')}`));
  assert.ok(read('docs/release-criteria.md').includes('EN/RU/DE'));
});

test('Local documentation links and section anchors resolve', () => {
  for (const file of ['ROADMAP.md', ...supportingFiles]) {
    for (const [, link] of read(file).matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
      if (/^(https?:|mailto:)/.test(link)) continue;
      const [path, anchor] = link.split('#');
      const target = path
        ? resolve(root, dirname(file), path)
        : resolve(root, file);
      assert.ok(existsSync(target), `${file}: missing ${link}`);
      if (!anchor) continue;
      const headings = [
        ...readFileSync(target, 'utf8').matchAll(/^#{1,6} (.+)$/gm),
      ].map((m) =>
        m[1]
          .trim()
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s_-]/gu, '')
          .replace(/\s/g, '-'),
      );
      assert.ok(
        headings.includes(decodeURIComponent(anchor)),
        `${file}: missing #${anchor} in ${path}`,
      );
    }
  }
});
