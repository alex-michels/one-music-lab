import { afterEach, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { act, createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  StaffAnswer,
  staffWords,
  positionLabel,
} from '../../components/staff-answer.tsx';
import { generate } from '../../lib/exercises.ts';
import { pitchName } from '../../lib/notation.ts';
import { staffStep } from '../../lib/staff.ts';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
function Harness({ item, onAnswer }) {
  const [chosen, setChosen] = useState(null);
  return createElement(StaffAnswer, {
    item,
    chosen,
    onAnswer(id) {
      onAnswer(id);
      setChosen(id);
    },
  });
}
async function render(item, onAnswer) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(() => root.render(createElement(Harness, { item, onAnswer })));
}
async function clean() {
  if (root) await act(() => root.unmount());
  root = null;
  container?.remove();
  container = null;
}
afterEach(clean);
const press = (locator, key) =>
  act(async () => {
    locator.element().focus();
    await userEvent.keyboard(`{${key}}`);
  });
const click = (name) =>
  act(() => page.getByRole('button', { name, exact: true }).click());

test('Typing validates localized names, rejects blanks, grades spelling and locks a submitted answer', async () => {
  for (const lang of ['en', 'ru', 'de']) {
    const t = staffWords[lang];
    const item = generate('read-pitch', 3, 553, lang);
    const onAnswer = vi.fn();
    await render(item, onAnswer);
    const picture = container.querySelector('svg.staff');
    expect(picture.getAttribute('aria-labelledby')).toBe(
      picture.querySelector('title').id,
    );
    // The picture is the question, so while it is unanswered it says only what
    // is being asked. Reading out the clef and the position, as it used to,
    // spelled the answer to a screen-reader user before they had answered.
    expect(picture.querySelector('title').textContent).toBe(t.unsolved);
    await click(t.type);
    await click(t.check);
    expect(container.querySelector('[role="alert"]').textContent).toBe(
      t.invalid,
    );
    expect(onAnswer).not.toHaveBeenCalled();
    const input = page.getByRole('textbox', { name: t.input });
    await act(() => input.fill(pitchName(item.staff.pitches[0], lang)));
    await press(input, 'Enter');
    expect(onAnswer).toHaveBeenCalledExactlyOnceWith(item.answer);
    expect(container.querySelector('input').disabled).toBe(true);
    expect(container.textContent).toContain(t.answer);
    // Once it has been answered the description is feedback, not the key, so
    // the notation is spelled out in full.
    const named = container.querySelector('svg.staff title').textContent;
    expect(named).toContain(t.clef);
    expect(named).toContain(t.sign);
    await clean();
  }
});

test('A valid but different written note is wrong, including German H versus B', async () => {
  const item = generate('read-pitch', 1, 1, 'de');
  item.staff.pitches = [{ letter: 6, octave: 4, accidental: 0, midi: 71 }];
  const onAnswer = vi.fn();
  await render(item, onAnswer);
  await click(staffWords.de.type);
  await act(() => page.getByRole('textbox').fill('B'));
  await click(staffWords.de.check);
  expect(onAnswer).toHaveBeenCalledExactlyOnceWith('written-wrong');
  expect(container.textContent).toContain('H');
});

test('Staff positions respond to real clicks, and keyboard navigation stays bounded', async () => {
  for (const lang of ['en', 'ru', 'de']) {
    const t = staffWords[lang];
    const onAnswer = vi.fn();
    const item = generate('read-pitch', 3, 127, lang);
    await render(item, onAnswer);
    await click(t.place);
    expect(container.querySelector('.primary-button').disabled).toBe(true);
    const targetStep = staffStep(item.staff.pitches[0], item.staff.clef);
    await click(positionLabel(targetStep, lang));
    expect(
      container
        .querySelector('[aria-pressed="true"][tabindex="0"]')
        .getAttribute('aria-label'),
    ).toBe(positionLabel(targetStep, lang));
    await click(t.check);
    expect(onAnswer).toHaveBeenCalledExactlyOnceWith(item.answer);
    await clean();
  }
  const item = generate('read-pitch', 1, 553, 'en');
  const onAnswer = vi.fn();
  await render(item, onAnswer);
  await click(staffWords.en.place);
  const middle = page.getByRole('button', { name: 'Line 3', exact: true });
  await press(middle, 'Home');
  const low = page.getByRole('button', {
    name: positionLabel(-3, 'en'),
    exact: true,
  });
  await press(low, 'ArrowDown');
  expect(document.activeElement.getAttribute('aria-label')).toBe(
    positionLabel(-3, 'en'),
  );
  await press(low, 'End');
  const high = page.getByRole('button', {
    name: positionLabel(11, 'en'),
    exact: true,
  });
  await press(high, 'ArrowUp');
  expect(document.activeElement.getAttribute('aria-label')).toBe(
    positionLabel(11, 'en'),
  );
  await press(high, 'ArrowLeft');
  expect(document.activeElement.getAttribute('aria-label')).toBe(
    positionLabel(10, 'en'),
  );
  await press(
    page.getByRole('button', { name: positionLabel(10, 'en'), exact: true }),
    'ArrowRight',
  );
  await press(high, 'Enter');
  await click(staffWords.en.check);
  expect(onAnswer).toHaveBeenCalledExactlyOnceWith(
    staffStep(item.staff.pitches[0], item.staff.clef) === 11
      ? item.answer
      : 'written-wrong',
  );
});

test('Choices use the same answer and show both correction and wrong selection', async () => {
  for (const correct of [true, false]) {
    const item = generate('read-pitch', 2, 109, 'en');
    const onAnswer = vi.fn();
    await render(item, onAnswer);
    const option = item.options.find((o) => (o.id === item.answer) === correct);
    await click(option.label);
    expect(onAnswer).toHaveBeenCalledExactlyOnceWith(option.id);
    expect(container.querySelector('.answer-correct').textContent).toBe(
      item.options.find((o) => o.id === item.answer).label,
    );
    if (!correct)
      expect(container.querySelector('.answer-wrong').textContent).toBe(
        option.label,
      );
    await clean();
  }
});
