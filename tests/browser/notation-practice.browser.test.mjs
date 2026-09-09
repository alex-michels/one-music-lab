import { afterEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Practice } from '../../components/learning.tsx';
import { generateFrom, grade, RULES } from '../../lib/exercises.ts';
import { paragraphAnchors, ruleKind, ruleTopic } from '../../lib/topics.ts';
import { pitchName } from '../../lib/notation.ts';
import { DRILL_STORAGE_KEY } from '../../lib/client-store.ts';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
function render(lang, topic = null) {
  if (!container) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  }
  return act(() => root.render(createElement(Practice, { lang, topic })));
}
async function unmount() {
  if (root) await act(() => root.unmount());
  root = null;
  container?.remove();
  container = null;
}
/**
 * The ledger deliberately outlives the component — that is the whole point of
 * it — so it also outlives a test. Every test that starts from nothing has to
 * clear it through the one control that clears it, which is the same path a
 * reader takes.
 */
async function fresh(lang, topic = null) {
  await render(lang, topic);
  await click('Start a new session');
}
afterEach(async () => {
  await unmount();
  sessionStorage.removeItem(DRILL_STORAGE_KEY);
  vi.restoreAllMocks();
  await page.viewport(1280, 900);
});

const click = (name) =>
  act(async () => page.getByRole('button', { name, exact: true }).click());
const answers = () => [
  ...container.querySelectorAll('.drill-question .answer-grid button'),
];
const prompt = () => container.querySelector('.exercise-prompt').textContent;
const rows = () => [...container.querySelectorAll('.ledger-row')];
const rowFor = (rule) =>
  rows().find((row) => row.querySelector('dt').textContent === rule);

test('The drill asks, grades, explains and waits, and files the answer under the rule', async () => {
  // Start it on the first rule of the interleaved drill, whose seed and kind
  // the test can reproduce without reading them off the page it is testing.
  await fresh('en');
  const item = generateFrom(ruleKind[RULES[0]], 1, 1, 'en');
  expect(prompt()).toBe(item.prompt);
  const wrong = item.options.find((o) => o.tag !== 'correct');
  expect(grade(item, wrong.id).correct).toBe(false);

  const buttons = answers();
  expect(buttons).toHaveLength(item.options.length);
  await act(async () => {
    buttons[item.options.indexOf(wrong)].click();
  });
  const feedback = container.querySelector('.answer-feedback');
  expect(feedback.className).toContain('incorrect');
  expect(feedback.textContent.length).toBeGreaterThan(20);

  // Deleted, not restyled: no counter, no bar, no percentage anywhere.
  expect(container.querySelector('.score')).toBeNull();
  expect(container.querySelector('[role="progressbar"]')).toBeNull();
  expect(container.textContent).not.toMatch(/\d+\s*%/);

  // What replaces them is a row for the rule this item actually tested.
  const row = rowFor(item.rule);
  expect(row, `no ledger row for ${item.rule}`).toBeDefined();
  expect(row.querySelector('.ledger-tally').textContent).toBe(
    '1 question · 1 mistake',
  );
  expect(row.dataset.missed).toBe('yes');
  // Both exits, and the read one carries the rule as its anchor.
  const exits = [...row.querySelectorAll('.ledger-exits a')].map((a) =>
    a.getAttribute('href'),
  );
  expect(exits).toEqual([
    `#/en/t/${ruleTopic[item.rule]}/read~${item.rule}`,
    `#/en/t/${ruleTopic[item.rule]}/define`,
  ]);

  // Answering again before moving on must not be possible, and nothing
  // advances on its own: the explanation is the point of getting it wrong.
  expect(answers().every((b) => b.disabled)).toBe(true);
  await click('Next question');
  expect(prompt()).not.toBe(item.prompt);
  expect(container.querySelector('.answer-feedback')).toBeNull();
  expect(rowFor(item.rule).querySelector('.ledger-tally').textContent).toBe(
    '1 question · 1 mistake',
  );
});

test('The ledger names every rule of its scope, counts unasked ones honestly and survives leaving the lens', async () => {
  await fresh('en');
  expect(rows()).toHaveLength(RULES.length);
  // A rule nobody has been asked about says so rather than showing a zero,
  // which would read as a score of nothing.
  const untouched = rowFor('sign-stops-at-the-barline');
  expect(untouched.querySelector('.ledger-tally').textContent).toBe(
    'not yet asked',
  );
  expect(untouched.dataset.missed).toBeUndefined();
  // The weighting is stated once, and only once there is a miss to weight.
  expect(container.querySelector('.ledger-note')).toBeNull();

  const item = generateFrom(ruleKind[RULES[0]], 1, 1, 'en');
  const wrong = item.options.find((o) => o.tag !== 'correct');
  await act(async () => {
    answers()[item.options.indexOf(wrong)].click();
  });
  expect(container.querySelector('.ledger-note').textContent).toContain(
    'twice as often',
  );

  // The ledger lives above the lens: unmounting the drill, as a round trip to
  // the passage does, must not lose what the reader has done.
  await unmount();
  expect(sessionStorage.getItem(DRILL_STORAGE_KEY)).toContain(item.rule);
  await render('en');
  expect(rowFor(item.rule).querySelector('.ledger-tally').textContent).toBe(
    '1 question · 1 mistake',
  );

  // And one explicit control clears it. Nothing else does.
  await click('Start a new session');
  expect(rowFor(item.rule).querySelector('.ledger-tally').textContent).toBe(
    'not yet asked',
  );
  expect(sessionStorage.getItem(DRILL_STORAGE_KEY)).toBe('{}');
});

