import { afterEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ChordsLab } from '../../components/chords-lab.tsx';
import { ChordPlayer } from '../../lib/chord-audio.ts';
import Home from '../../app/page.tsx';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container, context, playback;
function mount(lang = 'en') {
  vi.stubGlobal(
    'AudioContext',
    class {
      currentTime = 0;
      close() {
        return Promise.resolve();
      }
      constructor() {
        context = this;
      }
    },
  );
  // The UI test controls the audio clock and failures; the separate audio
  // suite renders the production graph and measures real browser samples.
  playback = vi.spyOn(ChordPlayer.prototype, 'play').mockResolvedValue(0.05);
  container = document.createElement('div');
  container.style.cssText = 'max-width:1100px;margin:0 auto;padding:16px';
  document.body.append(container);
  act(() => {
    root = createRoot(container);
    root.render(createElement(ChordsLab, { lang }));
  });
}
afterEach(() => {
  if (root) void act(() => root.unmount());
  root = null;
  container?.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const button = (name) => {
  const locator = page.getByRole('button', { name, exact: true });
  const click = locator.click.bind(locator);
  locator.click = () =>
    act(async () => {
      await click();
    });
  return locator;
};
async function choose(label, option) {
  await act(async () => {
    await page.getByRole('combobox', { name: label, exact: true }).click();
  });
  await act(async () => {
    await page.getByRole('option', { name: option, exact: true }).click();
  });
}
const pitches = () =>
  [...container.querySelectorAll('.chord-pitches strong')].map(
    (n) => n.textContent,
  );
const cards = () =>
  [...container.querySelectorAll('.chord-card strong')].map(
    (n) => n.textContent,
  );

test('Edit, transpose, reorder and hear a progression with correctly spelled inversions and ninths', async () => {
  mount();
  expect(cards()).toEqual(['C', 'F', 'G7', 'C']);
  expect(pitches()).toEqual(['C', 'E', 'G']);
  await expect.element(button('Move chord left')).toBeDisabled();
  await choose('Chord type', 'Minor triad');
  expect(pitches()).toEqual(['C', 'E♭', 'G']);
  await choose('Bass / inversion', 'E♭ · in the bass');
  expect(cards()[0]).toBe('Cm/E♭');
  expect(pitches()).toEqual(['E♭', 'G', 'C']);
  await button('Listen').click();
  expect(playback.mock.lastCall[0].events.map((e) => e.midi)).toEqual([
    51, 55, 60,
  ]);
  await choose('Tonic · transpose', 'D♭');
  await expect.element(button('Play progression')).toBeVisible();
  expect(cards()[0]).toBe('D♭m/F♭');
  expect(pitches()).toEqual(['F♭', 'A♭', 'D♭']);
  await choose('Chord type', 'Major ninth');
  expect(pitches()).toEqual(['D♭', 'F', 'A♭', 'C', 'E♭']);
  await choose('Bass / inversion', 'E♭ · in the bass');
  expect(
    container.querySelector('figure').getAttribute('aria-label'),
  ).toContain('E♭4');
  await choose('Duration', '8 beats');
  await choose('Root degree', '5 · A♭');
  expect(cards()[0]).toBe('A♭maj9/B♭');
  await button('Move chord right').click();
  expect(cards()[1]).toBe('A♭maj9/B♭');
  await button('Move chord left').click();
  expect(cards()[0]).toBe('A♭maj9/B♭');
  await button('Duplicate chord').click();
  expect(cards()).toHaveLength(5);
  await expect.element(button('Move chord right')).toBeDisabled();
  await button('Remove chord').click();
  expect(cards()).toHaveLength(4);
  await button('Chord 2: G♭').click();
  expect(container.textContent).toContain('Shared pitches');
  await button('Sevenths').click();
  await button('Add E♭m7').click();
  expect(cards().at(-1)).toBe('E♭m7');
  await button('Triads').click();
  await button('Add D♭').click();
  expect(cards().at(-1)).toBe('D♭');
  // Individual pitch buttons audition the labelled note, not the chord root.
  await page
    .elementLocator(container.querySelectorAll('.chord-pitches button')[1])
    .click();
  expect(playback.mock.lastCall[0].events[0].midi).toBe(53);
});

test('Russian notation, root/bass feedback and source tabs stay usable at phone width', async () => {
  await page.viewport(390, 844);
  mount('ru');
  await choose('Отправная точка', 'Минор · вводный тон');
  expect(pitches()).toEqual(['до', 'ми-бемоль', 'соль']);
  await choose('Бас / обращение', 'соль · в басу');
  expect(pitches()).toEqual(['соль', 'до', 'ми-бемоль']);
  expect(container.textContent).toContain('первая октава');
  await page.getByRole('tab', { name: 'Проверьте себя', exact: true }).click();
  await page
    .getByRole('tabpanel')
    .getByRole('button', { name: 'соль', exact: true })
    .click();
  expect(container.querySelector('.chord-feedback').textContent).toContain(
    'Это аккордовый тон, но основной тон — до',
  );
  await page
    .getByRole('tabpanel')
    .getByRole('button', { name: 'до', exact: true })
    .click();
  expect(container.querySelector('.chord-feedback').textContent).toContain(
    'Верно. Основной тон остаётся до',
  );
  await choose('Бас / обращение', 'до · основной вид');
  expect(container.querySelector('.chord-feedback')).toBeNull();
  await choose('Гамма палитры', 'Мажор');
  await choose('Тоника · транспонировать', 'ре-бемоль');
  await choose('Вид аккорда', 'Мажорное трезвучие');
  await choose('Ступень основного тона', '5 · ля-бемоль');
  await choose('Длительность', '2 долей');
  await button('Слушать').click();
  await button('Стоп').click();
  await page
    .getByRole('tab', { name: 'Термины и источники', exact: true })
    .click();
  expect(container.textContent).toContain('равномерная темперация');
  expect(
    container.querySelectorAll('.chord-source-links a').length,
  ).toBeGreaterThanOrEqual(6);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
    window.innerWidth,
  );
  expect(container.textContent).not.toContain('undefined');
  await page
    .getByRole('tab', { name: 'Слушайте и исследуйте', exact: true })
    .click();
  expect(container.textContent).toContain('исходный пример');
  await page.viewport(1280, 900);
});

test('All style examples and accompaniment controls change what gets scheduled', async () => {
  mount();
  for (const [name, expected] of [
    ['Minor · the leading tone', ['Cm', 'Fm', 'G7', 'Cm']],
    [
      'Blues · twelve bars',
      ['C7', 'C7', 'C7', 'C7', 'F7', 'F7', 'C7', 'C7', 'G7', 'F7', 'C7', 'C7'],
    ],
    ['Jazz · ii–V–I', ['Dm7', 'G7', 'Cmaj7']],
    ['Pop · four-chord loop', ['C', 'G', 'Am', 'F']],
    ['Classical · a return home', ['C', 'F', 'G7', 'C']],
  ]) {
    await choose('Starting point', name);
    expect(cards()).toEqual(expected);
    await button('Play progression').click();
    expect(playback.mock.lastCall[0].starts).toHaveLength(expected.length);
    await button('Stop').click();
  }
  await page.getByText('Sound & accompaniment', { exact: true }).click();
  await choose('Texture', 'Quarter-note pulse');
  await choose('Timbre', 'Pure sine');
  await choose('Play through', '2×');
  await page
    .getByRole('spinbutton', { name: 'Tempo', exact: true })
    .fill('120');
  act(() => {
    const volume = container.querySelector('input[type="range"]');
    Reflect.set(HTMLInputElement.prototype, 'value', '30', volume);
    volume.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await button('Play progression').click();
  const [plan, level, tone] = playback.mock.lastCall;
  expect(plan.duration).toBe(16);
  expect(plan.events).toHaveLength(104);
  expect(level).toBe(0.3);
  expect(tone).toBe('sine');
  await choose('Texture', 'Eighth-note arpeggio');
  await button('Play progression').click();
  expect(playback.mock.lastCall[0].events).toHaveLength(64);
  await choose('Texture', 'Held chords');
  await choose('Timbre', 'Soft triangle');
  await page.getByRole('tab', { name: 'Terms & sources', exact: true }).click();
  expect(container.textContent).toContain('not from the key tonic');
});

test('Audio-clock highlighting, completion, Escape and hidden-page cancellation agree with transport state', async () => {
  mount();
  await button('Play progression').click();
  await expect
    .poll(() => container.querySelectorAll('.is-sounding').length)
    .toBe(0);
  context.currentTime = 0.1;
  await expect
    .poll(() =>
      container.querySelector('.is-sounding')?.getAttribute('aria-label'),
    )
    .toBe('Chord 1: C');
  context.currentTime = 3;
  await expect
    .poll(() =>
      container.querySelector('.is-sounding')?.getAttribute('aria-label'),
    )
    .toBe('Chord 2: F');
  context.currentTime = 12;
  await expect.element(button('Play progression')).toBeVisible();
  context.currentTime = 0;
  await button('Play progression').click();
  await act(() =>
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' })),
  );
  await expect.element(button('Stop')).toBeVisible();
  await act(() =>
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })),
  );
  await expect.element(button('Play progression')).toBeVisible();
  context.currentTime = 0;
  await button('Play progression').click();
  const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
  await act(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect.element(button('Stop')).toBeVisible();
  hidden.mockReturnValue(true);
  await act(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect.element(button('Play progression')).toBeVisible();
});

test('Pending playback is cancellable, errors can be retried, and unmount cannot restart stale audio', async () => {
  mount();
  let resume;
  playback.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resume = resolve;
      }),
  );
  await button('Play progression').click();
  await button('Cancel start').click();
  await act(async () => resume(0.05));
  await expect.element(button('Play progression')).toBeVisible();
  playback.mockRejectedValueOnce(new Error('blocked'));
  await button('Play progression').click();
  expect(container.querySelector('[role="alert"]').textContent).toContain(
    'Audio could not start',
  );
  await button('Play progression').click();
  expect(container.querySelector('[role="alert"]')).toBeNull();
  await button('Stop').click();
  let reject;
  playback.mockImplementationOnce(
    () =>
      new Promise((_, fail) => {
        reject = fail;
      }),
  );
  await button('Play progression').click();
  await button('Cancel start').click();
  await act(async () => reject(new Error('stale failure')));
  expect(container.querySelector('[role="alert"]')).toBeNull();
  playback.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        resume = resolve;
      }),
  );
  await button('Play progression').click();
  await act(() => root.unmount());
  root = null;
  await act(async () => resume(0.05));
  expect(container.textContent).toBe('');
});

