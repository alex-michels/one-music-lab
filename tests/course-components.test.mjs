/** @vitest-environment jsdom */
import { afterEach, expect, test } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CourseIndex,
  CourseNavigation,
  LessonConnections,
  LessonNavigation,
} from '../components/course-navigation.tsx';
import { EntryDiagnostic } from '../components/entry-diagnostic.tsx';
import { Practice } from '../components/learning.tsx';
import { chapters, readingOrder, courseAddresses } from '../lib/course.ts';
import { topicById, termsByTopic } from '../lib/topics.ts';
import { diagnosticQuestions } from '../lib/entry-diagnostic.ts';
import { routeFromHash } from '../lib/client-store.ts';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
async function mount(component, props) {
  container ??= document.body.appendChild(document.createElement('div'));
  root ??= createRoot(container);
  await act(() => root.render(createElement(component, props)));
}
afterEach(async () => {
  if (root) await act(() => root.unmount());
  container?.remove();
  root = container = null;
});
const route = (lens = 'read', lang = 'en', extra = {}) => ({
  lang,
  lens,
  topic: null,
  anchor: null,
  ...extra,
});
const click = async (element) => {
  expect(element).toBeTruthy();
  await act(() => element.click());
};
const button = (label) =>
  [...container.querySelectorAll('button')].find(
    (element) => element.textContent === label,
  );

test('All four indexes use the same complete teaching order, with honest practice availability', async () => {
  for (const lang of ['en', 'ru', 'de'])
    for (const lens of ['read', 'play', 'drill', 'define']) {
      await mount(CourseIndex, { route: route(lens, lang) });
      expect(container.querySelectorAll('.course-chapter')).toHaveLength(5);
      const links = [
        ...container.querySelectorAll('.chapter-lessons > li > a'),
      ];
      expect(links).toHaveLength(19);
      expect(
        links.map(
          (link) =>
            routeFromHash(link.hash, {
              lang,
              topics: readingOrder,
              ...courseAddresses,
            }).topic,
        ),
      ).toEqual(readingOrder);
      for (const link of links)
        expect(link.textContent).toBe(
          topicById[
            routeFromHash(link.hash, { lang, topics: readingOrder }).topic
          ].title[lang],
        );
      if (lens === 'drill') {
        expect(container.querySelectorAll('.course-unavailable')).toHaveLength(
          6,
        );
        expect(links[0].hash).toBe(`#/${lang}/t/sound/read`);
      }
      expect(
        container.querySelectorAll('.chapter-prerequisites a').length,
      ).toBeGreaterThan(0);
    }
});

test('Section and chapter indexes filter lessons without exposing unrelated exercises or empty instruments', async () => {
  await mount(CourseIndex, {
    route: route('play', 'de', {
      collection: { kind: 'section', id: 'expression' },
    }),
  });
  expect(container.querySelectorAll('.course-chapter')).toHaveLength(1);
  expect(container.querySelectorAll('.chapter-lessons > li')).toHaveLength(4);
  await mount(CourseIndex, {
    route: route('drill', 'ru', {
      collection: { kind: 'chapter', id: 'rhythm' },
    }),
  });
  expect(
    [...container.querySelectorAll('.chapter-lessons > li > a')].map(
      (link) => link.hash,
    ),
  ).toEqual(
    ['durations', 'dots-ties', 'beat-division', 'tempo'].map(
      (id) => `#/ru/t/${id}/drill`,
    ),
  );
  await mount(CourseIndex, {
    route: route('read', 'en', {
      collection: { kind: 'chapter', id: 'missing' },
    }),
  });
  expect(container.querySelector('.course-section')).toBeNull();
});

test('A lesson always exposes its actual position, prerequisites, definitions and reversible exits', async () => {
  for (const topic of readingOrder) {
    await mount(LessonConnections, { topic, lang: 'ru' });
    expect(container.querySelectorAll('.lesson-definitions a')).toHaveLength(
      termsByTopic[topic].length,
    );
    for (const link of container.querySelectorAll('.lesson-definitions a'))
      expect(link.hash).toContain(`/t/${topic}/define~`);
    await mount(LessonNavigation, { topic, lang: 'ru' });
    const i = readingOrder.indexOf(topic);
    expect(container.querySelector('[rel="prev"]')?.hash ?? null).toBe(
      i ? `#/ru/t/${readingOrder[i - 1]}/read` : null,
    );
    expect(container.querySelector('[rel="next"]')?.hash ?? null).toBe(
      i + 1 < readingOrder.length ? `#/ru/t/${readingOrder[i + 1]}/read` : null,
    );
  }
  expect(container.querySelector('.course-finish a').hash).toBe('#/ru/read');
  await mount(LessonNavigation, { topic: 'chords', lang: 'en' });
  expect(container.querySelector('[rel="next"]').textContent).toContain(
    'Next chapter',
  );
});

