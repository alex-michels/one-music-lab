import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect } from 'vitest';
import { contentCatalog as catalog, bundles } from '../lib/content/catalog.ts';
import { contentProblems } from '../lib/content/validate.ts';
import { catalogSchema } from '../lib/content/schema.ts';
import * as view from '../lib/content/adapters.ts';
import * as aliases from '../lib/content/references.ts';
import { TOPIC_IDS, NOTATION_TOPIC_IDS } from '../lib/content/ids.ts';
import { course, chapters } from '../lib/course.ts';
import { RULES } from '../lib/exercises.ts';
import { notationGroups } from '../lib/notation-experiments.ts';
import { notationForwardLinks } from '../lib/notation-programme.ts';
import { termAnchor } from '../lib/topics.ts';

const copy = () => structuredClone(catalog);
const canonical = (value) =>
  Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === 'object'
      ? Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, canonical(value[key])]),
        )
      : value;
const digest = (value) =>
  createHash('sha256')
    .update(JSON.stringify(canonical(value)))
    .digest('hex');
const reading = (value) =>
  value.lessons.find((lesson) => lesson.reading?.assetIds.length);
const generated = (value) =>
  value.exercises.find((exercise) => exercise.kind === 'generated');
const diagnostic = (value) =>
  value.exercises.filter((exercise) => exercise.kind === 'diagnostic');

test('The complete file catalog passes the seven-entity schema and graph checks without transforming its text', () => {
  expect(contentProblems(catalog)).toEqual([]);
  expect(catalogSchema.parse(catalog)).toEqual(catalog);
  expect(catalog.topics.map((topic) => topic.id)).toEqual([...TOPIC_IDS]);
  expect(catalog.lessons).toHaveLength(19);
  expect(catalog.experiments).toHaveLength(19);
  expect(catalog.concepts).toHaveLength(141);
  expect(
    catalog.exercises
      .filter((exercise) => exercise.kind === 'generated')
      .map((exercise) => exercise.id)
      .sort(),
  ).toEqual([...RULES].sort());
  expect(diagnostic(catalog)).toHaveLength(5);
  expect(bundles.map((bundle) => bundle.topic.id)).toEqual([...TOPIC_IDS]);
});

test('Migration preserves every published text, citation, Russian note marker, preset and chapter from the pre-migration Git revision', () => {
  const fixture = JSON.parse(
    readFileSync(
      new URL('./fixtures/content-v1.json', import.meta.url),
      'utf8',
    ),
  );
  const values = {
    lessons: view.lessons,
    terms: view.terms,
    programme: view.notationProgramme,
    figures: view.notationFigureDescriptions,
    references: view.notationReferences,
    sourceAliases: [
      aliases.notationSources,
      aliases.notationContentSources,
      aliases.notationTopicSources,
      aliases.notationTermSources,
    ],
    rules: [view.ruleTopic, view.ruleLabels, view.ruleKind],
    presets: view.notationLessonPresets,
    diagnostic: view.diagnosticQuestions,
    course,
  };
  for (const [key, value] of Object.entries(values))
    expect(digest(value), `${key} changed from ${fixture.base}`).toBe(
      fixture.digests[key],
    );
});

test('Renaming a localized headword never changes its permanent concept URL', () => {
  const concept = {
    ...catalog.concepts[0],
    title: { en: 'A revised title', ru: 'Новое название', de: 'Neuer Titel' },
  };
  expect(termAnchor(view.termView(concept))).toBe(
    encodeURIComponent(concept.id).replaceAll('~', '%7E'),
  );
  expect(view.termView(concept).title).toEqual(concept.title);
});

test('Prerequisites, forward modules and notation presets resolve to the existing book and actual laboratory controls', () => {
  for (const topic of catalog.topics) {
    const chapter = chapters.find((entry) => entry.lessons.includes(topic.id));
    expect(topic.prerequisites, topic.id).toEqual(chapter.prerequisites);
  }
  expect(
    catalog.lessons
      .filter((lesson) => lesson.reading)
      .map((lesson) => lesson.topicId),
  ).toEqual([...NOTATION_TOPIC_IDS]);
  expect(Object.keys(view.notationLessonPresets).sort()).toEqual(
    [...NOTATION_TOPIC_IDS].sort(),
  );
  for (const experiment of catalog.experiments.filter(
    (entry) => entry.notation,
  )) {
    expect(
      notationGroups.some((group) => group.id === experiment.notation.group),
    ).toBe(true);
    expect(
      catalog.topics.find((topic) => topic.id === experiment.topicId).module,
    ).toBeTruthy();
  }
  for (const concept of catalog.concepts)
    for (const moduleId of concept.forwardModules ?? [])
      expect(notationForwardLinks[moduleId], concept.id).toBeTruthy();
});