test('The editor protects the last chord, caps the phrase at 16 chords and explains the three-minute limit', async () => {
  mount();
  await button('Remove chord').click();
  await button('Remove chord').click();
  await button('Remove chord').click();
  await expect.element(button('Remove chord')).toBeDisabled();
  await choose('Duration', '8 beats');
  for (let i = 1; i < 16; i++) await button('Duplicate chord').click();
  await expect.element(button('Duplicate chord')).toBeDisabled();
  await expect.element(button('Add C')).toBeDisabled();
  expect(container.textContent).toContain('16 chords maximum');
  await page.getByRole('spinbutton', { name: 'Tempo', exact: true }).fill('40');
  await expect.element(button('Play progression')).toBeDisabled();
  expect(container.textContent).toContain('within 3 minutes');
  await choose('Play through', '4×');
  await button('Remove chord').click();
  await expect.element(button('Duplicate chord')).not.toBeDisabled();
  await choose('Play through', '1×');
  await expect.element(button('Play progression')).not.toBeDisabled();
  await button('Play progression').click();
  expect(playback.mock.lastCall[0].duration).toBe(180);
});

test('Backend cancellation, audio unavailability, shared-pitch absence and a queued clock tick preserve a usable UI', async () => {
  mount();
  playback.mockResolvedValueOnce(null);
  await button('Play progression').click();
  await expect.element(button('Play progression')).toBeVisible();
  await button('Chord 2: F').click();
  await choose('Root degree', '2 · D');
  await choose('Chord type', 'Minor triad');
  expect(container.textContent).toContain(
    'Shared pitches with the previous chord: none',
  );
  const interval = vi.spyOn(window, 'setInterval');
  await button('Play progression').click();
  const tick = interval.mock.calls.find((call) => call[1] === 30)[0];
  await button('Stop').click();
  act(() => {
    tick();
  });
  expect(container.querySelector('.is-sounding')).toBeNull();
  await act(() => root.unmount());
  root = null;
  container.remove();
  mount();
  vi.stubGlobal(
    'AudioContext',
    class {
      constructor() {
        throw new Error('Unavailable');
      }
    },
  );
  await button('Play progression').click();
  expect(container.querySelector('[role="alert"]').textContent).toContain(
    'Audio could not start',
  );
});

