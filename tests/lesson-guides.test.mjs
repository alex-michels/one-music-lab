/** @vitest-environment jsdom */
import { afterEach, expect, test, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { contentCatalog } from '../lib/content/catalog.ts';
import { lessonGuides } from '../lib/content/adapters.ts';
import { lessonSchema } from '../lib/content/schema.ts';
import { contentProblems } from '../lib/content/validate.ts';
import { plainNoteText } from '../lib/note-text.ts';
import { readingOrder } from '../lib/course.ts';
import { lessons } from '../lib/learning.ts';
import { lessonListening } from '../lib/lesson-listening.ts';
import { Theory } from '../components/learning.tsx';

const LANGS = ['en', 'ru', 'de'];
const texts = (guide) => [
  ['question', guide.question],
  ...guide.example.map((step, i) => [`example ${i + 1}`, step]),
  ['listen', guide.listen],
  ['mistake', guide.mistake],
  ...guide.takeaways.map((point, i) => [`takeaway ${i + 1}`, point]),
];

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
async function mount(props) {
  container ??= document.body.appendChild(document.createElement('div'));
  root ??= createRoot(container);
  await act(() => root.render(createElement(Theory, props)));
}
afterEach(async () => {
  if (root) await act(() => root.unmount());
  container?.remove();
  root = container = null;
});

test('Every lesson of the book has a walk-through, and the catalogue accepts it', () => {
  expect(contentProblems(contentCatalog)).toEqual([]);
  expect(Object.keys(lessonGuides).sort()).toEqual([...readingOrder].sort());
  for (const lesson of contentCatalog.lessons)
    expect(lesson.guide, lesson.id).toBeDefined();
});

test('Each walk-through has the shape a reader is led through: one question, a few steps, one mix-up, a few things to keep', () => {
  for (const [topic, guide] of Object.entries(lessonGuides)) {
    expect(guide.example.length, `${topic} steps`).toBeGreaterThanOrEqual(3);
    expect(guide.example.length, `${topic} steps`).toBeLessThanOrEqual(5);
    expect(guide.takeaways.length, `${topic} takeaways`).toBeGreaterThanOrEqual(
      3,
    );
    expect(guide.takeaways.length, `${topic} takeaways`).toBeLessThanOrEqual(4);
    for (const lang of LANGS) {
      const question = guide.question[lang].trim();
      // One question, asked once.
      expect(question.endsWith('?'), `${topic} ${lang}: ${question}`).toBe(
        true,
      );
      expect(question.split('?').length - 1, `${topic} ${lang}`).toBe(1);
      expect(question.length, `${topic} ${lang} question`).toBeLessThanOrEqual(
        200,
      );
    }
  }
});

test('Walk-through text is complete, moderate in length and free of leftovers in all three languages', () => {
  const limit = {
    question: 200,
    example: 340,
    listen: 400,
    mistake: 460,
    takeaway: 240,
  };
  for (const [topic, guide] of Object.entries(lessonGuides))
    for (const [field, text] of texts(guide)) {
      const at = `${topic} · ${field}`;
      for (const lang of LANGS) {
        const value = text[lang];
        expect(value.trim(), `${at} ${lang}`).toBe(value);
        expect(value.length, `${at} ${lang}`).toBeGreaterThan(15);
        expect(value.length, `${at} ${lang}: ${value}`).toBeLessThanOrEqual(
          limit[field.split(' ')[0]],
        );
        // A teacher's voice, not a slogan; no markup or placeholders left in.
        expect(value, `${at} ${lang}`).not.toMatch(
          /!|\[\[|\]\]|\bTODO\b|\{\w+\}|\s{2,}/,
        );
        // A statement ends as one.
        expect(value, `${at} ${lang}`).toMatch(/[.?…»“"”)]$/);
      }
      // Three texts, not one text three times.
      expect(new Set(LANGS.map((lang) => text[lang])).size, at).toBe(3);
      // The italic markup always reduces to exactly the plain Russian text.
      if (text.ruMarkup) expect(plainNoteText(text.ruMarkup), at).toBe(text.ru);
    }
});

test('A walk-through names a listening example by the words on its button', () => {
  // What a guide puts in quotation marks in its steps and its listening line
  // is the label of a button beside it, in the reader's language. A renamed
  // button with the old name left in the text sends the reader looking for
  // something that is not there.
  const quoted = { en: /“([^”]+)”/g, ru: /«([^»]+)»/g, de: /„([^“]+)“/g };
  // The one quotation that is a term being introduced, not a button.
  const term = { en: 'octave', ru: 'октава', de: 'Oktave' };
  let checked = 0;
  for (const [topic, guide] of Object.entries(lessonGuides))
    for (const lang of LANGS) {
      const labels = lessonListening[topic].map((step) => step.label[lang]);
      for (const [field, text] of texts(guide)) {
        if (!/^(listen|example)/.test(field)) continue;
        for (const [, name] of text[lang].matchAll(quoted[lang])) {
          if (topic === 'note-names' && name === term[lang]) continue;
          expect(labels, `${topic} · ${field} ${lang}: ${name}`).toContain(
            name,
          );
          checked += 1;
        }
      }
    }
  // Not an empty check: most lessons name their examples this way.
  expect(checked).toBeGreaterThan(80);
  const articulation = lessonGuides.articulation;
  const lesson = lessons.find((entry) => entry.id === 'articulation');
  for (const lang of LANGS) {
    // The articulation lesson names both of its examples where it says what
    // to listen for, and one of them in its third step…
    expect([...articulation.listen[lang].matchAll(quoted[lang])]).toHaveLength(
      2,
    );
    expect([
      ...articulation.example[2][lang].matchAll(quoted[lang]),
    ]).toHaveLength(1);
    // …and its experiment instruction speaks of the same two by name.
    for (const step of lessonListening.articulation)
      expect(lesson.experiment[lang].toLowerCase()).toContain(
        step.label[lang].toLowerCase(),
      );
  }
});

test('Russian lesson text names equal temperament one way', () => {
  // «равномерная темперация» throughout; «равномерный строй» survives only as
  // a search alias of the glossary entry, so that either word finds it.
  const older = /равномерн\S* стро/;
  for (const [topic, guide] of Object.entries(lessonGuides))
    for (const [field, text] of texts(guide)) {
      expect(text.ru, `${topic} · ${field}`).not.toMatch(older);
      if (text.ruMarkup)
        expect(text.ruMarkup, `${topic} · ${field}`).not.toMatch(older);
    }
  for (const lesson of lessons)
    for (const text of [
      lesson.title,
      lesson.summary,
      lesson.formula,
      lesson.experiment,
      ...lesson.paragraphs,
    ])
      expect(text.ru, lesson.id).not.toMatch(older);
});

test('Each language keeps its own conventions in the walk-through', () => {
  for (const [topic, guide] of Object.entries(lessonGuides))
    for (const [field, text] of texts(guide)) {
      const at = `${topic} · ${field}`;
      // German addresses the reader as du: no formal imperative or possessive.
      expect(text.de, at).not.toMatch(/[a-zäöüß]+en Sie\b|\bIhre[mnrs]?\b/);
      // German and Russian write decimals with a comma (0,5 s, not 0.5 s).
      expect(text.de, at).not.toMatch(/\d\.\d/);
      expect(text.ru, at).not.toMatch(/\d\.\d/);
      // Russian quotes are guillemets, German quotes are „…“.
      expect(text.ru, at).not.toMatch(/["“”]/);
      expect(text.de, at).not.toMatch(/"/);
      // English keeps the decimal point.
      expect(text.en, at).not.toMatch(/\d,\d{1,2}(?!\d)/);
    }
});

test('A lesson without a walk-through is not a lesson the schema accepts', () => {
  const lesson = structuredClone(contentCatalog.lessons[0]);
  expect(lessonSchema.safeParse(lesson).success).toBe(true);
  delete lesson.guide;
  expect(lessonSchema.safeParse(lesson).success).toBe(false);
  // The whole catalogue says where: a new lesson cannot ship without one.
  const catalogue = structuredClone(contentCatalog);
  delete catalogue.lessons[3].guide;
  expect(contentProblems(catalogue).join('\n')).toMatch(/lessons\.3\.guide/);
  const empty = structuredClone(contentCatalog.lessons[0]);
  empty.guide.question.de = '  ';
  expect(lessonSchema.safeParse(empty).success).toBe(false);
  const unsynced = structuredClone(contentCatalog.lessons[0]);
  unsynced.guide.mistake.ruMarkup = '[[до]] и после';
  expect(lessonSchema.safeParse(unsynced).success).toBe(false);
  // No field the page does not know how to show.
  const extra = structuredClone(contentCatalog.lessons[0]);
  extra.guide.hint = extra.guide.listen;
  expect(lessonSchema.safeParse(extra).success).toBe(false);
});

test('The schema holds the walk-through to three to five steps and three or four things to keep', () => {
  const step = contentCatalog.lessons[0].guide.example[0];
  const point = contentCatalog.lessons[0].guide.takeaways[0];
  const accepts = (field, count, unit) => {
    const lesson = structuredClone(contentCatalog.lessons[0]);
    lesson.guide[field] = Array.from({ length: count }, () =>
      structuredClone(unit),
    );
    return lessonSchema.safeParse(lesson).success;
  };
  // Two steps are a statement and its repetition; six are a second lesson.
  expect(
    [1, 2, 3, 4, 5, 6, 7].map((count) => accepts('example', count, step)),
  ).toEqual([false, false, true, true, true, false, false]);
  expect(
    [0, 1, 2, 3, 4, 5].map((count) => accepts('takeaways', count, point)),
  ).toEqual([false, false, false, true, true, false]);
});

test('The lesson page leads through the walk-through in order, in the reader’s language', async () => {
  const headings = {
    en: ['The question', 'Step by step', 'A common mix-up', 'Keep in mind'],
    ru: ['Вопрос урока', 'Разберём по шагам', 'Частая ошибка', 'Запомните'],
    de: [
      'Die Frage',
      'Schritt für Schritt',
      'Häufige Verwechslung',
      'Merke dir',
    ],
  };
  const after = (first, second) =>
    Boolean(
      first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
    );
  for (const lang of LANGS)
    for (const lesson of lessons) {
      const guide = lessonGuides[lesson.id];
      await mount({
        lang,
        lessonId: lesson.id,
        anchor: null,
        openLab: vi.fn(),
        listen: vi.fn(() => Promise.resolve()),
        stopSound: vi.fn(),
      });
      const find = (selector) => container.querySelector(selector);
      const question = find('.lesson-question');
      const example = find('.lesson-example');
      const mistake = find('.lesson-mistake');
      const takeaways = find('.lesson-takeaways');
      expect(
        [
          question.querySelector('span').textContent,
          example.querySelector('h2').textContent,
          mistake.querySelector('h2').textContent,
          takeaways.querySelector('h2').textContent,
        ],
        `${lesson.id} ${lang}`,
      ).toEqual(headings[lang]);
      expect(question.textContent).toContain(guide.question[lang]);
      expect(
        [...example.querySelectorAll('li')].map((item) => item.textContent),
      ).toEqual(guide.example.map((step) => step[lang]));
      expect(mistake.querySelector('p').textContent).toBe(guide.mistake[lang]);
      expect(
        [...takeaways.querySelectorAll('li')].map((item) => item.textContent),
      ).toEqual(guide.takeaways.map((point) => point[lang]));
      // What to listen for sits in the card with the buttons that sound it.
      expect(find('.lesson-experiment .listen-for').textContent).toContain(
        guide.listen[lang],
      );
      // Question, then explanation, then the example, then the short line;
      // the mix-up before the reader is asked; what to keep before moving on.
      const prose = find('.lesson-article > .prose');
      expect(after(question, prose)).toBe(true);
      expect(after(prose, example)).toBe(true);
      expect(after(example, find('.formula'))).toBe(true);
      const exercise = find('.inline-exercise');
      if (exercise) expect(after(mistake, exercise)).toBe(true);
      expect(after(mistake, takeaways)).toBe(true);
      expect(after(takeaways, find('.lesson-progress'))).toBe(true);
      // Russian note names in the walk-through are set as terms, like the rest.
      if (lang === 'ru' && guide.question.ruMarkup)
        expect(question.querySelector('.russian-note-name')).not.toBeNull();
      // Each step is one box beside its number, however many italic note
      // names it holds. Set straight into the row, every run of text and
      // every note name became a cell of its own and the sentence fell apart.
      for (const item of example.querySelectorAll('li')) {
        expect(item.childNodes.length, `${lesson.id} ${lang}`).toBe(1);
        expect(item.firstChild.nodeName).toBe('SPAN');
      }
      // Announced as lists although their markers are drawn, not native.
      expect(example.querySelector('ol').getAttribute('role')).toBe('list');
      expect(takeaways.querySelector('ul').getAttribute('role')).toBe('list');
      // The heading outline has no level skipped or left alone among others:
      // every section of the lesson, the listening card included, is an h2.
      expect(find('.lesson-article h3')).toBeNull();
      expect(find('.lesson-experiment h2')).not.toBeNull();
    }
  // At least one lesson really has several marked note names in one step, so
  // the single-box check above is exercised and not vacuous.
  expect(
    Object.values(lessonGuides).some((guide) =>
      guide.example.some(
        (step) => (step.ruMarkup?.match(/\[\[/g) ?? []).length >= 2,
      ),
    ),
  ).toBe(true);
});
