import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '../../app/page.tsx';
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
const readout = (label) => {
  const row = [...container.querySelectorAll('.note-readout dl > div')].find(
    (d) => d.querySelector('dt').textContent === label,
  );
  return row?.querySelector('dd').textContent;
};

test('The Notes tab replaces the generator and reads a written note as a pitch', async () => {
  await mount();
  // The generator is what the lab opens on.
  expect(container.querySelector('.notes-lab')).toBeNull();
  expect(container.querySelector('.instrument-grid').className).not.toContain(
    'is-hidden',
  );

  await click('Notes');
  expect(container.querySelector('.notes-lab')).not.toBeNull();
  // Hidden rather than stacked underneath: `display: none` takes the generator
  // out of the accessibility tree with it.
  expect(container.querySelector('.instrument-grid').className).toContain(
    'is-hidden',
  );
  expect(
    getComputedStyle(container.querySelector('.instrument-grid')).display,
  ).toBe('none');

  // C4 is MIDI 60 at the default reference, and the panel says so.
  expect(container.querySelector('.note-name').textContent).toBe('C4');
  expect(readout('MIDI number')).toBe('60');
  expect(readout('Written')).toBe('C');
  expect(readout('Sounding pitch')).toContain('261.63');

  // Raising the note changes the spelling and the number together.
  await click('♯');
  expect(readout('Written')).toBe('C♯');
  expect(readout('MIDI number')).toBe('61');
  expect(container.querySelector('.note-name').textContent).toBe('C♯4');

  await click('Tone generator');
  expect(container.querySelector('.notes-lab')).toBeNull();
  expect(container.querySelector('.instrument-grid').className).not.toContain(
    'is-hidden',
  );
});

test('The reference pitch moves the frequency and leaves the written note alone', async () => {
  await mount();
  await click('Notes');
  const written = readout('Written');
  const midi = readout('MIDI number');
  const first = Number.parseFloat(readout('Sounding pitch'));

  await click('Tone generator');
  await click('432');
  await click('Notes');

  // Same note on the page, different frequency underneath it: the point the
  // panel exists to make.
  expect(readout('Written')).toBe(written);
  expect(readout('MIDI number')).toBe(midi);
  expect(Number.parseFloat(readout('Sounding pitch'))).toBeLessThan(first);
});

test('German shows its own register names and the software caveat', async () => {
  await mount();
  // The language store reads storage once per page, so switching has to go
  // through the control the reader uses.
  await click('DE');
  await click('Noten');
  // Helmholtz, not scientific pitch: the decision recorded in roadmap №557.
  expect(container.querySelector('.note-name').textContent).toBe('c′');
  expect(readout('Oktavlage')).toBe('eingestrichene Oktave');
  expect(container.querySelector('.note-caveat').textContent).toContain(
    'MIDI legt die Nummer',
  );
});
