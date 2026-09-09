import { test, expect } from 'vitest';
import {
  signature,
  underSignature,
  ottava,
} from '../lib/notation-workbench.ts';
import { generateFrom, grade, exerciseKinds } from '../lib/exercises.ts';
import {
  notationProgramme,
  notationReferences,
} from '../lib/notation-programme.ts';
import { lessons, terms } from '../lib/learning.ts';
import { planNotationExample } from '../lib/notation-experiments.ts';
import {
  figures,
  figureScore,
  generateFigures,
} from '../scripts/notation-figures.mjs';
import rendered from '../lib/notation-figures.json';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';

const c4 = { letter: 0, accidental: 0, octave: 4, midi: 60 };
test('Signatures follow the fifths order, and explicit signs replace rather than add', () => {
  expect(signature(7).map((x) => x.letter)).toEqual([3, 0, 4, 1, 5, 2, 6]);
  expect(signature(-7).map((x) => x.letter)).toEqual([6, 2, 5, 1, 4, 0, 3]);
  expect(signature(0)).toEqual([]);
  for (let count = -7; count <= 7; count++) {
    for (const explicit of [-2, -1, 0, 1, 2]) {
      expect(underSignature(c4, count, explicit).midi).toBe(60 + explicit);
      expect(
        underSignature({ ...c4, octave: 5, midi: 72 }, count, explicit).midi,
      ).toBe(72 + explicit);
    }
  }
  expect(underSignature(c4, 2, null).midi).toBe(61);
  expect(underSignature({ ...c4, octave: 5, midi: 72 }, 2, null).midi).toBe(73);
  expect(underSignature(c4, -6, null).midi).toBe(59);
  expect(underSignature(c4, 1, null).midi).toBe(60);
  for (const value of [-8, 8, 0.5, NaN, Infinity]) {
    expect(() => signature(value)).toThrow(RangeError);
    expect(() => underSignature(c4, value, 0)).toThrow(RangeError);
  }
  expect(() => underSignature(c4, 0, 3)).toThrow(RangeError);
  expect(() => underSignature({ ...c4, midi: 61 }, 0, null)).toThrow(
    RangeError,
  );
});

test('Ottava preserves spelling and changes one or two registers without wrapping boundaries', () => {
  for (const shift of [-2, -1, 0, 1, 2])
    expect(ottava(c4, shift)).toEqual({
      ...c4,
      octave: 4 + shift,
      midi: 60 + 12 * shift,
    });
  for (const value of [-3, 3, NaN, 0.5])
    expect(() => ottava(c4, value)).toThrow(RangeError);
  expect(() => ottava({ ...c4, octave: 0, midi: 12 }, -1)).toThrow(RangeError);
  expect(() => ottava({ ...c4, octave: 8, midi: 108 }, 1)).toThrow(RangeError);
});

test('Every source-PDF lesson is taught, playable and connected to its permanent topic numbers', () => {
  expect(Object.keys(notationProgramme)).toHaveLength(13);
  expect(notationProgramme['accidental-signs'].tasks).toEqual(['014']);
  expect(notationProgramme['accidental-scope'].tasks).toEqual(['014']);
  expect(notationProgramme.enharmonics.tasks).toEqual(['014']);
  expect(notationProgramme['beat-division'].tasks).toEqual(['023', '024']);
  expect(exerciseKinds).toHaveLength(14);
  for (const [topic, chapter] of Object.entries(notationProgramme)) {
    expect(lessons.some((lesson) => lesson.id === topic)).toBe(true);
    for (const lang of ['en', 'ru', 'de'])
      expect(chapter.text[lang].length).toBeGreaterThan(100);
    for (const id of chapter.figures) expect(rendered[id]).toContain('<svg');
  }
  for (const title of [
    'Tablature',
    'Graphic notation',
    'Figured bass',
    'Trill',
    'Turn',
    'Grace note',
    'After-grace',
    'Slide ornament',
    'Chant divisions',
    'Multi-measure rest',
  ])
    expect(notationReferences.some((entry) => entry.title.en === title)).toBe(
      true,
    );
  expect(
    terms.filter((term) => term.lesson === 'articulation').length,
  ).toBeGreaterThan(12);
  const enhanced = Object.values(notationProgramme)
    .map((x) => x.text.en)
    .join(' ');
  expect(enhanced).toContain('13:12');
  expect(enhanced).toContain('88-key');
  expect(enhanced).toContain('historical vocal');
  expect(lessons.find((x) => x.id === 'tempo').formula.en).not.toContain(
    'Adagio',
  );
  expect(
    lessons.find((x) => x.id === 'enharmonics').paragraphs[1].en,
  ).not.toContain('tends');
});

