import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '../../app/page.tsx';
import { AudioEngine } from '../../lib/audio.ts';
import { LANGUAGE_STORAGE_KEY } from '../../lib/client-store.ts';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
const mount = () => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  return act(() => root.render(createElement(Home)));
};
beforeEach(async () => {
  await page.viewport(1280, 900);
});
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = null;
  container?.remove();
  container = null;
  localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  vi.restoreAllMocks();
});
const click = (name) =>
  act(async () => page.getByRole('button', { name, exact: true }).click());
const rgb = (element, property) =>
  getComputedStyle(element).getPropertyValue(property);

test('The lab is a bed inside the reader chrome, not a whole-canvas override', async () => {
  await mount();
  const lens = container.querySelector('.lens-play');
  expect(lens.dataset.lens).toBe('play');
  const ground = rgb(lens, 'background-color');
  // The bed is one surface inside the page, so the page around it keeps the
  // theme the reader chose. A light-mode setting is often an accommodation.
  expect(rgb(document.body, 'background-color')).not.toBe(ground);
  expect(document.documentElement.dataset.theme).toBe('light');
  // Chrome that sits straight on the bed has to be readable on it: the ink
  // tokens are near-black in the light theme.
  const caption = container.querySelector('.lens-play > .section-tabs');
  expect(rgb(caption, 'color')).not.toBe(rgb(document.body, 'color'));
  // The panels keep their own surface and sit on the bed.
  expect(
    rgb(container.querySelector('.panel.generator'), 'background-color'),
  ).not.toBe(ground);
});

test('The frequency and the current note are one display size, in mono', async () => {
  await mount();
  const frequency = container.querySelector('.frequency-input input');
  const note = container.querySelector('.current-note');
  const size = getComputedStyle(frequency).fontSize;
  expect(size).toBe(getComputedStyle(note).fontSize);
  // 2.875rem at the root's 16px.
  expect(size).toBe('46px');
  for (const element of [frequency, note])
    expect(getComputedStyle(element).fontFamily.toLowerCase()).toContain(
      'mono',
    );
});

test('The tone that is sounding is named in ink, not only heard', async () => {
  vi.spyOn(AudioEngine.prototype, 'start').mockResolvedValue(true);
  await mount();
  const status = container.querySelector('.soft-badge');
  // Audio equivalence: a live region, so a reader who cannot hear the tone is
  // told what started rather than watching a dot change colour.
  expect(status.tagName).toBe('OUTPUT');
  expect(status.getAttribute('aria-live')).toBe('polite');
  expect(status.textContent).toContain('Ready to play');
  await click('Play tone Space');
  expect(status.textContent).toContain('Playing');
  // The pitch and the frequency, both of which the ear was getting for free.
  expect(status.textContent).toContain('A4');
  expect(status.textContent).toContain('440.00 Hz');
});

test('A reader who asks for less motion gets a still scope, not a hidden one', async () => {
  // The site's reduced-motion block turns off animations and transitions. A
  // requestAnimationFrame loop is neither, so the query has to be read here.
  const real = window.matchMedia.bind(window);
  vi.spyOn(window, 'matchMedia').mockImplementation((query) =>
    query === '(prefers-reduced-motion: reduce)'
      ? {
          matches: true,
          media: query,
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent: () => false,
          onchange: null,
        }
      : real(query),
  );
  const frames = vi.spyOn(window, 'requestAnimationFrame');
  await mount();
  const canvas = container.querySelector('.scope canvas');
  expect(canvas).not.toBeNull();
  // The picture is still drawn — one static cycle — and then nothing more is
  // scheduled. React and the sidebar schedule frames of their own, so what is
  // asserted is that the count stops growing, not that it is zero.
  expect(canvas.width).toBeGreaterThan(0);
  const settled = frames.mock.calls.length;
  await new Promise((resolve) => setTimeout(resolve, 250));
  expect(frames.mock.calls.length).toBe(settled);
});

test('Leaving the generator unmounts its canvas, which is what stops the loop', async () => {
  await mount();
  expect(container.querySelector('.scope canvas')).not.toBeNull();
  await click('Notes');
  expect(container.querySelector('.scope canvas')).toBeNull();
  // Nothing left behind in the accessibility tree either.
  expect(
    page.getByRole('button', { name: 'Play tone Space' }).elements(),
  ).toHaveLength(0);
  await click('Tone generator');
  expect(container.querySelector('.scope canvas')).not.toBeNull();
});

test('Prose on the play lens is an inset, and there are at most two', async () => {
  await mount();
  const insets = container.querySelectorAll('.lens-play .inset');
  // A third one would mean the material belongs in the read lens.
  expect(insets.length).toBeLessThanOrEqual(2);
  expect(insets.length).toBeGreaterThan(0);
  for (const inset of insets) {
    const width = Number.parseFloat(getComputedStyle(inset).maxWidth);
    expect(width).toBeLessThanOrEqual(420);
  }
});

test('The instrument keeps its controls beside it above 1000px and under it below', async () => {
  await mount();
  const columns = () =>
    getComputedStyle(
      container.querySelector('.instrument-grid'),
    ).gridTemplateColumns.split(' ').length;
  expect(columns()).toBe(2);
  await page.viewport(900, 900);
  expect(columns()).toBe(1);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
    window.innerWidth + 1,
  );
});

test('The bed contains what is on it, on a phone, on either tab', async () => {
  await page.viewport(375, 812);
  await mount();
  const lens = container.querySelector('.lens-play');
  // A grid item's automatic minimum is its min-content width, so the bed's
  // single column would otherwise be sized by the widest thing on it — the
  // notes lab, which is four panels with a staff in them.
  for (const tab of ['Notes', 'Tone generator']) {
    await click(tab);
    expect(lens.scrollWidth, `${tab} overflows the bed`).toBeLessThanOrEqual(
      lens.clientWidth,
    );
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth + 1,
    );
  }
});
