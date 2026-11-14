/** @vitest-environment jsdom */
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { CourseMap } from '../components/course-map.tsx';
import { ThemeSwitch } from '../components/theme-switch.tsx';
import { ExperimentBrief } from '../components/experiment-brief.tsx';
import { LessonListen, START_ALLOWANCE } from '../components/lesson-listen.tsx';
import { CourseIndex, CourseResume } from '../components/course-navigation.tsx';
import { Theory } from '../components/learning.tsx';
import { chapters, readingOrder, lessonBridges } from '../lib/course.ts';
import {
  TOPIC_IDS,
  drilledTopics,
  paragraphAnchors,
  topicById,
} from '../lib/topics.ts';
import { exerciseExplanations, lessons } from '../lib/learning.ts';
import { grade } from '../lib/exercises.ts';
import { itemForRule } from '../lib/practice-coach.ts';
import {
  lessonListening,
  namesOwnTuning,
  planListenStep,
} from '../lib/lesson-listening.ts';
import { emptyProfile, profileStore } from '../lib/local-profile.ts';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
async function mount(component, props) {
  container ??= document.body.appendChild(document.createElement('div'));
  root ??= createRoot(container);
  await act(() => root.render(createElement(component, props)));
}
const mark = (completed) =>
  act(() =>
    profileStore.update((profile) => ({
      ...profile,
      completed: [...completed],
    })),
  );
