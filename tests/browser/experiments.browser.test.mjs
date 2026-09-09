import { afterEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Experiments } from '../../components/learning.tsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root;
let container;
function mount(props = {}) {
  container = document.createElement('div');
  document.body.append(container);
  act(() => {
    root = createRoot(container);
    root.render(
      createElement(Experiments, {
        lang: 'en',
        reference: 440,
        tuning: 'equal',
        play: vi.fn().mockResolvedValue(),
        ...props,
      }),
    );
  });
}
afterEach(() => {
  void act(() => root.unmount());
  container.remove();
});
// The third copy of this helper, and the one with no gate at all. A Base UI
// select keeps its option list in the document for good, so `getByRole` finds
// an option whether or not the popup is open, and a click that failed to open
// it left the next click waiting on something unreachable for the whole test
// budget. Ask the trigger, and reopen if it says shut — a click that did not
// open leaves the popup closed, so clicking again opens rather than toggles.
// Same fix as chords-lab.browser.test.mjs and german.browser.test.mjs.
async function choose(label, option) {
  const combobox = page.getByRole('combobox', { name: label, exact: true });
  for (let attempt = 1; ; attempt += 1) {
    await combobox.click();
    try {
      await expect
        .poll(() => combobox.element().getAttribute('aria-expanded'), {
          timeout: 2000,
        })
        .toBe('true');
      break;
    } catch (error) {
      if (attempt === 3) throw error;
    }
  }
  await page.getByRole('option', { name: option, exact: true }).click();
}
function pitchLabels() {
  return [...container.querySelectorAll('.note-sequence > div > span')].map(
    (n) => n.textContent,
  );
}
function octaveLabels() {
  return [...container.querySelectorAll('.note-sequence .note-octave')].map(
    (n) => n.textContent,
  );
}

test('C minor keeps E-flat, A-flat and B-flat instead of sharp keyboard aliases', async () => {
  mount();
  await page.getByRole('tab', { name: 'Scales & modes', exact: true }).click();
  await choose('Root note', 'C4');
  await choose('Explore', /Natural minor|C minor — natural/);
  expect(pitchLabels()).toEqual([
    'C4',
    'D4',
    'E♭4',
    'F4',
    'G4',
    'A♭4',
    'B♭4',
    'C5',
  ]);
});

test('The Russian lab writes note names and octaves in words', async () => {
  mount({ lang: 'ru' });
  await page.getByRole('tab', { name: 'Гаммы и лады', exact: true }).click();
  await choose('Основной тон', 'до, первая октава');
  await choose('Исследовать', 'до минор — натуральный');

  expect(pitchLabels()).toEqual([
    'до',
    'ре',
    'ми-бемоль',
    'фа',
    'соль',
    'ля-бемоль',
    'си-бемоль',
    'до',
  ]);
  expect(octaveLabels()).toEqual([
    ...Array.from({ length: 7 }, () => 'первая октава'),
    'вторая октава',
  ]);
  // The English scientific suffix must not leak into the Russian display.
  for (const label of pitchLabels()) expect(label).not.toMatch(/\d/);
});

test('Enharmonic roots keep their own spelling on the same key', async () => {
  mount();
  await page.getByRole('tab', { name: 'Scales & modes', exact: true }).click();
  await choose('Root note', 'C♯4');
  await choose('Explore', 'C♯ major');
  const sharp = pitchLabels();

  await choose('Root note', 'D♭4');
  const flat = pitchLabels();

  expect(sharp[0]).toBe('C♯4');
  expect(flat[0]).toBe('D♭4');
  expect(sharp).not.toEqual(flat);
  // Same sounding pitches, different written ones.
  expect(sharp.every((name) => !name.includes('♭'))).toBe(true);
  expect(flat.every((name) => !name.includes('♯'))).toBe(true);
});

test('Notes outside the audible range disable playback and say why', async () => {
  const play = vi.fn().mockResolvedValue();
  mount({ reference: 20, play });
  await page.getByRole('tab', { name: 'Scales & modes', exact: true }).click();

  // With A4 at 20 Hz, a scale from C4 sounds below the audible range.
  await choose('Root note', 'C4');

  const hint = container.querySelector('output.experiment-hint');
  expect(hint?.textContent).toContain('20–20,000 Hz');
  const buttons = [...container.querySelectorAll('button')].filter((b) =>
    /In sequence|Together/.test(b.textContent),
  );
  expect(buttons.length).toBeGreaterThan(0);
  for (const button of buttons) expect(button.disabled).toBe(true);
  buttons[0].click();
  expect(play).not.toHaveBeenCalled();
});