test('Duration questions distinguish whole-bar rests from fractions, all the way to 128ths', () => {
  const observed = new Set();
  for (let seed = 0; seed < 700; seed++)
    for (const level of [1, 2, 3]) {
      const item = generateFrom('value-identification', level, seed, 'en');
      observed.add(item.figure);
      const answer = item.figure.startsWith('whole-bar')
        ? item.figure.endsWith('3')
          ? '3/4'
          : '6/8'
        : `1/${item.figure.split('-')[1]}`;
      expect(item.answer).toBe(answer);
      expect(grade(item, answer).correct).toBe(true);
    }
  for (const prefix of ['note', 'rest'])
    for (const den of [1, 2, 4, 8, 16, 32, 64, 128])
      expect(observed.has(`${prefix}-${den}`)).toBe(true);
  expect(observed.has('whole-bar-3')).toBe(true);
  expect(observed.has('whole-bar-6')).toBe(true);
});

test('Tempo, dynamic and repeat answers use independent arithmetic and route oracles', () => {
  const seen = new Set();
  const unitsSeen = new Set();
  const routesSeen = new Set();
  const ladder = [
    'pppp',
    'ppp',
    'pp',
    'p',
    'mp',
    'mf',
    'f',
    'ff',
    'fff',
    'ffff',
  ];
  for (let seed = 0; seed < 400; seed++) {
    const item = generateFrom('performance-marks', 3, seed, 'en');
    seen.add(item.rule);
    if (item.review) {
      expect(item.options).toEqual([]);
      expect(() => grade(item, 'anything')).toThrow(/Reflection/);
    } else if (item.rule === 'metronome-unit') {
      const [, glyph, bpm, num, den] = item.prompt.match(
        /At (.+) = (\d+).*does (\d+)\/(\d+)/,
      );
      unitsSeen.add(glyph);
      const units = { '♩': 1 / 4, '♪': 1 / 8, '♩.': 3 / 8, '𝅗𝅥': 1 / 2 };
      expect(Number(item.answer)).toBe(
        ((Number(num) / Number(den) / units[glyph]) * 60) / Number(bpm),
      );
    } else if (item.rule === 'relative-dynamic-level') {
      const mark = item.prompt.match(/than (\w+) in/)[1];
      expect(ladder.indexOf(item.answer)).toBeGreaterThan(ladder.indexOf(mark));
      expect(
        item.options.filter(
          (o) => ladder.indexOf(o.label) > ladder.indexOf(mark),
        ),
      ).toHaveLength(1);
    } else if (item.rule === 'follow-repeat-route') {
      routesSeen.add(item.figure);
      const routes = {
        'repeat-volta': [1, 2, 1, 3],
        'repeat-implicit': [1, 2, 1, 2],
        'repeat-dc-fine': [1, 2, 3, 1, 2],
        'repeat-ds-coda': [1, 2, 3, 4, 2, 3, 5],
        'repeat-abbreviation': [1, 1, 3],
      };
      expect(item.answer.split('–').map(Number)).toEqual(routes[item.figure]);
    } else
      expect(item.answer).toBe(
        item.figure === 'detached' ? 'Detached notes' : 'Held notes',
      );
  }
  expect(seen.size).toBe(4);
  expect(unitsSeen.size).toBe(4);
  expect(routesSeen.size).toBe(5);
});

