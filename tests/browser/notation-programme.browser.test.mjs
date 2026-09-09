import { afterEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { NotationFigure } from '../../components/notation-figure.tsx';
import { NotationReading } from '../../components/notation-reading.tsx';
import { NotationResponse } from '../../components/notation-response.tsx';
import { NotationWorkbench } from '../../components/notation-workbench.tsx';
import { Practice, Theory } from '../../components/learning.tsx';
import { generateFrom } from '../../lib/exercises.ts';
import {
  notationProgramme,
  notationFigureDescriptions,
} from '../../lib/notation-programme.ts';
import { AudioEngine } from '../../lib/audio.ts';
import { planNotationExample } from '../../lib/notation-experiments.ts';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
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
});
const click = (name) =>
  act(async () => page.getByRole('button', { name, exact: true }).click());
const select = (name, value) =>
  act(async () =>
    page.getByRole('combobox', { name, exact: true }).selectOptions(value),
  );
const c4 = { letter: 0, accidental: 0, octave: 4, midi: 60 };

test('Score figures have unique working glyph references and inherit both color themes', async () => {
  await mount('div', {
    children: ['note-4', 'rest-4', 'trill', 'note-4'].map((id, key) =>
      createElement(NotationFigure, { id, key, label: `Figure ${key}` }),
    ),
  });
  const ids = [...container.querySelectorAll('[id]')].map((node) => node.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const use of container.querySelectorAll('use'))
    expect(
      document.getElementById(use.getAttribute('xlink:href').slice(1)),
    ).not.toBeNull();
  expect(container.querySelectorAll('figure.notation-figure')).toHaveLength(4);
  expect(container.querySelector('[color="black"]')).toBeNull();
});

for (const lang of ['en', 'ru', 'de']) {
  test(`All 13 reading supplements have visible sources and figures in ${lang}`, async () => {
    for (const [topic, chapter] of Object.entries(notationProgramme)) {
      await mount(NotationReading, { topic, lang });
      expect(container.textContent).toContain(chapter.text[lang]);
      expect(container.querySelectorAll('figure.notation-figure')).toHaveLength(
        chapter.figures.length,
      );
      expect(container.querySelector('a').href).toBe(chapter.source.url);
      for (const id of chapter.figures) {
        const description = notationFigureDescriptions[id]?.[lang];
        if (description) {
          expect(
            [...container.querySelectorAll('figcaption')].some(
              (caption) => caption.textContent === description,
            ),
          ).toBe(true);
          expect(
            [...container.querySelectorAll('.notation-figure')].some(
              (figure) => figure.getAttribute('aria-label') === description,
            ),
          ).toBe(true);
        }
      }
    }
    await mount(NotationReading, { topic: 'sound', lang });
    expect(container.textContent).toBe('');
  });

  test(`Excerpt keeps three successful notes when one answer is wrong in ${lang}`, async () => {
    const item = generateFrom('short-excerpt', 1, 48, lang),
      complete = vi.fn();
    await mount(NotationResponse, { item, onComplete: complete });
    const fields = [...container.querySelectorAll('fieldset')];
    for (const [index, part] of item.parts.entries()) {
      const chosen =
        index === 1
          ? part.options.find((option) => option.id !== part.answer)
          : part.options.find((option) => option.id === part.answer);
      await act(() =>
        [...fields[index].querySelectorAll('button')]
          .find((button) => button.textContent === chosen.label)
          .click(),
      );
      expect(fields[index].querySelector('output').textContent).toContain(
        part.answer,
      );
      expect(fields[index].disabled).toBe(true);
    }
    expect(complete).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[aria-live]').textContent).toContain(
      '3 / 4',
    );
  });

  test(`Open review exposes a source and rubric without a numeric score in ${lang}`, async () => {
    for (const kind of ['ornament-review', 'beaming-review']) {
      const item = generateFrom(
          kind,
          2,
          kind === 'beaming-review' ? 22 : 1,
          lang,
        ),
        complete = vi.fn();
      await mount(NotationResponse, { key: kind, item, onComplete: complete });
      expect(container.querySelector('output')).toBeNull();
      await act(() => container.querySelector('button').click());
      expect(container.querySelector('output').textContent).toBe(
        item.explanation,
      );
      expect(container.querySelector('a').href).toBe(item.source.url);
      expect(complete).toHaveBeenCalledTimes(1);
    }
  });

  test(`Signature and octave controls use professional labels and bounded playback in ${lang}`, async () => {
    const play = vi.fn(),
      stop = vi.fn();
    await mount(NotationWorkbench, { pitch: c4, lang, play, stop });
    const controls = [...container.querySelectorAll('select')];
    const change = async (control, value) =>
      act(() => {
        control.value = value;
        control.dispatchEvent(new Event('change', { bubbles: true }));
      });
    expect(play).not.toHaveBeenCalled();
    await change(controls[0], '2'); // F and C sharp.
    expect(container.querySelector('output').textContent).toContain(
      lang === 'de' ? 'cis′' : lang === 'ru' ? 'до-диез' : 'C♯4',
    );
    await change(controls[1], '0'); // Natural replaces C sharp.
    await change(controls[2], '1');
    await act(() => container.querySelector('.primary-button').click());
    expect(play).toHaveBeenLastCalledWith(72);
    await change(controls[2], '-1');
    await act(() => container.querySelector('.primary-button').click());
    expect(play).toHaveBeenLastCalledWith(48);
    await act(() => container.querySelector('.text-button').click());
    expect(controls.map((control) => control.value)).toEqual([
      '0',
      'signature',
      '0',
    ]);
    expect(stop).toHaveBeenCalled();
    await mount(NotationWorkbench, {
      pitch: { ...c4, octave: 8, midi: 108 },
      lang,
      play,
      stop,
    });
    expect(
      [...container.querySelectorAll('select')[2].options].map(
        (option) => option.value,
      ),
    ).not.toContain('1');
  });
}

