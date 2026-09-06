import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const roadmap = readFileSync(
  new URL('../ROADMAP.md', import.meta.url),
  'utf8',
).replace(/\r\n/g, '\n');
const curriculum = roadmap
  .split('## 6. Последовательность учебных выпусков\n')[1]
  ?.split('## 7. Источники:')[0];
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

await test('Every original topic is represented exactly once by a completion checkbox', () => {
  assert.ok(curriculum, 'The single curriculum checklist must exist');
  const actual = [
    ...curriculum.matchAll(/^- \[[ x]\] (\d+\.\d+|[A-D]\d+) — .+$/gm),
  ].map((match) => match[1]);
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
});

await test('Each curriculum module has four delivery layers and separate ready/published gates', () => {
  const modules = [
    ...curriculum.matchAll(
      /^### ([A-Z]\d{2}) — (.+)\n([\s\S]*?)(?=^### |$(?![\s\S]))/gm,
    ),
  ];
  assert.ok(modules.length > 0);
  assert.equal(new Set(modules.map((m) => m[1])).size, modules.length);
  for (const [, code, , body] of modules) {
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
      /^- \[[ x]\] (\d+\.\d+|[A-D]\d+) — /m,
      `${code} must map original topics`,
    );
    const sourceLine = body.match(
      /Источники для разработки: (S\d{2}(?:,S\d{2})*)\./,
    )?.[1];
    assert.ok(sourceLine, `${code} needs source leads`);
    for (const source of sourceLine.split(',')) {
      assert.ok(
        roadmap.includes(`| ${source} |`),
        `${code} refers to unknown source ${source}`,
      );
    }
  }
});

await test('Curriculum prerequisites resolve and contain no cycles', () => {
  const graph = new Map(
    [
      ...curriculum.matchAll(
        /^### ([A-Z]\d{2}) — .+\n+Зависимости: ([^.]+)\./gm,
      ),
    ].map(([, id, deps]) => [id, deps === '—' ? [] : deps.split(',')]),
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
