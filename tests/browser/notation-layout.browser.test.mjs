import { afterEach, expect, test, vi } from 'vitest';
import { page, userEvent, server } from 'vitest/browser';
import { act, createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { NotesLab } from '../../components/notes-lab.tsx';
import { initialNotesLabState } from '../../lib/notation-experiments.ts';
import {
  chooseNotation,
  openNotationChoice,
  closeNotationChoice,
} from './notation-select-helper.mjs';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
function ControlledLab(props) {
  const [state, onChange] = useState(initialNotesLabState);
  return createElement(NotesLab, {
    ...props,
    state,
    onChange,
    reference: 440,
    tuning: 'equal',
  });
}
async function mount(lang, props = {}) {
  container = document.body.appendChild(document.createElement('div'));
  container.style.cssText = 'max-width:1200px;margin:auto;padding:16px';
  root = createRoot(container);
  await act(() =>
    root.render(
      createElement(ControlledLab, {
        lang,
        play: vi.fn(),
        stop: vi.fn(),
        playExample: vi.fn(),
        ...props,
      }),
    ),
  );
}
afterEach(async () => {
  if (root) await act(() => root.unmount());
  container?.remove();
  root = container = null;
  delete document.documentElement.dataset.theme;
  await page.viewport(1280, 900);
});
function luminance(color) {
  const rgb = color
    .match(/[\d.]+/g)
    .slice(0, 3)
    .map(Number)
    .map((n) => n / 255);
  return rgb
    .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4))
    .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
}
function contrast(foreground, background) {
  const a = luminance(foreground),
    b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
const valueText = (control) =>
  control.querySelector('[data-slot="select-value"]').textContent;

for (const lang of ['en', 'ru', 'de']) {
  for (const width of [320, 768, 1280]) {
    test(`Notes lab controls, scores and menus remain readable at ${width}px in ${lang}`, async () => {
      await page.viewport(width, 900);
      await mount(lang);
      for (const theme of ['light', 'dark']) {
        document.documentElement.dataset.theme = theme;
        const lab = container.querySelector('.notes-lab');
        expect(lab.scrollWidth).toBeLessThanOrEqual(lab.clientWidth + 1);
        expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
          width + 1,
        );
        for (const button of lab.querySelectorAll(
          '.note-chooser button, .notation-transport button, .notation-example-actions > button, [role="combobox"]',
        )) {
          const rect = button.getBoundingClientRect();
          expect(rect.height, button.textContent).toBeGreaterThanOrEqual(44);
          expect(rect.width, button.textContent).toBeGreaterThanOrEqual(44);
          expect(rect.width).toBeLessThanOrEqual(lab.clientWidth);
        }
        for (const score of lab.querySelectorAll(
          '.staff, .notation-figure, .notation-signature',
        )) {
          const style = getComputedStyle(score);
          expect(contrast(style.color, style.backgroundColor)).toBeGreaterThan(
            10,
          );
          expect(style.borderWidth).toBe('0px');
          if (theme === 'dark')
            expect(style.backgroundColor).toBe(
              getComputedStyle(lab.querySelector('.panel')).backgroundColor,
            );
        }
        for (const transport of lab.querySelectorAll('.notation-transport')) {
          const [play, stop] = [...transport.children].map((button) =>
            button.getBoundingClientRect(),
          );
          // When two controls share a row, inherited button margins must not
          // displace one of them. Wrapping to separate rows is allowed.
          if (
            Math.min(play.bottom, stop.bottom) > Math.max(play.top, stop.top)
          ) {
            expect(
              Math.abs((play.top + play.bottom - stop.top - stop.bottom) / 2),
            ).toBeLessThanOrEqual(1);
          }
        }
        // Every popup is a portal. Its readable colours must survive outside
        // the lab container and when an option is highlighted by the keyboard.
        for (const label of [
          ...lab.querySelectorAll('.notation-field > label'),
        ].map((el) => el.textContent)) {
          const control = await openNotationChoice(label);
          const before = valueText(control.element());
          // Inspect this trigger's list, not a previous popup still fading out.
          const popup = document.getElementById(
            control.element().getAttribute('aria-controls'),
          );
          expect(popup).not.toBeNull();
          const bg = getComputedStyle(
            popup.closest('[data-slot="select-content"]'),
          ).backgroundColor;
          const rect = popup.getBoundingClientRect();
          expect(rect.left).toBeGreaterThanOrEqual(0);
          expect(rect.right).toBeLessThanOrEqual(width + 1);
          for (const option of popup.querySelectorAll('[role="option"]')) {
            const style = getComputedStyle(option);
            expect(
              contrast(
                style.color,
                option.hasAttribute('data-highlighted')
                  ? style.backgroundColor
                  : bg,
              ),
              option.textContent,
            ).toBeGreaterThanOrEqual(4.5);
            expect(option.scrollWidth).toBeLessThanOrEqual(
              option.clientWidth + 1,
            );
          }
          await act(() => userEvent.keyboard('{ArrowDown}'));
          const highlighted = popup.querySelector('[data-highlighted]');
          expect(highlighted).not.toBeNull();
          const ink = getComputedStyle(highlighted);
          expect(
            contrast(ink.color, ink.backgroundColor),
          ).toBeGreaterThanOrEqual(4.5);
          await closeNotationChoice(control);
          expect(valueText(control.element())).toBe(before);
          expect(document.activeElement).toBe(control.element());
          expect(getComputedStyle(control.element()).outlineStyle).toBe(
            'solid',
          );
        }
        if (lang === 'ru' && width !== 768 && server.browser === 'chromium') {
          // Capture individual panels within the real iframe viewport; a
          // full-height iframe screenshot can leave off-screen areas blank.
          for (const name of [
            'note-builder',
            'note-readout',
            'notation-examples',
            'note-placement',
            'notation-settings',
            'notation-result',
            'notation-sequence-study',
          ]) {
            const panel = lab.querySelector(`.${name}`);
            panel.scrollIntoView({ block: 'start' });
            await page.screenshot({
              path: `../../outputs/notes-lab-redesign/ru-${width}-${theme}-${name}.png`,
              element: panel,
            });
          }
        }
      }
    });
  }
}

test('Clef and octave menus preserve the pitch model, and comparison audio can be stopped beside its play control', async () => {
  const play = vi.fn(),
    stop = vi.fn();
  await mount('en', { play, stop });
  for (const clef of ['Bass', 'Alto', 'Tenor', 'Treble']) {
    const before = container.querySelector('.note-readout .staff').innerHTML;
    await chooseNotation('Clef', clef);
    expect(container.querySelector('.note-name').textContent).toBe('C4');
    expect(container.querySelector('.note-readout .staff').innerHTML).not.toBe(
      before,
    );
  }
  await chooseNotation('Octave', 'octave 0');
  expect(
    page.getByRole('button', { name: 'Hear this note', exact: true }).element()
      .disabled,
  ).toBe(true);
  await chooseNotation('Octave', 'octave 8');
  expect(container.querySelector('.note-name').textContent).toBe('C8');
  expect(play).not.toHaveBeenCalled();
  await chooseNotation('Octave', 'octave 4');
  await act(() =>
    page.getByRole('button', { name: 'Hear the result', exact: true }).click(),
  );
  expect(play).toHaveBeenLastCalledWith(60);
  stop.mockClear();
  await act(() =>
    page.getByRole('button', { name: 'Stop comparison', exact: true }).click(),
  );
  expect(stop).toHaveBeenCalledOnce();
});