test('Every new topic explains its scored answer or open rubric and advances', async () => {
  for (const topic of ['durations', 'tempo', 'dynamics', 'repeats']) {
    await mount(Practice, { key: topic, topic, lang: 'en' });
    const answerButtons = [
      ...container.querySelectorAll('.answer-grid button'),
    ];
    if (answerButtons.length) {
      expect(answerButtons.length).toBeGreaterThan(1);
      await act(() => answerButtons[0].click());
    } else {
      await click('Compare with the rubric');
    }
    expect(
      container.querySelector('.answer-feedback').textContent.length,
    ).toBeGreaterThan(30);
    await click('Next question');
    expect(container.querySelector('.answer-feedback')).toBeNull();
  }
});

test('An inline question reached through a rule anchor actually tests that rule', async () => {
  await mount(Theory, {
    lang: 'en',
    lessonId: 'dots-ties',
    anchor: 'second-dot-adds-half-the-first',
    setLessonId: vi.fn(),
    openLab: vi.fn(),
  });
  expect(container.querySelector('.inline-exercise').id).toBe(
    'second-dot-adds-half-the-first',
  );
  expect(
    container.querySelector('.inline-exercise .exercise-prompt').textContent,
  ).toMatch(/two|double/i);
});

test('Workbench remains keyboard operable on a narrow screen', async () => {
  await page.viewport(390, 844);
  await mount(NotationWorkbench, {
    pitch: c4,
    lang: 'en',
    play: vi.fn(),
    stop: vi.fn(),
  });
  await select('Key signature in treble clef', '-1');
  await select('Accidental before this note', '-2');
  await select('Octave displacement', '2');
  expect(container.querySelector('output').textContent).toContain('C𝄫6');
  expect(container.scrollWidth).toBeLessThanOrEqual(
    document.documentElement.clientWidth,
  );
});

const Offline =
  globalThis.OfflineAudioContext ?? globalThis.webkitOfflineAudioContext;
(Offline ? test : test.skip)(
  'Dynamic comparison produces a fourfold amplitude change with identical pitch and duration',
  async () => {
    async function render(id) {
      class Context extends Offline {
        constructor() {
          super(1, 48000 * 3, 48000);
        }
        resume() {
          return Promise.resolve();
        }
      }
      const original = globalThis.AudioContext;
      globalThis.AudioContext = Context;
      let engine;
      try {
        engine = new AudioEngine();
      } finally {
        globalThis.AudioContext = original;
      }
      const plan = planNotationExample(id, 60);
      await engine.preview(
        [261.625565],
        'sine',
        0.2 * plan.gain,
        plan.duration,
        plan.spacing,
      );
      const buffer = await engine.context.startRendering();
      const data = buffer.getChannelData(0).slice(4800, 24000);
      return Math.sqrt(data.reduce((sum, x) => sum + x * x, 0) / data.length);
    }
    const soft = await render('soft'),
      strong = await render('strong');
    expect(soft).toBeGreaterThan(0);
    // Firefox quantizes the native oscillator/gain output; compare perceptually
    // meaningful amplitude within 3%, rather than asserting identical DSP bits.
    expect(strong / soft).toBeGreaterThan(3.88);
    expect(strong / soft).toBeLessThan(4.12);
    expect(strong).toBeLessThan(0.1);
  },
);

test('Engraved paper and ink retain their contrast in dark mode', async () => {
  document.documentElement.dataset.theme = 'dark';
  await mount(NotationFigure, { id: 'rest-128', label: 'Five-hook rest' });
  const figure = container.querySelector('figure');
  expect(getComputedStyle(figure).backgroundColor).toBe('rgb(23, 32, 29)');
  expect(getComputedStyle(figure).color).toBe('rgb(231, 255, 241)');
  expect(getComputedStyle(figure).borderWidth).toBe('0px');
  expect(container.querySelector('svg').getAttribute('fill')).toBe(
    'currentColor',
  );
  delete document.documentElement.dataset.theme;
});