const click = (element) => act(async () => element.click());
beforeEach(() => {
  profileStore.replace(emptyProfile());
});
afterEach(async () => {
  if (root) await act(() => root.unmount());
  container?.remove();
  root = container = null;
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test('The course map lists every lesson once, in reading order, and links each to its text', async () => {
  for (const lang of ['en', 'ru', 'de']) {
    await mount(CourseMap, { lang, topic: null, recent: null });
    const links = [...container.querySelectorAll('.course-map li a')];
    expect(links.map((link) => link.hash)).toEqual(
      readingOrder.map((id) => `#/${lang}/t/${id}/read`),
    );
    for (const [index, link] of links.entries())
      expect(link.textContent).toBe(topicById[readingOrder[index]].title[lang]);
    expect(
      [
        ...container.querySelectorAll(
          '.course-map summary > span:first-of-type',
        ),
      ].map((node) => node.textContent),
    ).toEqual(chapters.map((chapter) => chapter.title[lang]));
    expect(container.querySelector('.course-map-head a').hash).toBe(
      `#/${lang}/read`,
    );
  }
});

test('The map marks the open lesson in any view and opens its chapter, and only its chapter', async () => {
  await mount(CourseMap, { lang: 'en', topic: 'tempo', recent: 'sound' });
  const current = container.querySelectorAll('[aria-current="page"]');
  expect(current).toHaveLength(1);
  expect(current[0].hash).toBe('#/en/t/tempo/read');
  const open = [...container.querySelectorAll('.course-map details')].filter(
    (node) => node.open,
  );
  expect(open).toHaveLength(1);
  expect(open[0].querySelector('summary').textContent).toContain(
    'Rhythm and musical time',
  );
  // Moving to another chapter closes the old one and opens the new one.
  await mount(CourseMap, { lang: 'en', topic: 'timbre', recent: 'sound' });
  expect(
    [...container.querySelectorAll('.course-map details')]
      .filter((node) => node.open)
      .map((node) => node.querySelector('summary > span').textContent),
  ).toEqual(['Sound colour and performance marks']);
});

test('With no lesson open the map opens where the reader left off, or at the first unmarked lesson', async () => {
  const opened = () =>
    [...container.querySelectorAll('.course-map details')]
      .filter((node) => node.open)
      .map((node) => node.querySelector('summary > span').textContent);
  await mount(CourseMap, { lang: 'en', topic: null, recent: null });
  expect(opened()).toEqual(['First sounds and note names']);
  expect(container.querySelector('[aria-current="page"]')).toBeNull();
  await mount(CourseMap, { lang: 'en', topic: null, recent: 'dots-ties' });
  expect(opened()).toEqual(['Rhythm and musical time']);
  await mark(['sound', 'note-names', 'dots-ties']);
  expect(opened()).toEqual(['Reading pitch']);
  // An address that names no lesson of the book marks nothing.
  await mount(CourseMap, { lang: 'en', topic: 'no-such', recent: null });
  expect(container.querySelector('[aria-current="page"]')).toBeNull();
  await mark(readingOrder);
  await mount(CourseMap, { lang: 'en', topic: null, recent: null });
  expect(opened()).toEqual([]);
});

test('The map counts the reader’s own markers and says each one in words as well as with a check', async () => {
  await mount(CourseMap, { lang: 'ru', topic: null, recent: null });
  expect(container.querySelector('.course-map-count').textContent).toBe(
    `Проработано: 0 из ${readingOrder.length}`,
  );
  expect(container.querySelector('.course-map-mark[data-done]')).toBeNull();
  await mark(['sound', 'clefs']);
  expect(container.querySelector('.course-map-count').textContent).toBe(
    `Проработано: 2 из ${readingOrder.length}`,
  );
  expect(
    [...container.querySelectorAll('.course-map summary .num')].map(
      (node) => node.textContent,
    ),
  ).toEqual(['1/2', '1/5', '0/4', '0/4', '0/4']);
  const done = [...container.querySelectorAll('.course-map li a')].filter(
    (link) => link.querySelector('.course-map-mark[data-done]'),
  );
  expect(done.map((link) => link.hash)).toEqual([
    '#/ru/t/sound/read',
    '#/ru/t/clefs/read',
  ]);
  for (const link of done) expect(link.textContent).toContain('(проработан)');
  expect(
    container.querySelector('.course-map-meter > span').style.inlineSize,
  ).toBe(`${(2 / readingOrder.length) * 100}%`);
});

test('Choosing a lesson or the course heading in the map tells the panel to close', async () => {
  const onNavigate = vi.fn();
  await mount(CourseMap, { lang: 'de', topic: null, recent: null, onNavigate });
  // jsdom does not navigate; the address change is the hashchange listener's job.
  await click(container.querySelector('.course-map li a'));
  expect(onNavigate).toHaveBeenCalledTimes(1);
  await click(container.querySelector('.course-map-head a'));
  expect(onNavigate).toHaveBeenCalledTimes(2);
});

test('The index offers the first lesson, the lesson in progress, the next unmarked lesson, then nothing', async () => {
  await mount(CourseResume, { lang: 'en', recent: null });
  const card = () => container.querySelector('.course-resume');
  expect(card().querySelector('.eyebrow').textContent).toBe('START HERE');
  expect(card().querySelector('h2').textContent).toBe(topicById.sound.title.en);
  expect(card().querySelector('a.primary-button').hash).toBe(
    '#/en/t/sound/read',
  );
  expect(card().querySelector('a.primary-button').textContent).toBe(
    'Start the first lesson',
  );
  expect(card().textContent).toContain(lessonBridges.sound.en);
  expect(card().textContent).toContain('Lesson 1 / 2');
  expect(card().querySelector('.course-resume-progress').textContent).toContain(
    `Worked through: 0 of ${readingOrder.length}`,
  );

  await mount(CourseResume, { lang: 'de', recent: 'tempo' });
  expect(card().querySelector('.eyebrow').textContent).toBe('WEITERMACHEN');
  expect(card().querySelector('a.primary-button').hash).toBe(
    '#/de/t/tempo/read',
  );
  expect(card().textContent).toContain('Lektion 4 / 4');

  await mark(['sound', 'tempo']);
  await mount(CourseResume, { lang: 'ru', recent: 'tempo' });
  expect(card().querySelector('.eyebrow').textContent).toBe('СЛЕДУЮЩИЙ УРОК');
  expect(card().querySelector('a.primary-button').hash).toBe(
    '#/ru/t/note-names/read',
  );
  expect(card().querySelector('.course-resume-progress').textContent).toContain(
    `Проработано: 2 из ${readingOrder.length}`,
  );
  // The count is described as the reader's own markers in every state.
  expect(card().textContent).toContain('не оценка навыка');

  await mark(readingOrder);
  expect(card().querySelector('a')).toBeNull();
  expect(card().querySelector('h2')).toBeNull();
  expect(card().textContent).toContain('Вы отметили все уроки');
  expect(card().querySelector('.course-resume-progress').textContent).toContain(
    `${readingOrder.length} из ${readingOrder.length}`,
  );
});

test('Chapter cards number the chapters of the book, count markers and keep them out of the lesson links', async () => {
  await mark(['staff', 'clefs']);
  await mount(CourseIndex, {
    route: { lang: 'en', lens: 'read', topic: null, anchor: null },
  });
  expect(
    [...container.querySelectorAll('.course-chapter-number')].map(
      (node) => node.textContent,
    ),
  ).toEqual(['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5']);
  expect(
    [...container.querySelectorAll('.course-chapter-progress .num')].map(
      (node) => node.textContent,
    ),
  ).toEqual(['0 / 2', '2 / 5', '0 / 4', '0 / 4', '0 / 4']);
  const rows = [...container.querySelectorAll('.chapter-lessons > li')];
  expect(
    rows
      .filter((row) => row.querySelector('.lesson-done'))
      .map((row) => row.querySelector('a').hash),
  ).toEqual(['#/en/t/staff/read', '#/en/t/clefs/read']);
  for (const row of rows) {
    // The title stays the whole accessible name of its link.
    expect(row.querySelectorAll(':scope > a')).toHaveLength(1);
    expect(row.querySelector(':scope > a .lesson-done')).toBeNull();
  }
  expect(container.querySelector('.lesson-done').textContent).toBe(
    'worked through',
  );
  // A filtered chapter keeps its number in the book, not its position on the page.
  await mount(CourseIndex, {
    route: {
      lang: 'de',
      lens: 'drill',
      topic: null,
      anchor: null,
      collection: { kind: 'chapter', id: 'rhythm' },
    },
  });
  expect(container.querySelector('.course-chapter-number').textContent).toBe(
    'Kapitel 3',
  );
  // An unscored lesson keeps its marker beside the title, before the note.
  await mark(['sound']);
  await mount(CourseIndex, {
    route: { lang: 'en', lens: 'drill', topic: null, anchor: null },
  });
  const sound = container.querySelector('.chapter-lessons > li');
  expect(sound.querySelector('.course-unavailable')).not.toBeNull();
  expect(sound.querySelector('.lesson-done')).not.toBeNull();
});

test('The theme switch names all three choices, shows the current one and reports a new one', async () => {
  const setTheme = vi.fn();
  for (const [lang, names] of [
    ['en', ['Light theme', 'Dark theme', 'Follow the device setting']],
    ['ru', ['Светлая тема', 'Тёмная тема', 'Как на устройстве']],
    [
      'de',
      [
        'Helles Farbschema',
        'Dunkles Farbschema',
        'Geräteeinstellung übernehmen',
      ],
    ],
  ]) {
    await mount(ThemeSwitch, { lang, theme: 'system', setTheme });
    const buttons = [...container.querySelectorAll('button')];
    expect(buttons.map((button) => button.getAttribute('aria-label'))).toEqual(
      names,
    );
    expect(
      buttons.map((button) => button.getAttribute('aria-pressed')),
    ).toEqual(['false', 'false', 'true']);
    expect(container.querySelector('fieldset').getAttribute('aria-label')).toBe(
      { en: 'Colour theme', ru: 'Цветовая тема', de: 'Farbschema' }[lang],
    );
  }
  await mount(ThemeSwitch, { lang: 'en', theme: 'dark', setTheme });
  const [light, dark, system] = container.querySelectorAll('button');
  expect(dark.getAttribute('aria-pressed')).toBe('true');
  expect(dark.className).toBe('selected');
  await click(light);
  await click(system);
  expect(setTheme.mock.calls).toEqual([['light'], ['system']]);
});

test('The laboratory repeats the lesson’s task and offers the way back, and a drill only where one exists', async () => {
  for (const lang of ['en', 'ru', 'de'])
    for (const lesson of lessons) {
      await mount(ExperimentBrief, { topic: lesson.id, lang });
      const brief = container.querySelector('.experiment-brief');
      expect(brief.querySelector('p').textContent).toBe(
        lesson.experiment[lang],
      );
      const links = [...brief.querySelectorAll('a')].map((link) => link.hash);
      expect(links).toEqual(
        drilledTopics.includes(lesson.id)
          ? [`#/${lang}/t/${lesson.id}/read`, `#/${lang}/t/${lesson.id}/drill`]
          : [`#/${lang}/t/${lesson.id}/read`],
      );
      // The region is named by its own heading.
      expect(brief.getAttribute('aria-labelledby')).toBe(
        brief.querySelector('h2').id,
      );
    }
  // The free laboratory, and an address that names no lesson, have no task.
  await mount(ExperimentBrief, { topic: null, lang: 'en' });
  expect(container.querySelector('.experiment-brief')).toBeNull();
  await mount(ExperimentBrief, { topic: 'no-such-lesson', lang: 'en' });
  expect(container.querySelector('.experiment-brief')).toBeNull();
});

test('A lesson example starts on request, is named while it sounds and ends by itself', async () => {
  vi.useFakeTimers();
  const play = vi.fn(() => Promise.resolve());
  const stop = vi.fn();
  await mount(LessonListen, { topic: 'sound', lang: 'en', play, stop });
  const buttons = () => [...container.querySelectorAll('.listen-button')];
  const status = () => container.querySelector('.listen-status').textContent;
  expect(buttons().map((button) => button.textContent)).toEqual(
    lessonListening.sound.map((step) => step.label.en),
  );
  // Nothing sounds, and nothing is scheduled, before the reader asks.
  expect(play).not.toHaveBeenCalled();
  expect(status()).toBe('');
  expect(
    buttons().every((b) => b.getAttribute('aria-pressed') === 'false'),
  ).toBe(true);

  await click(buttons()[0]);
  const plan = planListenStep(lessonListening.sound[0]);
  expect(play).toHaveBeenCalledTimes(1);
  expect(play).toHaveBeenLastCalledWith(plan);
  expect(buttons()[0].getAttribute('aria-pressed')).toBe('true');
  expect(status()).toBe('Sounding: 220 Hz');
  // Still sounding just before its end, silent just after it.
  await act(() => vi.advanceTimersByTime(plan.total * 1000 - 10));
  expect(buttons()[0].getAttribute('aria-pressed')).toBe('true');
  await act(() => vi.advanceTimersByTime(20));
  expect(buttons()[0].getAttribute('aria-pressed')).toBe('false');
  expect(status()).toBe('');
  expect(stop).not.toHaveBeenCalled();
});

test('Choosing the sounding example stops it; choosing another replaces it and its clock', async () => {
  vi.useFakeTimers();
  const play = vi.fn(() => Promise.resolve());
  const stop = vi.fn();
  await mount(LessonListen, { topic: 'sound', lang: 'ru', play, stop });
  const buttons = () => [...container.querySelectorAll('.listen-button')];
  const pressed = () => buttons().map((b) => b.getAttribute('aria-pressed'));
  await click(buttons()[2]);
  expect(pressed()).toEqual(['false', 'false', 'true']);
  // A second example before the first ends: one caption, the new one.
  await act(() => vi.advanceTimersByTime(300));
  await click(buttons()[1]);
  expect(pressed()).toEqual(['false', 'true', 'false']);
  expect(container.querySelector('.listen-status').textContent).toBe(
    'Звучит: 440 Гц',
  );
  // The first example, had it kept its clock, would end while the second is
  // still sounding. Its remaining time must not end the second one early.
  const first = planListenStep(lessonListening.sound[2]).total;
  const second = planListenStep(lessonListening.sound[1]).total;
  expect(first).toBeLessThan(second);
  await act(() => vi.advanceTimersByTime(second * 1000 - 10));
  expect(pressed()).toEqual(['false', 'true', 'false']);
  await act(() => vi.advanceTimersByTime(20));
  expect(pressed()).toEqual(['false', 'false', 'false']);

  await click(buttons()[0]);
  expect(stop).not.toHaveBeenCalled();
  await click(buttons()[0]);
  expect(stop).toHaveBeenCalledTimes(1);
  expect(pressed()).toEqual(['false', 'false', 'false']);
  expect(play).toHaveBeenCalledTimes(3);
});

test('An example that cannot start is not shown as sounding, and Escape clears the caption', async () => {
  vi.useFakeTimers();
  const play = vi.fn(() => Promise.reject(new Error('Audio unavailable')));
  const stop = vi.fn();
  await mount(LessonListen, { topic: 'timbre', lang: 'de', play, stop });
  const buttons = () => [...container.querySelectorAll('.listen-button')];
  await click(buttons()[1]);
  expect(buttons()[1].getAttribute('aria-pressed')).toBe('false');
  // No sound is claimed; the reason is said here, beside the button pressed.
  expect(container.querySelector('.listen-status').textContent).toContain(
    'Der Klang konnte nicht starten.',
  );
  expect(container.querySelector('.listen-status').textContent).not.toContain(
    'Es erklingt',
  );

  play.mockImplementation(() => Promise.resolve());
  await click(buttons()[3]);
  expect(container.querySelector('.listen-status').textContent).toBe(
    'Es erklingt: Sägezahn',
  );
  // Other keys are the page's business; only Escape is "stop everything".
  await act(() =>
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })),
  );
  expect(buttons()[3].getAttribute('aria-pressed')).toBe('true');
  await act(() =>
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })),
  );
  expect(buttons()[3].getAttribute('aria-pressed')).toBe('false');
  // Leaving the lesson removes the listener and any pending clock.
  await click(buttons()[0]);
  await act(() => root.unmount());
  root = null;
  expect(vi.getTimerCount()).toBe(0);
});

