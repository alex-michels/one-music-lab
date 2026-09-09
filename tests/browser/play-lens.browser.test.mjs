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

/**
 * One mount for everything that is a computed style on a default lab.
 *
 * Each of these used to mount the whole application for itself, which is four
 * builds of the sidebar, the audio engine and the canvas to read four numbers.
 * The browser suite runs three engines in CI and the slowest test in it already
 * spends most of a sixty-second budget, so a test file that costs four times
 * what it needs to is not free — it is taken out of somebody else's timeout.
 */
test('The lens is a bed, with display type, insets and a two-column instrument', async () => {
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
  const tabs = container.querySelector('.lens-play > .section-tabs');
  expect(rgb(tabs, 'color')).not.toBe(rgb(document.body, 'color'));
  // The panels keep their own surface, and their own ink, and sit on the bed.
  const panel = container.querySelector('.panel.generator');
  expect(rgb(panel, 'background-color')).not.toBe(ground);
  expect(rgb(panel, 'color')).not.toBe(rgb(lens, 'color'));

  // The frequency and the current note are one display size, in mono.
  const frequency = container.querySelector('.frequency-input input');
  const note = container.querySelector('.current-note');
  const size = getComputedStyle(frequency).fontSize;
  expect(size).toBe(getComputedStyle(note).fontSize);
  expect(size).toBe('46px'); // 2.875rem at the root's 16px.
  for (const element of [frequency, note])
    expect(getComputedStyle(element).fontFamily.toLowerCase()).toContain(
      'mono',
    );

  // Prose exists only as an inset, and a third would mean the material
  // belongs in the read lens.
  const insets = container.querySelectorAll('.lens-play .inset');
  expect(insets.length).toBeGreaterThan(0);
  expect(insets.length).toBeLessThanOrEqual(2);
  for (const inset of insets)
    expect(
      Number.parseFloat(getComputedStyle(inset).maxWidth),
    ).toBeLessThanOrEqual(420);

  // Instrument left, controls right, down to 1000px.
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
  // scheduled. React, the sidebar and the previous test's teardown all
  // schedule frames of their own, so the assertion is that the count is
  // *stable across a later window*, not that it is zero and not that it stops
  // growing the instant this line runs. A 60 fps loop would add about twenty.
  expect(canvas.width).toBeGreaterThan(0);
  const settle = () => new Promise((resolve) => setTimeout(resolve, 300));
  await settle();
  const settled = frames.mock.calls.length;
  await settle();
  expect(frames.mock.calls.length).toBe(settled);
});

test('Resizing does not leave a second draw loop behind', async () => {
  await mount();
  const frames = vi.spyOn(window, 'requestAnimationFrame');
  const rate = async () => {
    const before = frames.mock.calls.length;
    await new Promise((resolve) => setTimeout(resolve, 300));
    return frames.mock.calls.length - before;
  };
  const one = await rate();
  expect(one, 'the scope should be drawing').toBeGreaterThan(5);
  // Three resizes used to fork three more chains: the resize handler called
  // the drawing function directly, which scheduled a frame while the previous
  // one was still pending, and only the last one was ever written down to be
  // cancelled. The rate is the whole tell — a forked loop draws twice as fast.
  for (const width of [1100, 1000, 1200]) await page.viewport(width, 900);
  const after = await rate();
  expect(after).toBeLessThan(one * 1.6);
  // And unmounting stops all of it, not just the chain it last remembered.
  await act(() => root.unmount());
  root = null;
  expect(await rate()).toBeLessThan(3);
});

test('Leaving the generator unmounts its canvas, and the bed contains either tab', async () => {
  await page.viewport(375, 812);
  await mount();
  const lens = container.querySelector('.lens-play');
  const fits = (where) => {
    // A grid item's automatic minimum is its min-content width, so the bed's
    // single column would otherwise be sized by the widest thing on it — the
    // notes lab, which is four panels with a staff in them.
    expect(lens.scrollWidth, `${where} overflows the bed`).toBeLessThanOrEqual(
      lens.clientWidth,
    );
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth + 1,
    );
  };
  expect(container.querySelector('.scope canvas')).not.toBeNull();
  fits('the generator');

  await click('Notes');
  expect(container.querySelector('.scope canvas')).toBeNull();
  // Nothing left behind in the accessibility tree either.
  expect(
    page.getByRole('button', { name: 'Play tone Space' }).elements(),
  ).toHaveLength(0);
  fits('the notes lab');

  await click('Tone generator');
  expect(container.querySelector('.scope canvas')).not.toBeNull();
});