test('Topic context and available chapter links follow the selected view', async () => {
  for (const lens of ['read', 'play', 'drill', 'define']) {
    await mount(CourseNavigation, {
      route: route(lens, 'de', { topic: 'sound' }),
    });
    expect(container.querySelector('.course-breadcrumbs a').hash).toBe(
      `#/de/${lens}`,
    );
    expect(
      container.querySelector('.chapter-contents summary').textContent,
    ).toContain('1 / 2');
    expect(
      container.querySelector('.chapter-contents [aria-current="page"]').hash,
    ).toBe(`#/de/t/sound/${lens === 'drill' ? 'read' : lens}`);
    await mount(CourseNavigation, { route: route(lens) });
    expect(container.querySelector('.course-browse') !== null).toBe(
      lens !== 'read',
    );
  }
  for (const collection of [
    { kind: 'section', id: 'foundations' },
    { kind: 'chapter', id: 'rhythm' },
    { kind: 'section', id: 'missing' },
  ]) {
    await mount(CourseNavigation, {
      route: route('read', 'en', { collection }),
    });
    expect(container.querySelector('.course-breadcrumbs')).not.toBeNull();
    expect(container.querySelector('.chapter-contents')).toBeNull();
  }
  for (const chapter of chapters) {
    await mount(CourseNavigation, {
      route: route('play', 'en', { topic: chapter.lessons.at(-1) }),
    });
    expect(
      container.querySelector('.chapter-contents [aria-current="page"]')
        .textContent,
    ).toContain(topicById[chapter.lessons.at(-1)].title.en);
  }
});

test('A direct drill URL for an unscored topic explains the gap and returns to its own experiment', async () => {
  for (const lang of ['en', 'ru', 'de']) {
    await mount(Practice, { lang, topic: 'chords' });
    expect(container.querySelector('.drill-question')).toBeNull();
    expect(
      [...container.querySelectorAll('a')].map((link) => link.hash),
    ).toEqual([`#/${lang}/t/chords/play`, `#/${lang}/t/chords/read`]);
  }
});

test('The diagnostic explains each wrong answer, survives a language change and recommends the first review', async () => {
  await mount(EntryDiagnostic, { lang: 'en' });
  expect(container.querySelector('.diagnostic-result')).toBeNull();
  for (let i = 0; i < diagnosticQuestions.length; i++) {
    const question = diagnosticQuestions[i];
    if (i === 0) {
      await click(button('I’m not sure'));
      expect(
        container.querySelector('.diagnostic-feedback').textContent,
      ).toContain('no guess is needed');
    } else {
      const option = question.options.find(
        (candidate) => candidate.id !== question.answer,
      );
      await click(button(option.label.en));
      expect(
        container.querySelector('.diagnostic-feedback').textContent,
      ).toContain(option.feedback.en);
      expect(
        [...container.querySelectorAll('.answer-grid button')].every(
          (node) => node.disabled,
        ),
      ).toBe(true);
    }
    expect(container.querySelector('.diagnostic-feedback a').hash).toBe(
      `#/en/t/${question.topic}/read`,
    );
    if (i === 1) {
      await mount(EntryDiagnostic, { lang: 'de' });
      expect(container.querySelector('.diagnostic-feedback a').hash).toBe(
        '#/de/t/clefs/read',
      );
      expect(container.querySelector('[aria-pressed="true"]').textContent).toBe(
        question.options.find((option) => option.id !== question.answer).label
          .de,
      );
      await mount(EntryDiagnostic, { lang: 'en' });
    }
    await click(button(i === 4 ? 'See the suggestion' : 'Next check'));
    expect(document.activeElement).toBe(container.querySelector('h2'));
  }
  expect(
    container.querySelector('.diagnostic-result .primary-button').hash,
  ).toBe('#/en/t/sound/read');
  expect(container.querySelectorAll('.diagnostic-result li')).toHaveLength(5);
  await click(button('Restart the check'));
  expect(container.querySelector('.diagnostic-result')).toBeNull();
  expect(container.querySelector('h2').textContent).toBe('Check 1 / 5');
  expect(container.querySelector('.diagnostic-feedback')).toBeNull();
});

test('Correct diagnostic answers do not claim mastery or force a later chapter', async () => {
  await mount(EntryDiagnostic, { lang: 'en' });
  for (let i = 0; i < diagnosticQuestions.length; i++) {
    const question = diagnosticQuestions[i];
    const correct = question.options.find(
      (option) => option.id === question.answer,
    );
    await click(button(correct.label.en));
    expect(
      container.querySelector('.diagnostic-feedback').textContent,
    ).toContain(correct.feedback.en);
    await click(button(i === 4 ? 'See the suggestion' : 'Next check'));
  }
  expect(container.querySelector('.diagnostic-result').textContent).toContain(
    'material these checks did not assess',
  );
  expect(
    container.querySelector('.diagnostic-result .primary-button'),
  ).toBeNull();
  expect(container.querySelector('.diagnostic-actions a').hash).toBe(
    '#/en/t/sound/read',
  );
});
