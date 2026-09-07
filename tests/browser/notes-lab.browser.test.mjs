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
  await click('F');
  await click('♯');
  await click('octave 5');
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
  expect(container.querySelector('.note-name').textContent).toBe('F♯5');
  expect(Number.parseFloat(readout('Sounding pitch'))).toBeLessThan(first);
});

// These tests verify the UI's audio commands in every engine, including WebKit
// without Web Audio. The rendered waveform is tested in audio.browser.test.mjs.
function observeAudio() {
  vi.stubGlobal(
    'AudioContext',
    class {
      currentTime = 0;
      sampleRate = 48000;
      destination = {};
      createGain() {
        return { gain: { value: 0 }, connect() {} };
      }
      createAnalyser() {
        return {
          connect() {},
          getByteTimeDomainData(data) {
            data.fill(128);
          },
        };
      }
      close() {
        return Promise.resolve();
      }
    },
  );
  const start = vi
    .spyOn(AudioEngine.prototype, 'start')
    .mockResolvedValue(true);
  const preview = vi
    .spyOn(AudioEngine.prototype, 'preview')
    .mockResolvedValue();
  vi.spyOn(AudioEngine.prototype, 'update').mockImplementation(() => {});
  const stop = vi.spyOn(AudioEngine.prototype, 'stopAll');
  return { start, preview, stop };
}

test('Switching tabs stops continuous audio and Notes keeps a visible stop control', async () => {
  const { start, stop, preview } = observeAudio();
  await mount();
  await click('Play tone Space');
  stop.mockClear();
  await click('Notes');
  expect(stop).toHaveBeenCalled();
  expect(container.querySelector('.play-button').className).not.toContain(
    'is-playing',
  );
  start.mockClear();
  await act(() =>
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'Space', key: ' ', bubbles: true }),
    ),
  );
  expect(start).not.toHaveBeenCalled();
  await click('Hear this note');
  expect(preview).toHaveBeenCalled();
  stop.mockClear();
  await click('Stop sound');
  expect(stop).toHaveBeenCalled();
  stop.mockClear();
  await act(() =>
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    ),
  );
  expect(stop).toHaveBeenCalled();
});

test('Tempo lesson opens its working example and sends the chosen tempo to audio', async () => {
  const { preview, stop } = observeAudio();
  await mount();
  await click(/Music theory/);
  await click(/Tempo and its marks/);
  await click('Open this experiment');
  expect(container.querySelector('.notes-lab')).not.toBeNull();
  await click('♩ = 120');
  await click('Four steady beats');
  expect(preview).toHaveBeenCalledTimes(1);
  const [frequencies, wave, gain, duration, spacing] = preview.mock.calls[0];
  expect(frequencies).toHaveLength(4);
  expect(frequencies[0]).toBeCloseTo(261.625565, 4);
  expect(wave).toBe('triangle');
  expect(gain).toBe(0.18);
  expect(duration).toBe(0.125);
  expect(spacing).toBe(0.5);
  stop.mockClear();
  await click('Stop example');
  expect(stop).toHaveBeenCalled();
  preview.mockRejectedValueOnce(new Error('device unavailable'));
  await click('Four steady beats');
  expect(container.querySelector('[role="alert"]').textContent).toContain(
    'Audio is unavailable',
  );
});

test('Each rhythmic lesson selects its actual controls and dynamics retains the generator', async () => {
  await mount();
  for (const [lesson, button] of [
    ['Note values and rests', 'One whole note'],
    ['Dots and ties', 'Two quarter notes tied'],
    ['Dividing the beat', 'Three triplet eighths per beat'],
    ['Joined or separated', 'Short detached tones'],
    ['Printed order, played order', 'Repeat with a changed ending'],
  ]) {
    await click(/Music theory/);
    if (container.querySelector('.lesson-article'))
      await click('All foundations');
    await click(new RegExp(lesson));
    await click('Open this experiment');
    expect(
      [...container.querySelectorAll('.notation-example-actions button')].some(
        (b) => b.textContent.includes(button),
      ),
    ).toBe(true);
  }
  await click(/Music theory/);
  await click('All foundations');
  await click(/Loudness without a number/);
  await click('Open this experiment');
  expect(container.querySelector('.notes-lab')).toBeNull();
  expect(
    getComputedStyle(container.querySelector('.instrument-grid')).display,
  ).not.toBe('none');
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
