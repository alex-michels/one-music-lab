/** @vitest-environment jsdom */
import { afterEach, expect, test, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { Theory, Practice } from '../components/learning.tsx';
import { NotationFigure } from '../components/notation-figure.tsx';
import { NotationResponse } from '../components/notation-response.tsx';
import { NotationWorkbench } from '../components/notation-workbench.tsx';
import { Staff } from '../components/staff.tsx';
import { StaffPosition } from '../components/staff-answer.tsx';
import { generateFrom } from '../lib/exercises.ts';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const originalScrollIntoView = Object.getOwnPropertyDescriptor(
  Element.prototype,
  'scrollIntoView',
);
let root, container;
async function mount(Component, props) {
  if (!container) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  }
  await act(() => root.render(createElement(Component, props)));
}
afterEach(async () => {
  if (root) await act(() => root.unmount());
  container?.remove();
  root = container = null;
  vi.restoreAllMocks();
  if (originalScrollIntoView)
    Object.defineProperty(
      Element.prototype,
      'scrollIntoView',
      originalScrollIntoView,
    );
  else delete Element.prototype.scrollIntoView;
});

test('Unknown notation figures fail explicitly instead of rendering a blank score', () => {
  for (const id of ['missing-figure', 'toString', '__proto__'])
    expect(() =>
      renderToStaticMarkup(
        createElement(NotationFigure, { id, label: 'Invalid figure' }),
      ),
    ).toThrow('Unknown notation figure');
});

test('Following another rule, lesson or language starts an unanswered inline question', async () => {
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
  const props = {
    lang: 'en',
    lessonId: 'dots-ties',
    anchor: 'dot-adds-half',
    setLessonId: vi.fn(),
    openLab: vi.fn(),
  };
  await mount(Theory, props);
  await act(() => container.querySelector('.answer-grid button').click());
  expect(container.querySelector('.answer-feedback')).not.toBeNull();
  await mount(Theory, {
    ...props,
    anchor: 'second-dot-adds-half-the-first',
  });
  expect(container.querySelector('.answer-feedback')).toBeNull();
  expect(container.querySelector('.answer-grid button').disabled).toBe(false);
  expect(container.querySelector('.exercise-prompt').textContent).toMatch(
    /two|double/i,
  );
  await act(() => container.querySelector('.answer-grid button').click());
  await mount(Theory, { ...props, lang: 'de' });
  expect(container.querySelector('.answer-feedback')).toBeNull();
  await act(() => container.querySelector('.answer-grid button').click());
  await mount(Theory, {
    ...props,
    lessonId: 'articulation',
    anchor: 'recognize-an-ornament',
  });
  expect(container.querySelector('.notation-response')).not.toBeNull();
  expect(container.querySelector('.answer-feedback')).toBeNull();
});

/**
 * Not every drill item is a multiple choice. A scoped drill on `tempo` has one
 * rule, `metronome-unit`, and its generator emits an unscored review on some
 * seeds — which `NotationResponse` renders as a single primary button and no
 * `.answer-grid` at all. Asking for the grid specifically made this test assert
 * the shape of one widget rather than its actual subject, which is that
 * changing topic or language drops the answer and keeps the ledger.
 */
const answerControl = () =>
  container.querySelector(
    '.answer-grid button, .notation-response .primary-button',
  );

test('Switching drill topic or language clears the answer but keeps the session ledger', async () => {
  await mount(Practice, { lang: 'en', topic: 'durations' });
  await act(() =>
    [...container.querySelectorAll('button')]
      .find((button) => button.textContent === 'Start a new session')
      .click(),
  );
  await act(() => container.querySelector('.answer-grid button').click());
  expect(container.querySelector('.answer-feedback')).not.toBeNull();
  await mount(Practice, { lang: 'en', topic: 'tempo' });
  expect(container.querySelector('.answer-feedback')).toBeNull();
  expect(answerControl().disabled).toBe(false);
  await act(() => answerControl().click());
  await mount(Practice, { lang: 'de', topic: 'tempo' });
  expect(container.querySelector('.answer-feedback')).toBeNull();
  expect(answerControl().disabled).toBe(false);
  await mount(Practice, { lang: 'en', topic: 'durations' });
  expect(container.querySelector('.ledger-tally').textContent).toMatch(
    /^1 question/,
  );
  expect(container.querySelector('.answer-feedback')).toBeNull();
});