test('A topic scopes the drill to the rules that topic teaches', async () => {
  await fresh('en', 'dots-ties');
  const scoped = paragraphAnchors['dots-ties'];
  expect(scoped.length).toBeGreaterThan(1);
  expect(rows()).toHaveLength(scoped.length);
  expect(rows().map((row) => row.querySelector('dt').textContent)).toEqual([
    ...scoped,
  ]);
  // Fifteen questions is more than enough to leave the scope if it could.
  for (let i = 0; i < 15; i += 1) {
    const chosen = answers()[0];
    await act(async () => chosen.click());
    await click('Next question');
  }
  const asked = rows().filter(
    (row) => row.querySelector('.ledger-tally').textContent !== 'not yet asked',
  );
  expect(asked.length).toBeGreaterThan(0);
  expect(asked.length).toBeLessThanOrEqual(scoped.length);

  // A topic with no rule is not given an invented drill; it falls back to the
  // interleaved one rather than showing an empty ledger.
  await unmount();
  await render('en', 'sound');
  expect(rows()).toHaveLength(RULES.length);
});

test('Every rule produces an answerable question in all three languages', async () => {
  for (const lang of ['en', 'ru', 'de']) {
    for (const rule of RULES) {
      await render(lang, ruleTopic[rule]);
      expect(prompt().trim().length).toBeGreaterThan(0);
      const buttons = answers();
      expect(buttons.length).toBeGreaterThan(1);
      // Answer whatever is offered first: the point is that every rule can be
      // played through in every language, not which option is right.
      await act(async () => {
        buttons[0].click();
      });
      expect(container.querySelector('.answer-feedback')).not.toBeNull();
      await unmount();
    }
  }
});

test('An engraved question never reads its own answer out', async () => {
  // The staff names itself from the pitches it drew, which on a question is
  // the answer key. Every engraved kind has to override it.
  for (const rule of RULES) {
    await render('en', ruleTopic[rule]);
    const staff = container.querySelector('.drill-question svg.staff');
    if (staff) {
      const title = staff.querySelector('title').textContent;
      expect(title.length, `${rule} drew a staff with no name`).toBeGreaterThan(
        0,
      );
      const spoken = [
        ...container.querySelectorAll('.drill-question .answer-grid button'),
      ].map((b) => b.textContent.trim());
      for (const option of spoken)
        expect(
          title,
          `${rule}: the staff says “${title}”, which contains the option “${option}”`,
        ).not.toContain(option);
      expect(staff.querySelectorAll('line').length).toBeGreaterThanOrEqual(5);
    }
    await unmount();
  }
});

test('A sign that stops at the barline is drawn with the barline', async () => {
  await fresh('en', 'accidental-scope');
  const staff = container.querySelector('svg.staff');
  // Three notes and a barline: the rule cannot be read without seeing where
  // the bar ends.
  expect(staff.querySelectorAll('path').length).toBeGreaterThanOrEqual(4);
  expect(prompt().length).toBeGreaterThan(10);
  expect(answers().length).toBe(2);
});

test('Typed and placed answers reach the ledger and reset for the next question', async () => {
  await fresh('en', 'staff');
  const first = generateFrom('read-pitch', 1, 1, 'en');
  const wrong = first.options.find((option) => option.id !== first.answer);
  await click('Type a name');
  await act(() =>
    page.getByRole('textbox', { name: 'Note name' }).fill(wrong.label),
  );
  await click('Check answer');
  expect(container.querySelector('.answer-feedback').className).toContain(
    'incorrect',
  );
  expect(container.querySelector('input').disabled).toBe(true);
  expect(
    rowFor('read-a-notated-pitch').querySelector('.ledger-tally').textContent,
  ).toBe('1 question · 1 mistake');

  await click('Next question');
  expect(container.querySelector('.answer-feedback')).toBeNull();
  await click('Type a name');
  expect(container.querySelector('input').value).toBe('');
  const second = container.querySelector('svg.staff');
  expect(second).not.toBeNull();
  await act(() =>
    page
      .getByRole('textbox', { name: 'Note name' })
      .fill(pitchName(first.staff.pitches[0], 'en')),
  );
  await click('Check answer');
  expect(
    rowFor('read-a-notated-pitch').querySelector('.ledger-tally').textContent,
  ).toMatch(/^2 questions · [12] mistakes?$/);

  await click('Next question');
  await click('Place on the staff');
  expect(
    container.querySelector('.staff-position [aria-pressed="true"]'),
  ).toBeNull();
  expect(
    page.getByRole('button', { name: 'Check answer' }).element().disabled,
  ).toBe(true);
  await click('Line 1');
  await click('Check answer');
  expect(
    rowFor('read-a-notated-pitch').querySelector('.ledger-tally').textContent,
  ).toMatch(/^3 questions/);
});

test('The ledger becomes a disclosure on a phone without the page scrolling sideways', async () => {
  await page.viewport(390, 844);
  await fresh('en');
  const ledger = container.querySelector('.drill-ledger');
  expect(ledger.tagName).toBe('DETAILS');
  expect(ledger.open).toBe(true);
  expect(getComputedStyle(ledger).position).toBe('static');
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
    window.innerWidth + 1,
  );
  // Closing it is the reader's call, and closing it hides the rows.
  await act(async () => {
    ledger.open = false;
  });
  expect(container.querySelector('.ledger-row').checkVisibility()).toBe(false);
});