test('Every registered asset, source evidence path and rights notice exists; notation entries contain real SVG', () => {
  for (const source of catalog.sources)
    for (const path of source.evidence)
      expect(existsSync(resolve(path)), path).toBe(true);
  for (const asset of catalog.assets) {
    expect(existsSync(resolve(asset.path)), asset.id).toBe(true);
    for (const right of asset.rights)
      expect(existsSync(resolve(right.evidence)), right.evidence).toBe(true);
    if (asset.entry) {
      const file = JSON.parse(readFileSync(resolve(asset.path), 'utf8'));
      expect(file[asset.entry], asset.id).toMatch(/^<svg\b/);
    }
  }
  for (const lesson of catalog.lessons.filter((entry) => entry.reading))
    for (const id of lesson.reading.assetIds) {
      const asset = catalog.assets.find((entry) => entry.id === id);
      expect(asset.kind).toBe('notation-figure');
      expect(asset.entry).toBeTruthy();
    }
});

test('Migration does not silently certify old citations or invent evidence for unsourced concepts', () => {
  expect(catalog.concepts.filter((concept) => !concept.sourceId)).toHaveLength(
    12,
  );
  expect(
    catalog.sources.every(
      (source) => source.verification === 'inherited-unverified',
    ),
  ).toBe(true);
  expect(catalog.sources.some((source) => source.locator === null)).toBe(true);
  expect(
    catalog.sources.some((source) => source.url.includes('table-of-contents')),
  ).toBe(true);
  expect(
    catalog.assets
      .filter((asset) => asset.kind === 'notation-figure')
      .every((asset) =>
        asset.rights.some((right) => right.license === 'OFL-1.1'),
      ),
  ).toBe(true);
});

test.each([
  [
    'unsupported schema version',
    (c) => {
      c.schemaVersion = 2;
    },
    'schemaVersion',
  ],
  [
    'unknown field',
    (c) => {
      c.lessons[0].databaseId = 'extra';
    },
    'Unrecognized',
  ],
  [
    'missing locale',
    (c) => {
      delete c.lessons[0].title.de;
    },
    'title.de',
  ],
  [
    'blank locale',
    (c) => {
      c.lessons[0].title.ru = '  ';
    },
    'Empty text',
  ],
  [
    'unknown locale',
    (c) => {
      c.topics[0].locales.push('fr');
    },
    'locales',
  ],
  [
    'zero version',
    (c) => {
      c.topics[0].version = 0;
    },
    'version',
  ],
  [
    'fractional version',
    (c) => {
      c.sources[0].version = 1.5;
    },
    'version',
  ],
  [
    'blank ID',
    (c) => {
      c.concepts[0].id = '';
    },
    'Empty text',
  ],
  [
    'surrounding ID whitespace',
    (c) => {
      c.topics[0].id += ' ';
    },
    'whitespace',
  ],
  [
    'duplicate reference',
    (c) => {
      c.topics[0].lessonIds.push(c.topics[0].lessonIds[0]);
    },
    'Duplicate reference',
  ],
  [
    'Russian markup mismatch',
    (c) => {
      c.lessons[0].title.ruMarkup = '[[до]]';
    },
    'markup and plain text',
  ],
  [
    'unsafe source URL',
    (c) => {
      c.sources[0].url = 'javascript:alert(1)';
    },
    'url',
  ],
  [
    'missing rights',
    (c) => {
      c.assets[0].rights = [];
    },
    'rights',
  ],
  [
    'parent path',
    (c) => {
      c.assets[0].path = '../private.json';
    },
    'Repository-relative',
  ],
  [
    'nested parent path',
    (c) => {
      c.assets[0].path = 'lib/../private.json';
    },
    'Repository-relative',
  ],
  [
    'absolute path',
    (c) => {
      c.assets[0].path = '/private.json';
    },
    'Repository-relative',
  ],
  [
    'Windows path',
    (c) => {
      c.assets[0].path = 'C:/private.json';
    },
    'Repository-relative',
  ],
  [
    'waveform',
    (c) => {
      c.experiments[0].preset.wave = 'noise';
    },
    'wave',
  ],
  [
    'inaudible preset',
    (c) => {
      c.experiments[0].preset.hz = 19;
    },
    'hz',
  ],
  [
    'out-of-range preset',
    (c) => {
      c.experiments[0].preset.hz = 20001;
    },
    'hz',
  ],
  [
    'non-finite preset',
    (c) => {
      c.experiments[0].preset.hz = Infinity;
    },
    'hz',
  ],
  [
    'invalid written note',
    (c) => {
      c.experiments.find((e) => e.notation).notation.note.letter = 7;
    },
    'letter',
  ],
  [
    'invalid generator',
    (c) => {
      generated(c).generator = 'new-engine';
    },
    'generator',
  ],
  [
    'missing feedback',
    (c) => {
      delete diagnostic(c)[0].options[0].feedback;
    },
    'feedback',
  ],
  [
    'one diagnostic option',
    (c) => {
      diagnostic(c)[0].options.length = 1;
    },
    'options',
  ],
])('Schema rejects %s', (_name, mutate, message) => {
  const value = copy();
  mutate(value);
  expect(contentProblems(value).join('\n')).toContain(message);
});

