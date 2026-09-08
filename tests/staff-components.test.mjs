/** @vitest-environment jsdom */
import { test, expect, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { Staff } from '../components/staff.tsx';
import { StaffAnswer, staffWords } from '../components/staff-answer.tsx';
import { generate } from '../lib/exercises.ts';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
test('Invalid display scales fail clearly and invalid barline positions cannot damage the drawing', () => {
  const props = {
    pitches: [{ letter: 0, octave: 4, accidental: 0, midi: 60 }],
    lang: 'en',
  };
  for (const space of [NaN, 0, 3, 65, Infinity])
    expect(() =>
      renderToStaticMarkup(createElement(Staff, { ...props, space })),
    ).toThrow('Staff space');
  const result = renderToStaticMarkup(
    createElement(Staff, { ...props, barlines: [-1, 0, 0, 9] }),
  );
  expect((result.match(/data-barline=/g) || []).length).toBe(1);
});

test('Wrong exercise types are refused at the staff-answer boundary', () => {
  for (const item of [
    generate('octave-region', 1, 1, 'en'),
    { ...generate('read-pitch', 1, 1, 'en'), staff: undefined },
  ]) {
    expect(() =>
      renderToStaticMarkup(
        createElement(StaffAnswer, { item, chosen: null, onAnswer: vi.fn() }),
      ),
    ).toThrow('read-pitch');
  }
});

test('Programmatic submission cannot score an empty placement or score a completed item twice', async () => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const item = generate('read-pitch', 1, 1, 'en');
  const onAnswer = vi.fn();
  const render = async (chosen) => {
    await act(async () => {
      root.render(createElement(StaffAnswer, { item, chosen, onAnswer }));
    });
  };
  try {
    await render(null);
    await act(async () => {
      [...container.querySelectorAll('button')]
        .find((b) => b.textContent === staffWords.en.place)
        .click();
    });
    await act(async () => {
      container.querySelector('form').requestSubmit();
    });
    expect(onAnswer).not.toHaveBeenCalled();
    await render('a');
    await act(async () => {
      container.querySelector('form').requestSubmit();
    });
    expect(onAnswer).not.toHaveBeenCalled();
  } finally {
    await act(async () => {
      root.unmount();
    });
    container.remove();
  }
});
