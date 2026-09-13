import { afterEach, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '../../app/(root)/page.tsx';
import { chapters, courseAddresses } from '../../lib/course.ts';
import { diagnosticQuestions } from '../../lib/entry-diagnostic.ts';
import { course, readingOrder } from '../../lib/course.ts';
import { routeFromHash } from '../../lib/client-store.ts';
import { lessons } from '../../lib/learning.ts';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
async function mount() {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  await act(() => root.render(createElement(Home)));
}
async function visit(hash) {
  await act(async () => {
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}
async function click(element) {
  await act(async () => page.elementLocator(element).click());
}
const rail = (lens) =>
  container.querySelector(`.lens-rail a[href$="/${lens}"]`);
afterEach(async () => {
  if (root) {
    await visit('#/en/play');
    await act(() => root.unmount());
  }
  container?.remove();
  root = container = null;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.removeItem('oml-language');
  await page.viewport(1280, 900);
});

test('A pasted chapter URL hydrates in its language and shows only its lessons', async () => {
  window.history.replaceState(null, '', '#/de/c/rhythm/read');
  await mount();
  expect(document.documentElement.lang).toBe('de');
  expect(container.querySelector('h1').textContent).toBe(
    'Rhythmus und musikalische Zeit',
  );
  expect(document.title).toBe('Rhythmus und musikalische Zeit — One Music Lab');
  expect(container.querySelectorAll('.chapter-lessons > li')).toHaveLength(4);
  expect(container.querySelector('.entry-diagnostic')).toBeNull();
  expect(container.querySelector('.course-chapter h3').textContent).toBe(
    'Rhythmus und musikalische Zeit',
  );
});

for (const lang of ['en', 'ru', 'de']) {
  test(`All four chapter indexes fit a small screen and preserve scope when switching views in ${lang}`, async () => {
    await page.viewport(360, 800);
    await mount();
    for (const lens of ['read', 'play', 'drill', 'define']) {
      await visit(`#/${lang}/c/pitch-relationships/${lens}`);
      expect(container.querySelector('h1').textContent).toBe(
        chapters[3].title[lang],
      );
      expect(container.querySelectorAll('.chapter-lessons > li')).toHaveLength(
        4,
      );
      expect(container.querySelector('.drill-question')).toBeNull();
      expect(container.querySelector('#frequency')).toBeNull();
      expect(container.querySelector('.term-index')).toBeNull();
      for (const node of container.querySelectorAll(
        '.course-context, .course-index, .course-chapter, .chapter-lessons',
      )) {
        expect(node.scrollWidth).toBeLessThanOrEqual(node.clientWidth + 1);
      }
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
        window.innerWidth + 1,
      );
      const target = lens === 'read' ? 'play' : 'read';
      await click(rail(target));
      expect(window.location.hash).toBe(
        `#/${lang}/c/pitch-relationships/${target}`,
      );
      expect(container.querySelector('h1')).toBe(document.activeElement);
    }
    await visit(`#/${lang}/read`);
    expect(container.querySelectorAll('.chapter-lessons > li')).toHaveLength(
      19,
    );
    for (const link of container.querySelectorAll('.course-section > h2 a')) {
      const destination = routeFromHash(link.hash, {
        lang,
        topics: readingOrder,
        ...courseAddresses,
      });
      expect(
        course.some((section) => section.id === destination.collection.id),
      ).toBe(true);
    }
  });
}

test('Keyboard chapter browsing opens the requested lesson, keeps current position and supports Back/Forward', async () => {
  await mount();
  await visit('#/en/c/first-sounds/read');
  const link = container.querySelector('.chapter-lessons a');
  link.focus();
  await act(async () => userEvent.keyboard('{Enter}'));
  await expect.poll(() => window.location.hash).toBe('#/en/t/sound/read');
  expect(container.querySelector('h1')).toBe(document.activeElement);
  const contents = container.querySelector('.chapter-contents');
  contents.querySelector('summary').focus();
  await act(async () => userEvent.keyboard(' '));
  expect(contents.open).toBe(true);
  expect(contents.querySelector('[aria-current="page"]').hash).toBe(
    '#/en/t/sound/read',
  );
  await act(async () => window.history.back());
  await expect
    .poll(() => window.location.hash)
    .toBe('#/en/c/first-sounds/read');
  await expect
    .poll(() => container.querySelectorAll('.chapter-lessons li').length)
    .toBe(2);
  await act(async () => window.history.forward());
  await expect.poll(() => window.location.hash).toBe('#/en/t/sound/read');
  await expect
    .poll(
      () => container.querySelector('.lesson-navigation [rel="next"]')?.hash,
    )
    .toBe('#/en/t/note-names/read');
});

test('A direct sound experiment loads its preset and preserves edits through theory and definitions', async () => {
  await mount();
  await visit('#/en/t/sound/play');
  expect(Number(container.querySelector('#frequency').value)).toBe(220);
  await act(async () =>
    page.getByRole('spinbutton', { name: 'Frequency in hertz' }).fill('333'),
  );
  await act(async () => userEvent.tab());
  await click(rail('read'));
  await click(rail('define'));
  expect(container.querySelector('.term-entry')).not.toBeNull();
  await click(rail('play'));
  expect(Number(container.querySelector('#frequency').value)).toBe(333);
  await visit('#/en/t/timbre/play');
  expect(Number(container.querySelector('#frequency').value)).toBe(
    lessons.find((lesson) => lesson.id === 'timbre').hz,
  );
  expect(
    container.querySelector('.chapter-contents summary').textContent,
  ).toContain('1 / 4');
});

test('Notes-lab settings survive a trip through practice and back to the same topic', async () => {
  await mount();
  await visit('#/en/t/staff/play');
  const note = container.querySelectorAll('.note-chooser')[0];
  const buttons = [...note.querySelectorAll('button')];
  const newNote = buttons.find(
    (element) => element.getAttribute('aria-pressed') === 'false',
  );
  await click(newNote);
  const name = container.querySelector('.note-name').textContent;
  await click(rail('drill'));
  expect(container.querySelector('.drill-question')).not.toBeNull();
  await click(rail('read'));
  await click(rail('play'));
  expect(container.querySelector('.note-name').textContent).toBe(name);
});

test('A scale lesson opens the scale experiment and preserves its choices on return', async () => {
  await mount();
  await visit('#/en/t/scales/play');
  const selected = () =>
    container.querySelector('.experiment-tabs [aria-selected="true"]');
  expect(selected().textContent).toBe('Scales & modes');
  await act(async () =>
    page.getByRole('combobox', { name: 'Root note', exact: true }).click(),
  );
  await act(async () =>
    page.getByRole('option', { name: 'C4', exact: true }).click(),
  );
  const rootLabel = container.querySelector(
    '[aria-labelledby="root-scales"]',
  ).textContent;
  expect(rootLabel).toContain('C4');
  await click(rail('read'));
  await click(rail('play'));
  expect(selected().textContent).toBe('Scales & modes');
  expect(
    container.querySelector('[aria-labelledby="root-scales"]').textContent,
  ).toBe(rootLabel);
  await visit('#/en/t/intervals/play');
  expect(selected().textContent).toBe('Intervals');
});

test('Chord edits, tempo and undo survive a return from the lesson and definitions', async () => {
  await mount();
  await visit('#/en/t/chords/play');
  const before = container.querySelectorAll('.chord-card').length;
  const beforeTempo = container.querySelector(
    'input[aria-label="Tempo"]',
  ).value;
  await act(async () =>
    page.getByRole('button', { name: 'Duplicate chord', exact: true }).click(),
  );
  await act(async () =>
    page.getByRole('spinbutton', { name: 'Tempo', exact: true }).fill('101'),
  );
  await act(async () => userEvent.tab());
  await click(rail('read'));
  await click(rail('define'));
  await click(rail('play'));
  expect(container.querySelectorAll('.chord-card')).toHaveLength(before + 1);
  expect(container.querySelector('input[aria-label="Tempo"]').value).toBe(
    '101',
  );
  // NumberField commits both editing and blur. Walk the preserved history
  // back to the musical phrase, without assuming one commit per keystroke.
  for (
    let i = 0;
    i < 5 && container.querySelectorAll('.chord-card').length > before;
    i++
  ) {
    await act(async () =>
      page.getByRole('button', { name: 'Undo', exact: true }).click(),
    );
  }
  expect(container.querySelectorAll('.chord-card')).toHaveLength(before);
  expect(container.querySelector('input[aria-label="Tempo"]').value).toBe(
    beforeTempo,
  );
  await act(async () =>
    page.getByRole('button', { name: 'Redo', exact: true }).click(),
  );
  expect(container.querySelectorAll('.chord-card')).toHaveLength(before + 1);
});

test('Language changes keep a chapter address and unknown chapters recover to the reading index', async () => {
  await mount();
  await visit('#/en/s/expression/define');
  await act(async () =>
    page.getByRole('button', { name: 'RU', exact: true }).click(),
  );
  expect(window.location.hash).toBe('#/ru/s/expression/define');
  expect(container.querySelector('h1').textContent).toBe(
    'Выразительность и исполнение',
  );
  await visit('#/de/c/no-such-chapter/read');
  expect(window.location.hash).toBe('#/de/read');
  expect(container.querySelectorAll('.course-chapter')).toHaveLength(5);
});

test('Browsing a laboratory chapter cannot trigger a hidden oscillator from keyboard shortcuts', async () => {
  const startAudio = vi.fn(() => {
    throw new Error('No audio should be created');
  });
  vi.stubGlobal('AudioContext', startAudio);
  await mount();
  await visit('#/en/c/rhythm/play');
  await act(async () => userEvent.keyboard(' a{ArrowRight}'));
  expect(startAudio).not.toHaveBeenCalled();
  expect(container.querySelector('.error-message')).toBeNull();
  expect(container.querySelector('#frequency')).toBeNull();
});

test('The optional diagnostic remains usable on mobile and leaves every chapter accessible', async () => {
  await page.viewport(360, 800);
  await mount();
  await visit('#/ru/read');
  const details = container.querySelector('.entry-diagnostic');
  await click(details.querySelector('summary'));
  const option = diagnosticQuestions[0].options.find(
    (entry) => entry.id === 'inverse',
  );
  await act(async () =>
    page.getByRole('button', { name: option.label.ru, exact: true }).click(),
  );
  expect(container.querySelector('.diagnostic-feedback').textContent).toContain(
    option.feedback.ru,
  );
  expect(details.scrollWidth).toBeLessThanOrEqual(details.clientWidth + 1);
  await act(async () =>
    page.getByRole('button', { name: 'DE', exact: true }).click(),
  );
  expect(container.querySelector('.diagnostic-feedback').textContent).toContain(
    option.feedback.de,
  );
  expect(container.querySelectorAll('.course-chapter')).toHaveLength(5);
  expect(details.scrollWidth).toBeLessThanOrEqual(details.clientWidth + 1);
  await click(container.querySelector('.chapter-lessons a'));
  await expect.poll(() => window.location.hash).toBe('#/de/t/sound/read');
});