test.each([
  'scopes',
  'topics',
  'lessons',
  'experiments',
  'exercises',
  'concepts',
  'sources',
  'assets',
])('Duplicate %s IDs cannot shadow an existing record', (collection) => {
  const value = copy();
  value[collection].push(value[collection][0]);
  expect(contentProblems(value).join('\n')).toContain(
    `${collection}: duplicate ID`,
  );
});

test.each([
  [
    'scope',
    (c) => {
      c.lessons[0].scopeId = 'missing';
    },
    'unknown scopes ID',
  ],
  [
    'prerequisite',
    (c) => {
      c.topics[0].prerequisites = ['missing'];
    },
    'unknown topics ID',
  ],
  [
    'self prerequisite',
    (c) => {
      c.topics[0].prerequisites = [c.topics[0].id];
    },
    'cycle',
  ],
  [
    'indirect prerequisite cycle',
    (c) => {
      c.topics[0].prerequisites = [c.topics[1].id];
      c.topics[1].prerequisites = [c.topics[0].id];
    },
    'cycle',
  ],
  [
    'missing owned lesson',
    (c) => {
      c.topics[0].lessonIds = ['missing'];
    },
    'unknown lessons ID',
  ],
  [
    'lesson in wrong topic',
    (c) => {
      c.topics[0].lessonIds = [c.lessons[1].id];
    },
    'belongs to',
  ],
  [
    'unlisted concept',
    (c) => {
      c.topics.find((t) => t.id === c.concepts[0].topicId).conceptIds = [];
    },
    'absent from topic',
  ],
  [
    'missing owner',
    (c) => {
      c.concepts[0].topicId = 'missing';
    },
    'unknown topics ID',
  ],
  [
    'lesson citation',
    (c) => {
      c.lessons[0].sourceId = 'missing';
    },
    'unknown sources ID',
  ],
  [
    'reading citation',
    (c) => {
      reading(c).reading.sourceId = 'missing';
    },
    'unknown sources ID',
  ],
  [
    'reading asset',
    (c) => {
      reading(c).reading.assetIds = ['missing'];
    },
    'unknown assets ID',
  ],
  [
    'missing experiment',
    (c) => {
      c.lessons[0].experimentId = 'missing';
    },
    'unknown experiments ID',
  ],
  [
    'wrong experiment',
    (c) => {
      c.lessons[0].experimentId = c.experiments[1].id;
    },
    'experiment belongs to another topic',
  ],
  [
    'exercise citation',
    (c) => {
      c.exercises[0].sourceIds = ['missing'];
    },
    'unknown sources ID',
  ],
  [
    'concept citation',
    (c) => {
      c.concepts[0].sourceId = 'missing';
    },
    'unknown sources ID',
  ],
  [
    'further citation',
    (c) => {
      c.concepts[0].furtherSourceIds = ['missing'];
    },
    'unknown sources ID',
  ],
  [
    'related topic',
    (c) => {
      c.concepts[0].relatedTopics = ['missing'];
    },
    'unknown topics ID',
  ],
  [
    'concept order collision',
    (c) => {
      c.concepts[1].order = c.concepts[0].order;
    },
    'duplicate order',
  ],
  [
    'diagnostic order collision',
    (c) => {
      diagnostic(c)[1].order = diagnostic(c)[0].order;
    },
    'duplicate diagnostic order',
  ],
  [
    'diagnostic option collision',
    (c) => {
      diagnostic(c)[0].options[1].id = diagnostic(c)[0].options[0].id;
    },
    'duplicate option ID',
  ],
  [
    'unanswerable diagnostic',
    (c) => {
      diagnostic(c)[0].answer = 'missing';
    },
    'answer is absent',
  ],
])('Graph rejects %s', (_name, mutate, message) => {
  const value = copy();
  mutate(value);
  expect(contentProblems(value).join('\n')).toContain(message);
});

test('Schema accepts boundary presets, literal prose and a consistent Russian note marker', () => {
  const value = copy();
  value.experiments[0].preset.hz = 20;
  value.experiments[1].preset.hz = 20000;
  value.lessons[0].title.ru = 'до';
  value.lessons[0].title.ruMarkup = '[[до]]';
  value.lessons[1].title.ru = 'От начала до конца';
  expect(contentProblems(value)).toEqual([]);
});