test('Level-one excerpts preserve four natural quarters in EN/RU/DE, including H and octave boundaries', () => {
  for (const lang of ['en', 'ru', 'de'])
    for (let seed = 1; seed < 90; seed++) {
      const item = generateFrom('short-excerpt', 1, seed, lang);
      expect(item.parts).toHaveLength(4);
      expect(item.staff.barlines).toEqual([3]);
      item.parts.forEach((part, i) => {
        const { letter, octave } = item.staff.pitches[i];
        if (lang === 'en')
          expect(part.answer).toBe(
            `${['C', 'D', 'E', 'F', 'G', 'A', 'B'][letter]}${octave}`,
          );
        else if (lang === 'ru')
          expect(part.answer).toBe(
            `${['до', 'ре', 'ми', 'фа', 'соль', 'ля', 'си'][letter]}, ${['субконтроктава', 'контроктава', 'большая октава', 'малая октава', 'первая октава', 'вторая октава', 'третья октава', 'четвёртая октава', 'пятая октава'][octave]}`,
          );
        else
          expect(part.answer.toLowerCase()).toContain(
            ['c', 'd', 'e', 'f', 'g', 'a', 'h'][letter],
          );
        expect(part.options.filter((o) => o.id === part.answer)).toHaveLength(
          1,
        );
      });
    }
});

test('Reflection asks for reasons and deliberately refuses numeric grading', () => {
  for (const kind of ['beaming-review', 'ornament-review'])
    for (const lang of ['en', 'ru', 'de'])
      for (let seed = 1; seed < 20; seed++) {
        const item = generateFrom(kind, 2, seed, lang);
        expect(item.review).toBe(true);
        expect(item.explanation.length).toBeGreaterThan(60);
        expect(item.options).toEqual([]);
        expect(() => grade(item, 'correct')).toThrow(/Reflection/);
      }
});

test('Dynamics change gain only, with a bound set by the existing volume control', () => {
  const soft = planNotationExample('soft', 60),
    strong = planNotationExample('strong', 60);
  expect(soft.midis).toEqual(strong.midis);
  expect(soft.duration).toBe(strong.duration);
  expect(soft.gain).toBe(0.25);
  expect(strong.gain).toBe(1);
});

test('Committed original teaching figures regenerate and reject unknown requests', async () => {
  expect(Object.keys(rendered).sort()).toEqual(Object.keys(figures).sort());
  expect(() => figureScore('uploaded-unsafe')).toThrow(RangeError);
  await expect(generateFigures('bad-mode')).rejects.toThrow(RangeError);
  const committed = new URL('../lib/notation-figures.json', import.meta.url);
  const before = await readFile(committed, 'utf8');
  const argv = process.argv;
  try {
    process.argv = ['node', 'scripts/generate-notation-figures.mjs', '--check'];
    await import('../scripts/generate-notation-figures.mjs');
  } finally {
    process.argv = argv;
  }
  expect(await readFile(committed, 'utf8')).toBe(before);
  const target = new URL(
    '../outputs/notation-558/test-figures.json',
    import.meta.url,
  );
  await mkdir(new URL('../outputs/notation-558/', import.meta.url), {
    recursive: true,
  });
  await generateFigures('--write', target);
  await generateFigures('--check', target);
  await writeFile(target, '{}');
  await expect(generateFigures('--check', target)).rejects.toThrow(/drifted/);
  await rm(target);
});

test('Ornament review crosses modern signs with different pitches and clefs', () => {
  const seen = new Set();
  for (let seed = 1; seed < 300; seed++) {
    const item = generateFrom('ornament-review', 2, seed, 'en');
    seen.add(item.figure);
    expect(rendered[item.figure]).toContain('<svg');
    if (item.figure.endsWith('-f3'))
      expect(figureScore(item.figure)).toContain(
        'clef.shape="F" clef.line="4"',
      );
  }
  expect(seen.size).toBe(17);
  for (const id of [
    'upper-mordent',
    'long-grace',
    'after-grace',
    'slide',
    'arpeggio',
  ])
    expect(seen.has(id)).toBe(true);
  expect(figureScore('example-repeated').match(/<measure /g)).toHaveLength(2);
  expect(figureScore('example-ending').match(/<measure /g)).toHaveLength(2);
  for (const entry of notationReferences)
    expect(entry.source.url).toMatch(/^https:/);
});