test('The app opens the chords hash, switches EN/RU, links from Sound lab, and disposes chord sound on navigation', async () => {
  mount();
  window.history.replaceState(null, '', '#chords');
  await act(() => root.render(createElement(Home)));
  expect(
    getComputedStyle(container.querySelector('[data-slot="sidebar-container"]'))
      .position,
  ).toBe('fixed');
  await expect
    .element(
      page.getByRole('heading', { name: 'Chords, connected.', exact: true }),
    )
    .toBeVisible();
  await button('RU').click();
  await expect
    .element(
      page.getByRole('heading', { name: 'Аккорды в движении.', exact: true }),
    )
    .toBeVisible();
  await button('Лаборатория').click();
  await button('Лаборатория аккордов · создайте последовательность').click();
  expect(window.location.hash).toBe('#chords');
  await button('EN').click();
  await button('Play progression').click();
  const close = vi.spyOn(context, 'close');
  await button('Music theory').click();
  expect(close).toHaveBeenCalledOnce();
  await button('Chords lab').click();
  await expect
    .element(
      page.getByRole('heading', { name: 'Your progression', exact: true }),
    )
    .toBeVisible();
  await button('Sound lab').click();
  await button('Open Chords lab · build a progression').click();
  expect(window.location.hash).toBe('#chords');
});