test('Both beam presentations provide the other grouping without a scored answer', async () => {
  for (const figure of ['beamed', 'flagged']) {
    const item = {
      ...generateFrom('beaming-review', 2, 1, 'en'),
      figure,
    };
    const complete = vi.fn();
    await mount(NotationResponse, { key: figure, item, onComplete: complete });
    expect(container.querySelectorAll('.notation-figure')).toHaveLength(2);
    await act(() => container.querySelector('button').click());
    expect(complete).toHaveBeenCalledExactlyOnceWith([]);
    expect(container.querySelector('output').textContent).toBe(
      item.explanation,
    );
    expect(container.querySelector('button')).toBeNull();
  }
});

test('Mixed excerpt feedback preserves pitch successes when a duration answer is wrong', async () => {
  const original = generateFrom('short-excerpt', 1, 1, 'en');
  const item = {
    ...original,
    parts: [
      ...original.parts.map((part) => ({ ...part, kind: 'pitch' })),
      ...original.parts.map((_, index) => ({
        kind: 'rhythm',
        prompt: `Duration of note ${index + 1}`,
        answer: '1/4',
        explanation: 'One quarter fills one of the four quarter-note beats.',
        options: [
          { id: '1/4', label: 'Quarter note', tag: 'correct' },
          { id: '1/8', label: 'Eighth note', tag: 'duration-symbol' },
        ],
      })),
    ],
  };
  // The Item contract also accepts pitch parts without a kind. They must
  // still count toward pitch success when combined with rhythm questions.
  delete item.parts[0].kind;
  const complete = vi.fn();
  await mount(NotationResponse, { item, onComplete: complete });
  const fields = [...container.querySelectorAll('fieldset')];
  for (const [index, part] of item.parts.entries()) {
    const answer = index === 5 ? '1/8' : part.answer;
    const option = part.options.find((candidate) => candidate.id === answer);
    await act(() =>
      [...fields[index].querySelectorAll('button')]
        .find((button) => button.textContent === option.label)
        .click(),
    );
  }
  expect(complete).toHaveBeenCalledExactlyOnceWith([
    true,
    true,
    true,
    true,
    true,
    false,
    true,
    true,
  ]);
  const summary = container.querySelector('[aria-live]').textContent;
  expect(summary).toContain('Answers correct: 7 / 8');
  expect(summary).toContain('Pitch: 4 / 4');
  expect(summary).toContain('Rhythm: 3 / 4');
  expect(fields[5].querySelector('output').textContent).toContain(
    'Compare the written value and its context',
  );
  expect(fields[5].querySelector('output').textContent).toContain(
    'One quarter fills one of the four quarter-note beats.',
  );
});

