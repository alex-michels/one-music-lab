import { afterEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Practice } from '../../components/learning.tsx';
import { exerciseModes } from '../../lib/learning.ts';
import { generateFrom, grade } from '../../lib/exercises.ts';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
function render(lang) {
  if (!container) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  }
  return act(() =>
    root.render(
      createElement(Practice, {
        lang,
        reference: 440,
        play: vi.fn().mockResolvedValue(),
      }),
    ),
  );
}
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = null;
  container?.remove();
  container = null;
  vi.restoreAllMocks();
});

const click = (name) =>
  act(async () => page.getByRole('button', { name, exact: true }).click());
const answers = () => [...container.querySelectorAll('.answer-grid button')];
const prompt = () => container.querySelector('.exercise-prompt').textContent;

test('The notation trainer asks, grades and explains, and keeps the ear trainer reachable', async () => {
  await render('en');
  // The ear trainer is what the page opens on, so switching must be deliberate.
  expect(container.querySelector('.exercise-prompt')).toBeNull();
  await click('Reading notation');
  expect(container.querySelector('.exercise-prompt')).not.toBeNull();

  // The first item is seed 1 of the first kind, so the test knows the answer
  // without reading it off the page it is testing.
  const item = generateFrom('octave-region', 1, 1, 'en');
  expect(prompt()).toBe(item.prompt);
  const wrong = item.options.find((o) => o.tag !== 'correct');
  const buttons = answers();
  expect(buttons).toHaveLength(item.options.length);

  await act(async () => {
    buttons[item.options.indexOf(wrong)].click();
  });
  const feedback = container.querySelector('.answer-feedback');
  expect(feedback.className).toContain('incorrect');
  // A wrong answer is explained by the tag its own option carries.
  expect(grade(item, wrong.id).correct).toBe(false);
  expect(feedback.textContent.length).toBeGreaterThan(20);
  expect(container.querySelector('.score').textContent).toContain('0');

  // Answering again before moving on must not be possible.
  expect(answers().every((b) => b.disabled)).toBe(true);

  await click('Next question');
  expect(prompt()).not.toBe(item.prompt);
  expect(container.querySelector('.answer-feedback')).toBeNull();

  await click('Ear training');
  expect(container.textContent).toContain('Listen to the space between.');
});

test('Every exercise kind produces an answerable question in all three languages', async () => {
  for (const lang of ['en', 'ru', 'de']) {
    await render(lang);
    await click(
      lang === 'en'
        ? 'Reading notation'
        : lang === 'ru'
          ? 'Чтение нотной записи'
          : 'Notentext lesen',
    );
    for (const mode of exerciseModes) {
      await click(mode.label[lang]);
      expect(prompt().trim().length).toBeGreaterThan(0);
      const buttons = answers();
      expect(buttons.length).toBeGreaterThan(1);
      // Answer whatever is offered first: the point is that every kind can be
      // played through in every language, not which option is right.
      await act(async () => {
        buttons[0].click();
      });
      expect(container.querySelector('.answer-feedback')).not.toBeNull();
      await click(
        lang === 'en'
          ? 'Next question'
          : lang === 'ru'
            ? 'Следующий вопрос'
            : 'Nächste Frage',
      );
    }
    const [score, of] = container
      .querySelector('.score')
      .textContent.split('/')
      .map((n) => Number.parseInt(n, 10));
    expect(of).toBe(exerciseModes.length);
    expect(score).toBeGreaterThanOrEqual(0);
    if (root) await act(() => root.unmount());
    root = null;
    container?.remove();
    container = null;
  }
});

test('Staff-based questions draw the staff they ask about', async () => {
  await render('en');
  await click('Reading notation');
  for (const [mode, expectStaff] of [
    ['Read a note', true],
    ['Change of clef', true],
    ['How far a sign reaches', true],
    ['Registers', false],
  ]) {
    await click(mode);
    const staff = container.querySelector('svg.staff');
    if (expectStaff) {
      expect(staff, `${mode} drew no staff`).not.toBeNull();
      // The picture is the question, so it has to carry a name of its own.
      expect(staff.querySelector('title').textContent.length).toBeGreaterThan(
        0,
      );
      // Five staff lines at least; a clef and a head as paths.
      expect(staff.querySelectorAll('line').length).toBeGreaterThanOrEqual(5);
      expect(staff.querySelectorAll('path').length).toBeGreaterThanOrEqual(2);
    } else {
      expect(staff, `${mode} drew a staff it does not need`).toBeNull();
    }
  }
});

test('A sign that stops at the barline is drawn with the barline', async () => {
  await render('en');
  await click('Reading notation');
  await click('How far a sign reaches');
  const staff = container.querySelector('svg.staff');
  // Three notes and a barline: the rule cannot be read without seeing where
  // the bar ends.
  expect(staff.querySelectorAll('path').length).toBeGreaterThanOrEqual(4);
  expect(prompt().length).toBeGreaterThan(10);
  expect(answers().length).toBe(2);
});