test('A slow start keeps the newer choice: a late first example cannot restart the clock', async () => {
  vi.useFakeTimers();
  const starts = [];
  const play = vi.fn(() => new Promise((resolve) => starts.push(resolve)));
  await mount(LessonListen, {
    topic: 'intervals',
    lang: 'en',
    play,
    stop: vi.fn(),
  });
  const buttons = () => [...container.querySelectorAll('.listen-button')];
  const pressed = () => buttons().map((b) => b.getAttribute('aria-pressed'));
  await click(buttons()[0]);
  await click(buttons()[2]);
  expect(pressed()).toEqual(['false', 'false', 'true']);
  // The first request resolves after the second was chosen.
  await act(async () => starts[0]());
  expect(pressed()).toEqual(['false', 'false', 'true']);
  await act(async () => starts[1]());
  const total = planListenStep(lessonListening.intervals[2]).total;
  await act(() => vi.advanceTimersByTime(total * 1000 + 10));
  expect(pressed()).toEqual(['false', 'false', 'false']);
});

test('A lesson shows its listening examples before the way into the laboratory, and none without audio', async () => {
  const openLab = vi.fn();
  const listen = vi.fn(() => Promise.resolve());
  const stopSound = vi.fn();
  for (const lesson of lessons) {
    await mount(Theory, {
      lang: 'en',
      lessonId: lesson.id,
      anchor: null,
      openLab,
      listen,
      stopSound,
    });
    const card = container.querySelector('.lesson-experiment');
    const buttons = [...card.querySelectorAll('button')];
    expect(buttons.slice(0, -1).map((button) => button.textContent)).toEqual(
      lessonListening[lesson.id].map((step) => step.label.en),
    );
    expect(buttons.at(-1).textContent).toBe('Open this experiment');
    // The card comes after the explanation and before the question about it.
    const exercise = container.querySelector('.inline-exercise');
    if (exercise)
      expect(
        card.compareDocumentPosition(exercise) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    expect(
      container.querySelector('.formula').compareDocumentPosition(card) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    // The reader's marker is the last act before moving on.
    expect(
      container
        .querySelector('.lesson-progress')
        .compareDocumentPosition(
          container.querySelector('.lesson-navigation'),
        ) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  }
  await click(container.querySelector('.listen-button'));
  expect(listen).toHaveBeenCalledWith(
    planListenStep(lessonListening[lessons.at(-1).id][0]),
  );
  expect(openLab).not.toHaveBeenCalled();
  expect(
    container.querySelector('.listen-button').getAttribute('aria-pressed'),
  ).toBe('true');
  // Another lesson starts silent: its first button does not inherit the state
  // of the example that was sounding in the lesson before it.
  await mount(Theory, {
    lang: 'en',
    lessonId: lessons[0].id,
    anchor: null,
    openLab,
    listen,
    stopSound,
  });
  expect(
    container.querySelector('.listen-button[aria-pressed="true"]'),
  ).toBeNull();
  expect(container.querySelector('.listen-status').textContent).toBe('');

  await mount(Theory, {
    lang: 'en',
    lessonId: 'sound',
    anchor: null,
    openLab,
  });
  expect(container.querySelector('.lesson-listen')).toBeNull();
  await click(container.querySelector('.lesson-experiment button'));
  expect(openLab).toHaveBeenCalledWith(220, 'sine', 'sound');
});

test('The reading index opens with the next step and then the whole book', async () => {
  await mount(Theory, {
    lang: 'ru',
    lessonId: null,
    anchor: null,
    openLab: vi.fn(),
    recent: 'clefs',
  });
  const resume = container.querySelector('.course-resume');
  expect(resume.querySelector('a.primary-button').hash).toBe(
    '#/ru/t/clefs/read',
  );
  expect(
    resume.compareDocumentPosition(container.querySelector('.course-index')) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
  expect(container.querySelectorAll('.chapter-lessons > li')).toHaveLength(
    readingOrder.length,
  );
  // Without a remembered lesson the index still offers one.
  await mount(Theory, {
    lang: 'ru',
    lessonId: null,
    anchor: null,
    openLab: vi.fn(),
  });
  expect(container.querySelector('.course-resume a.primary-button').hash).toBe(
    '#/ru/t/sound/read',
  );
});

test('An earlier example that fails late does not touch the one chosen after it, and a failure is said beside the buttons', async () => {
  vi.useFakeTimers();
  const pending = [];
  const play = vi.fn(
    () => new Promise((resolve, reject) => pending.push({ resolve, reject })),
  );
  await mount(LessonListen, {
    topic: 'intervals',
    lang: 'en',
    play,
    stop: vi.fn(),
  });
  const buttons = () => [...container.querySelectorAll('.listen-button')];
  const pressed = () => buttons().map((b) => b.getAttribute('aria-pressed'));
  const status = () => container.querySelector('.listen-status');
  await click(buttons()[0]);
  await click(buttons()[2]);
  // The first request fails after the second was chosen: the second keeps
  // its caption and no failure is reported for a sound nobody is waiting for.
  await act(async () => pending[0].reject(new Error('late')));
  expect(pressed()).toEqual(['false', 'false', 'true']);
  expect(status().textContent).toBe(
    `Sounding: ${lessonListening.intervals[2].label.en}`,
  );
  expect(status().className).toBe('listen-status');
  // The newer example still runs on its own clock and ends by itself.
  await act(async () => pending[1].resolve());
  const total = planListenStep(lessonListening.intervals[2]).total;
  await act(() => vi.advanceTimersByTime(total * 1000 + 10));
  expect(pressed()).toEqual(['false', 'false', 'false']);

  // The latest request failing is the reader's own: it is said in the card,
  // where the button is, and it goes away with the next press.
  await click(buttons()[1]);
  await act(async () => pending[2].reject(new Error('no audio')));
  expect(pressed()).toEqual(['false', 'false', 'false']);
  expect(status().textContent).toContain('The sound could not start.');
  expect(status().className).toBe('listen-status failed');
  // A failure is announced: there is no tone to tell the reader otherwise.
  const announced = () => status().querySelector('output').textContent;
  expect(announced()).toContain('The sound could not start.');
  await click(buttons()[1]);
  expect(status().textContent).toBe(
    `Sounding: ${lessonListening.intervals[1].label.en}`,
  );
  expect(status().className).toBe('listen-status');
  // What is sounding is not: the pressed button says it, and speech over a
  // two-second tone would cover the tone it describes.
  expect(announced()).toBe('');
  expect(status().closest('[aria-live], output, [role="alert"]')).toBeNull();
});

test('Escape while a sound is still starting leaves no button claiming it, however late the start resolves', async () => {
  vi.useFakeTimers();
  const pending = [];
  const play = vi.fn(() => new Promise((resolve) => pending.push(resolve)));
  await mount(LessonListen, {
    topic: 'sound',
    lang: 'en',
    play,
    stop: vi.fn(),
  });
  const button = () => container.querySelector('.listen-button');
  await click(button());
  expect(button().getAttribute('aria-pressed')).toBe('true');
  // The page silences the engine on Escape; the start then resolves anyway.
  await act(() =>
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })),
  );
  await act(async () => pending[0]());
  expect(button().getAttribute('aria-pressed')).toBe('false');
  expect(container.querySelector('.listen-status').textContent).toBe('');
  expect(vi.getTimerCount()).toBe(0);
});

test('A start that never completes does not leave the button pressed for ever', async () => {
  vi.useFakeTimers();
  const play = vi.fn(() => new Promise(() => {}));
  await mount(LessonListen, {
    topic: 'sound',
    lang: 'en',
    play,
    stop: vi.fn(),
  });
  const button = () => container.querySelector('.listen-button');
  await click(button());
  const total = planListenStep(lessonListening.sound[0]).total;
  // Still shown while the audio may yet begin…
  await act(() =>
    vi.advanceTimersByTime((total + START_ALLOWANCE) * 1000 - 10),
  );
  expect(button().getAttribute('aria-pressed')).toBe('true');
  // …and released once the example could not possibly still be sounding.
  await act(() => vi.advanceTimersByTime(20));
  expect(button().getAttribute('aria-pressed')).toBe('false');
});

test('A hidden tab or a page that is left clears the caption, as the page itself stops the sound', async () => {
  vi.useFakeTimers();
  const play = vi.fn(() => Promise.resolve());
  await mount(LessonListen, {
    topic: 'durations',
    lang: 'en',
    play,
    stop: vi.fn(),
  });
  const button = () => container.querySelector('.listen-button');
  const hidden = vi.spyOn(document, 'hidden', 'get');
  await click(button());
  expect(button().getAttribute('aria-pressed')).toBe('true');
  // Becoming visible again is not a reason to stop.
  hidden.mockReturnValue(false);
  await act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(button().getAttribute('aria-pressed')).toBe('true');
  hidden.mockReturnValue(true);
  await act(() => document.dispatchEvent(new Event('visibilitychange')));
  expect(button().getAttribute('aria-pressed')).toBe('false');
  await click(button());
  expect(button().getAttribute('aria-pressed')).toBe('true');
  await act(() => window.dispatchEvent(new Event('pagehide')));
  expect(button().getAttribute('aria-pressed')).toBe('false');
  expect(vi.getTimerCount()).toBe(0);
});

test('The note under the buttons says what the examples are tuned to, and does not contradict a button that names a tuning', async () => {
  expect(TOPIC_IDS.filter(namesOwnTuning)).toEqual(['tuning']);
  for (const [lang, equal, named, stop] of [
    ['en', 'in equal temperament', 'in the tuning its button names', 'Escape'],
    [
      'ru',
      'в равномерной темперации',
      'в том строе, который назван на его кнопке',
      'Escape',
    ],
    [
      'de',
      'gleichstufig gestimmt',
      'in der Stimmung, die sein Knopf nennt',
      'Escape',
    ],
  ]) {
    const note = () => container.querySelector('.listen-note').textContent;
    await mount(LessonListen, {
      topic: 'sound',
      lang,
      play: vi.fn(),
      stop: vi.fn(),
    });
    expect(note()).toContain(equal);
    expect(note()).not.toContain(named);
    expect(note()).toContain(stop);
    expect(note()).toContain('440');
    // The tuning lesson's own buttons play just and Pythagorean thirds.
    await mount(LessonListen, {
      topic: 'tuning',
      lang,
      play: vi.fn(),
      stop: vi.fn(),
    });
    expect(note()).toContain(named);
    expect(note()).not.toContain(equal);
    expect(note()).toContain(stop);
    expect(note()).not.toContain('[[');
  }
});

test('A question inside a lesson shows what was right after a miss, in words and marks as well as colour', async () => {
  const props = (lang) => ({
    lang,
    lessonId: 'note-names',
    anchor: null,
    openLab: vi.fn(),
  });
  const rule = paragraphAnchors['note-names'][0];
  for (const [lang, right, wrong, correctMark, chosenMark] of [
    ['en', 'That’s right.', 'Not quite.', 'correct answer', 'your answer'],
    ['ru', 'Верно.', 'Не совсем.', 'правильный ответ', 'ваш ответ'],
    ['de', 'Richtig.', 'Nicht ganz.', 'richtige Antwort', 'deine Antwort'],
  ]) {
    const item = itemForRule(rule, 1, lang);
    const labelOf = (id) =>
      item.options.find((option) => option.id === id).label;
    const miss = item.options.find((option) => option.id !== item.answer);
    const options = () => [
      ...container.querySelectorAll('.inline-exercise .answer-grid button'),
    ];
    const pick = (label) =>
      click(options().find((button) => button.textContent === label));

    await mount(Theory, props(lang));
    // Nothing is marked before an answer.
    expect(
      container.querySelector('.answer-correct, .answer-wrong'),
    ).toBeNull();
    await pick(miss.label);
    const wrongButton = container.querySelector('.answer-wrong');
    const rightButton = container.querySelector('.answer-correct');
    expect(wrongButton.textContent).toBe(`${miss.label}${chosenMark}`);
    // The answer is shown although it was not the one chosen.
    expect(rightButton.textContent).toBe(
      `${labelOf(item.answer)}${correctMark}`,
    );
    expect(container.querySelectorAll('.answer-wrong')).toHaveLength(1);
    expect(container.querySelectorAll('.answer-correct')).toHaveLength(1);
    // A drawn mark for sighted readers, words for everyone else.
    for (const button of [wrongButton, rightButton]) {
      expect(button.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
      expect(button.querySelector('.sr-only')).not.toBeNull();
    }
    const feedback = container.querySelector('.answer-feedback');
    expect(feedback.className).toContain('incorrect');
    expect(feedback.querySelector('strong').textContent).toBe(wrong);
    // After a miss the kind of mistake is explained.
    expect(feedback.textContent.length).toBeGreaterThan(wrong.length + 10);
    expect(options().every((button) => button.disabled)).toBe(true);

    // A fresh question, answered correctly: no mistake is marked or explained.
    await act(() => root.unmount());
    container.remove();
    root = container = null;
    await mount(Theory, props(lang));
    await pick(labelOf(item.answer));
    expect(container.querySelector('.answer-wrong')).toBeNull();
    expect(container.querySelector('.answer-correct').textContent).toBe(
      `${labelOf(item.answer)}${correctMark}`,
    );
    const praise = container.querySelector('.answer-feedback');
    expect(praise.className).not.toContain('incorrect');
    expect(praise.querySelector('strong').textContent).toBe(right);
    expect(praise.textContent).not.toContain(
      exerciseExplanations[grade(item, miss.id).tag][lang],
    );
    await act(() => root.unmount());
    container.remove();
    root = container = null;
  }
});

test('The course map brings the open lesson into view inside the panel when it changes', async () => {
  const scrolled = [];
  // jsdom has no scrollIntoView of its own; whatever was there is put back.
  const original = Object.getOwnPropertyDescriptor(
    Element.prototype,
    'scrollIntoView',
  );
  Element.prototype.scrollIntoView = function (options) {
    scrolled.push([this.getAttribute('href'), options]);
  };
  try {
    await mount(CourseMap, { lang: 'en', topic: 'repeats', recent: null });
    // Only as far as needed: the panel scrolls, the entry is not re-centred.
    expect(scrolled).toEqual([['#/en/t/repeats/read', { block: 'nearest' }]]);
    await mount(CourseMap, { lang: 'en', topic: 'sound', recent: null });
    expect(scrolled.at(-1)[0]).toBe('#/en/t/sound/read');
    expect(scrolled).toHaveLength(2);
    // The same lesson in another language or with new markers does not jump.
    await mark(['sound']);
    expect(scrolled).toHaveLength(2);
    // With no lesson open there is nothing to bring into view.
    await mount(CourseMap, { lang: 'en', topic: null, recent: 'tempo' });
    expect(scrolled).toHaveLength(2);
  } finally {
    if (original)
      Object.defineProperty(Element.prototype, 'scrollIntoView', original);
    else delete Element.prototype.scrollIntoView;
  }
});