test('The workbench bounds octave shifts and disables playback outside its supported range', async () => {
  const play = vi.fn();
  const stop = vi.fn();
  const props = {
    pitch: { letter: 0, accidental: 0, octave: 4, midi: 60 },
    lang: 'en',
    play,
    stop,
  };
  const change = async (index, value) =>
    act(() => {
      const select = container.querySelectorAll('select')[index];
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
  await mount(NotationWorkbench, props);
  await change(1, '2');
  await change(1, 'signature');
  expect(container.querySelector('output').textContent).toContain('C4');
  await change(2, '-2');
  expect(container.querySelector('output').textContent).toContain('15mb');
  await mount(NotationWorkbench, {
    ...props,
    pitch: { letter: 0, accidental: 0, octave: 0, midi: 12 },
  });
  expect(container.querySelectorAll('select')[2].value).toBe('0');
  expect(container.querySelector('output').textContent).toContain('C0');
  expect(container.querySelector('.primary-button').disabled).toBe(true);
  await change(2, '2');
  await mount(NotationWorkbench, {
    ...props,
    pitch: { letter: 6, accidental: 0, octave: 8, midi: 119 },
  });
  expect(container.querySelectorAll('select')[2].value).toBe('0');
  expect(container.querySelector('.primary-button').disabled).toBe(true);
  expect(play).not.toHaveBeenCalled();
  expect(stop).toHaveBeenCalled();
});

test('Signature controls expose the tied and freshly attacked results separately in every locale', async () => {
  for (const lang of ['en', 'ru', 'de']) {
    await mount(NotationWorkbench, {
      key: lang,
      pitch: { letter: 3, accidental: 0, octave: 4, midi: 65 },
      lang,
      play: vi.fn(),
      stop: vi.fn(),
    });
    await act(async () => {
      const [signature, accidental] = container.querySelectorAll('select');
      signature.value = '1';
      signature.dispatchEvent(new Event('change', { bubbles: true }));
      accidental.value = '0';
      accidental.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const values = [
      ...container.querySelectorAll('.accidental-sequence li'),
    ].map((entry) => entry.textContent);
    expect(values).toEqual(
      lang === 'en'
        ? ['F4', 'F♯5', 'F4', 'F4', 'F♯4']
        : lang === 'de'
          ? ['f′', 'fis″', 'f′', 'f′', 'fis′']
          : [
              'фа, первая октава',
              'фа-диез, вторая октава',
              'фа, первая октава',
              'фа, первая октава',
              'фа-диез, первая октава',
            ],
    );
    expect(container.querySelectorAll('[data-tie="2"]')).toHaveLength(1);
    expect(container.querySelector('[data-tie]').getAttribute('fill')).toBe(
      'none',
    );
  }
});

test('Staff ties require equal adjacent written pitches, not just enharmonic sound', () => {
  const c = { letter: 0, accidental: 0, octave: 4, midi: 60 };
  const d = { letter: 1, accidental: 0, octave: 4, midi: 62 };
  const draw = (pitches, ties) =>
    renderToStaticMarkup(
      createElement(Staff, {
        pitches,
        ties,
        lang: 'en',
      }),
    );
  expect(draw([c, c], [0])).toContain('data-tie="0"');
  expect(draw([c, c], [0, 0]).match(/data-tie=/g)).toHaveLength(1);
  for (const [pitches, ties] of [
    [[c, c], [-1]],
    [[c, c], [1]],
    [[c, c], [0.5]],
    [[c, d], [0]],
    [[c, { ...c, octave: 5, midi: 72 }], [0]],
    [[c, { ...c, accidental: 1, midi: 61 }], [0]],
    [[c, { letter: 6, accidental: 1, octave: 3, midi: 60 }], [0]],
  ])
    expect(() => draw(pitches, ties)).toThrow('A tie must join');
});

test('Placement supports zero and six ledger lines with bounded Home/End keyboard access', async () => {
  for (const ledgerLines of [0, 6]) {
    const onChange = vi.fn();
    await mount(StaffPosition, {
      clef: 'treble',
      accidental: 0,
      lang: 'en',
      disabled: false,
      value: null,
      onChange,
      ledgerLines,
    });
    expect(container.querySelectorAll('button')).toHaveLength(
      11 + 4 * ledgerLines,
    );
    const center = container.querySelector('button[tabindex="0"]');
    await act(() =>
      center.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
      ),
    );
    expect(onChange).toHaveBeenLastCalledWith(9 + 2 * ledgerLines);
    await act(() =>
      center.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
      ),
    );
    expect(onChange).toHaveBeenLastCalledWith(-1 - 2 * ledgerLines);
  }
});
