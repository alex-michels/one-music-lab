import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '../../app/(root)/page.tsx';
import { AudioEngine } from '../../lib/audio.ts';
import { frequencyScalePosition } from '../../components/play-lens.tsx';
import { lessons } from '../../lib/learning.ts';
import { readingOrder } from '../../lib/course.ts';
import { lessonListening, planListenStep } from '../../lib/lesson-listening.ts';
import { emptyProfile, profileStore } from '../../lib/local-profile.ts';
import { StaffPosition } from '../../components/staff-answer.tsx';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
async function mount() {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  await act(() => root.render(createElement(Home)));
}
async function visit(hash) {
  await act(async () => {
    window.history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}
const click = (element) =>
  act(async () => page.elementLocator(element).click());
// Some engines in CI have no Web Audio. Tests that spy on the engine's methods
// still construct it and dispose of it on unmount, so the stand-in offers
// what the constructor and the disposal touch.
function audioContextIfMissing() {
  if (globalThis.AudioContext) return;
  const node = () => ({ gain: { value: 0 }, connect() {} });
  vi.stubGlobal(
    'AudioContext',
    class {
      destination = {};
      createGain = node;
      createAnalyser = node;
      close() {
        return Promise.resolve();
      }
    },
  );
}
const box = (selector) =>
  container.querySelector(selector).getBoundingClientRect();
beforeEach(async () => {
  await page.viewport(1280, 900);
});
afterEach(async () => {
  if (root) {
    await visit('#/en/play');
    await act(() => root.unmount());
  }
  container?.remove();
  root = container = null;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  localStorage.removeItem('oml-language');
  localStorage.removeItem('oml-theme');
  localStorage.removeItem('oml-sidebar-width');
  delete document.documentElement.dataset.theme;
  document.documentElement.classList.remove('dark');
  window.scrollTo(0, 0);
});

test('The bar stays in view and a move leaves the whole title visible below it, on a phone and on a desktop', async () => {
  for (const [width, height] of [
    [360, 740],
    [1280, 900],
  ]) {
    await page.viewport(width, height);
    if (!root) await mount();
    await visit('#/ru/t/clefs/read');
    // Far down the lesson, then on to the next one from its last card.
    const next = container.querySelector('.lesson-navigation [rel="next"]');
    next.scrollIntoView({ block: 'center' });
    expect(window.scrollY).toBeGreaterThan(200);
    await click(next);
    await expect
      .poll(() => window.location.hash)
      .toBe('#/ru/t/accidental-signs/read');
    const bar = box('.topbar');
    expect(Math.round(bar.top)).toBe(0);
    expect(bar.bottom).toBeGreaterThan(40);
    const title = box('h1');
    expect(container.querySelector('h1')).toBe(document.activeElement);
    // Not under the bar, and not pushed off the first screen either.
    expect(title.top).toBeGreaterThanOrEqual(bar.bottom);
    expect(title.bottom).toBeLessThan(height);
    // The controls a reader needs mid-lesson are on screen without scrolling.
    for (const selector of ['.theme-switch', '.language-switch']) {
      const control = box(selector);
      expect(control.top).toBeGreaterThanOrEqual(0);
      expect(control.bottom).toBeLessThanOrEqual(bar.bottom);
      expect(control.right).toBeLessThanOrEqual(width);
    }
    if (width < 768) {
      const menu = box('.mobile-menu');
      expect(menu.width).toBeGreaterThan(0);
      expect(menu.bottom).toBeLessThanOrEqual(bar.bottom);
    }
    // The title takes focus for the announcement but is not drawn as a control.
    expect(getComputedStyle(container.querySelector('h1')).outlineStyle).toBe(
      'none',
    );
  }
});

test('The theme buttons change the page at once, are saved, and follow the device again on request', async () => {
  await mount();
  const html = document.documentElement;
  const button = (name) => page.getByRole('button', { name, exact: true });
  expect(html.dataset.theme).toBe('light');
  await act(async () => button('Dark theme').click());
  expect(html.dataset.theme).toBe('dark');
  // Both channels: the tokens read the attribute, components/ui read the class.
  expect(html.classList.contains('dark')).toBe(true);
  expect(profileStore.getSnapshot().profile.settings.theme).toBe('dark');
  const ground = getComputedStyle(document.body).backgroundColor;
  await act(async () => button('Light theme').click());
  expect(html.dataset.theme).toBe('light');
  expect(html.classList.contains('dark')).toBe(false);
  expect(getComputedStyle(document.body).backgroundColor).not.toBe(ground);
  await act(async () => button('Follow the device setting').click());
  expect(profileStore.getSnapshot().profile.settings.theme).toBe('system');
  expect(html.dataset.theme).toBe(
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
  );
  expect(
    container
      .querySelector('.theme-switch [aria-pressed="true"]')
      .getAttribute('aria-label'),
  ).toBe('Follow the device setting');
  // The names follow the language like every other control.
  await act(async () => button('DE').click());
  expect(
    container
      .querySelector('.theme-switch [aria-pressed="true"]')
      .getAttribute('aria-label'),
  ).toBe('Geräteeinstellung übernehmen');
});

test('The course map opens a lesson from any page, marks it in every view and counts the reader’s marker', async () => {
  await mount();
  await visit('#/en/define');
  const map = () => container.querySelector('.course-map');
  const current = () => map().querySelector('[aria-current="page"]');
  expect(current()).toBeNull();
  expect(map().querySelectorAll('li a')).toHaveLength(readingOrder.length);
  // A closed chapter is opened like any other disclosure, then a lesson chosen.
  const rhythm = [...map().querySelectorAll('details')].find((node) =>
    node.querySelector('summary').textContent.includes('Rhythm'),
  );
  expect(rhythm.open).toBe(false);
  await click(rhythm.querySelector('summary'));
  await click(rhythm.querySelector('a[href$="/t/tempo/read"]'));
  await expect.poll(() => window.location.hash).toBe('#/en/t/tempo/read');
  expect(container.querySelector('h1')).toBe(document.activeElement);
  expect(current().hash).toBe('#/en/t/tempo/read');
  // The same lesson stays marked in its laboratory and its drill.
  for (const lens of ['play', 'drill', 'define']) {
    await visit(`#/en/t/tempo/${lens}`);
    expect(current().hash).toBe('#/en/t/tempo/read');
    expect(rhythm.open).toBe(true);
  }
  await visit('#/en/t/tempo/read');
  expect(map().querySelector('.course-map-count').textContent).toBe(
    `Worked through: 0 of ${readingOrder.length}`,
  );
  await click(container.querySelector('.lesson-progress input'));
  expect(map().querySelector('.course-map-count').textContent).toBe(
    `Worked through: 1 of ${readingOrder.length}`,
  );
  expect(current().querySelector('.course-map-mark[data-done]')).not.toBeNull();
  expect(rhythm.querySelector('summary .num').textContent).toBe('1/4');
  // A chapter page names no lesson, and the index then offers the next one.
  await visit('#/en/c/rhythm/read');
  expect(current()).toBeNull();
  await visit('#/en/read');
  const resume = container.querySelector('.course-resume');
  expect(resume.querySelector('.eyebrow').textContent).toBe('YOUR NEXT LESSON');
  expect(resume.querySelector('a.primary-button').hash).toBe(
    '#/en/t/sound/read',
  );
  expect(
    container.querySelector('.course-chapter .lesson-done'),
  ).not.toBeNull();
});

test('The index offers the lesson last read, and an instrument visit does not count as one', async () => {
  await mount();
  await visit('#/en/t/chords/play');
  await visit('#/en/read');
  const resume = () => container.querySelector('.course-resume');
  expect(resume().querySelector('.eyebrow').textContent).toBe('START HERE');
  await visit('#/en/t/dots-ties/read');
  await visit('#/en/t/dots-ties/drill');
  await visit('#/en/read');
  expect(resume().querySelector('.eyebrow').textContent).toBe('CONTINUE');
  expect(resume().querySelector('a.primary-button').hash).toBe(
    '#/en/t/dots-ties/read',
  );
  // The card is a link like any other: it opens the lesson and is announced.
  await click(resume().querySelector('a.primary-button'));
  await expect.poll(() => window.location.hash).toBe('#/en/t/dots-ties/read');
  expect(container.querySelector('h1')).toBe(document.activeElement);
});

test('A lesson’s laboratory repeats its task above the instrument, and the free laboratory has none', async () => {
  await mount();
  for (const [topic, lang] of [
    ['sound', 'en'],
    ['staff', 'ru'],
    ['chords', 'de'],
  ]) {
    await visit(`#/${lang}/t/${topic}/play`);
    const brief = container.querySelector('.experiment-brief');
    expect(brief.querySelector('p').textContent).toBe(
      lessons.find((lesson) => lesson.id === topic).experiment[lang],
    );
    // Above the instrument it describes, below the page's path.
    const instrument = container.querySelector('.lens-play, .chords-lab');
    expect(
      brief.compareDocumentPosition(instrument) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(brief.scrollWidth).toBeLessThanOrEqual(brief.clientWidth + 1);
  }
  await click(
    container.querySelector('.experiment-brief a[href$="/t/chords/read"]'),
  );
  await expect.poll(() => window.location.hash).toBe('#/de/t/chords/read');
  expect(container.querySelector('.experiment-brief')).toBeNull();
  for (const address of [
    '#/en/play',
    '#/en/c/rhythm/play',
    '#/en/t/staff/drill',
  ]) {
    await visit(address);
    expect(container.querySelector('.experiment-brief')).toBeNull();
  }
});

test('The listening card sits beside the text on a wide page, stays in view while reading and joins the column on a narrow one', async () => {
  await page.viewport(1440, 900);
  await mount();
  await visit('#/en/t/clefs/read');
  const card = () => box('.lesson-experiment');
  // The explanation's own paragraphs, not the goal set inside its callout.
  const text = () => box('.lesson-article > .prose');
  expect(card().left).toBeGreaterThanOrEqual(text().right);
  // The title, the lesson and the path share one left edge.
  expect(Math.abs(text().left - box('h1').left)).toBeLessThanOrEqual(1);
  // Half-way down a long lesson the card is still on screen, below the bar.
  const exercise = container.querySelector('.inline-exercise');
  exercise.scrollIntoView({ block: 'center' });
  await expect.poll(() => window.scrollY).toBeGreaterThan(300);
  expect(card().top).toBeGreaterThanOrEqual(box('.topbar').bottom);
  expect(card().bottom).toBeLessThanOrEqual(window.innerHeight);
  // The column is a readable measure, not the width of the window.
  expect(text().width).toBeLessThanOrEqual(36 * 16 + 1);

  await page.viewport(820, 900);
  window.scrollTo(0, 0);
  await expect
    .poll(() => Math.abs(card().left - text().left))
    .toBeLessThanOrEqual(1);
  // In reading order: after the worked example, before the question.
  expect(card().top).toBeGreaterThan(box('.formula').bottom);
  expect(card().bottom).toBeLessThanOrEqual(
    exercise.getBoundingClientRect().top + 1,
  );
  expect(
    getComputedStyle(container.querySelector('.lesson-experiment')).position,
  ).toBe('static');
});

for (const lang of ['en', 'ru', 'de']) {
  test(`Every lesson and the index fit a 360 px screen in ${lang}`, async () => {
    await page.viewport(360, 740);
    await mount();
    for (const topic of readingOrder) {
      await visit(`#/${lang}/t/${topic}/read`);
      expect(document.documentElement.scrollWidth, topic).toBeLessThanOrEqual(
        window.innerWidth + 1,
      );
      for (const node of container.querySelectorAll(
        '.course-context, .lesson-connections, .lesson-goal, .lesson-experiment, .lesson-listen, .lesson-progress, .lesson-navigation, .lesson-navigation > a',
      ))
        expect(
          node.scrollWidth,
          `${topic} ${node.className}`,
        ).toBeLessThanOrEqual(node.clientWidth + 1);
      // Listening targets stay finger-sized however long the label is.
      for (const button of container.querySelectorAll('.listen-button'))
        expect(button.getBoundingClientRect().height).toBeGreaterThanOrEqual(
          44,
        );
    }
    await visit(`#/${lang}/read`);
    for (const node of container.querySelectorAll(
      '.course-resume, .course-chapter, .chapter-lessons > li',
    ))
      expect(node.scrollWidth).toBeLessThanOrEqual(node.clientWidth + 1);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth + 1,
    );
    await visit(`#/${lang}/t/sound/play`);
    const brief = container.querySelector('.experiment-brief');
    expect(brief.scrollWidth).toBeLessThanOrEqual(brief.clientWidth + 1);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth + 1,
    );
  });
}

test('Saved work and backups follow the content of every page instead of preceding it', async () => {
  await mount();
  for (const [address, content] of [
    ['#/en/read', '.course-index'],
    ['#/en/t/staff/read', '.lesson-article'],
    ['#/en/t/staff/play', '.lens-play'],
    ['#/en/t/staff/drill', '.lens-drill'],
    ['#/en/define', '.define-lens'],
    ['#/en/c/rhythm/read', '.course-index'],
  ]) {
    await visit(address);
    const data = container.querySelector('.local-data');
    expect(
      container.querySelector(content).compareDocumentPosition(data) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      address,
    ).toBeTruthy();
    expect(data.closest('main')).not.toBeNull();
  }
  // It is still one disclosure, opened from the keyboard like before.
  const summary = container.querySelector('.local-data summary');
  summary.focus();
  await act(async () => userEvent.keyboard('{Enter}'));
  expect(container.querySelector('.local-data details').open).toBe(true);
});

test('The skip link moves focus past the navigation and leaves the reader on the page they were on', async () => {
  await mount();
  await visit('#/en/t/staff/read');
  const skip = container.querySelector('.skip-link');
  skip.focus();
  await act(async () => userEvent.keyboard('{Enter}'));
  // `#main-content` is not an address of the site: following it used to be
  // read as an unknown page and opened the Sound lab.
  expect(window.location.hash).toBe('#/en/t/staff/read');
  expect(container.querySelector('h1').textContent).toBe(
    lessons.find((lesson) => lesson.id === 'staff').title.en,
  );
  expect(container.querySelector('.lesson-article')).not.toBeNull();
  const main = container.querySelector('main');
  expect(document.activeElement).toBe(main);
  // The target is not a control: no ring is drawn around the whole page.
  expect(getComputedStyle(main).outlineStyle).toBe('none');
  // The next Tab starts inside the content, not back in the menu.
  await act(async () => userEvent.tab());
  expect(main.contains(document.activeElement)).toBe(true);
  expect(document.activeElement).not.toBe(main);
});

test('The brand link opens the laboratory with one history entry and closes the phone menu', async () => {
  await mount();
  await visit('#/en/t/staff/read');
  const before = window.history.length;
  await click(container.querySelector('.brand'));
  expect(window.location.hash).toBe('#/en/play');
  // One move, one entry: Back returns to the lesson rather than to `#lab`.
  expect(window.history.length).toBe(before + 1);
  await act(async () => window.history.back());
  await expect.poll(() => window.location.hash).toBe('#/en/t/staff/read');
});

test('A link to a rule lands on its passage, below the bar, instead of back at the title', async () => {
  await page.viewport(1280, 700);
  await mount();
  await visit('#/en/t/dots-ties/drill');
  await visit('#/en/t/dots-ties/read~second-dot-adds-half-the-first');
  const passage = container.querySelector('.inline-exercise');
  expect(passage.id).toBe('second-dot-adds-half-the-first');
  // The heading still takes focus for the announcement…
  expect(container.querySelector('h1')).toBe(document.activeElement);
  // …but the page stays where the address pointed.
  await expect.poll(() => window.scrollY).toBeGreaterThan(200);
  const at = passage.getBoundingClientRect();
  expect(at.top).toBeGreaterThanOrEqual(box('.topbar').bottom);
  expect(at.top).toBeLessThan(window.innerHeight);
});

test('The drill never scrolls sideways while the navigation is docked beside it', async () => {
  // Between about 900 and 1200 px the two columns did not fit next to the panel.
  for (const width of [800, 920, 1024, 1150, 1280]) {
    await page.viewport(width, 800);
    if (!root) await mount();
    for (const lang of ['en', 'ru', 'de']) {
      await visit(`#/${lang}/t/staff/drill`);
      expect(
        document.documentElement.scrollWidth,
        `${width}px ${lang}`,
      ).toBeLessThanOrEqual(window.innerWidth + 1);
      const drill = container.querySelector('.lens-drill');
      expect(drill.scrollWidth).toBeLessThanOrEqual(drill.clientWidth + 1);
      const ledger = box('.drill-ledger');
      expect(ledger.right).toBeLessThanOrEqual(width + 1);
      expect(ledger.width).toBeGreaterThanOrEqual(220);
    }
  }
  // With room for both, the ledger is a column beside the question again.
  await page.viewport(1440, 800);
  await visit('#/en/t/staff/drill');
  await expect
    .poll(() => box('.drill-ledger').left)
    .toBeGreaterThanOrEqual(box('.drill-question').right);
});

test('A reference pitch typed digit by digit keeps the note it started with', async () => {
  await mount();
  await visit('#/en/play');
  const frequency = () => Number(container.querySelector('#frequency').value);
  await act(async () =>
    page.getByRole('spinbutton', { name: 'Frequency in hertz' }).fill('130.81'),
  );
  await act(async () => userEvent.tab());
  expect(frequency()).toBeCloseTo(130.81, 2);
  const reference = page.getByRole('spinbutton', {
    name: 'A4 reference frequency',
  });
  // 4 is out of range and ignored; 43 is in range and used to drag the tone
  // down to the 20 Hz floor, from which 432 could not bring it back.
  await act(async () => userEvent.clear(reference));
  await act(async () => userEvent.type(reference, '432'));
  await act(async () => userEvent.tab());
  expect(frequency()).toBeCloseTo((130.81 * 432) / 440, 2);
  // And back: the same note at the original reference.
  await act(async () => userEvent.clear(reference));
  await act(async () => userEvent.type(reference, '440'));
  await act(async () => userEvent.tab());
  expect(frequency()).toBeCloseTo(130.81, 2);
  // A frequency chosen directly is a new note, re-tuned from there on.
  await act(async () =>
    page.getByRole('spinbutton', { name: 'Frequency in hertz' }).fill('220'),
  );
  await act(async () => userEvent.tab());
  await click(
    [...container.querySelectorAll('.preset-row button')].find(
      (button) => button.textContent === '415',
    ),
  );
  expect(frequency()).toBeCloseTo((220 * 415) / 440, 2);
});

test('The marks under the frequency slider stand where the slider puts those frequencies', async () => {
  await mount();
  await visit('#/en/play');
  const field = page.getByRole('spinbutton', { name: 'Frequency in hertz' });
  const centre = (element) => {
    const rect = element.getBoundingClientRect();
    return rect.left + rect.width / 2;
  };
  const mark = (label) =>
    [...container.querySelectorAll('.range-labels span')].find(
      (span) => span.textContent === label,
    );
  const thumb = () =>
    container.querySelector(
      '.frequency-slider [data-slot="slider-thumb"], .frequency-slider [role="slider"], .frequency-slider input[type="range"]',
    );
  expect(frequencyScalePosition(20)).toBe(0);
  expect(frequencyScalePosition(20000)).toBeCloseTo(1, 12);
  // A logarithmic scale: 100 Hz and 1 kHz are a decade apart, a third of it.
  expect(
    frequencyScalePosition(1000) - frequencyScalePosition(100),
  ).toBeCloseTo(1 / 3, 12);
  for (const [hz, label] of [
    [100, '100'],
    [1000, '1k'],
  ]) {
    await act(async () => field.fill(String(hz)));
    await act(async () => userEvent.tab());
    // The mark is under the thumb, within the thumb's own half-width. Spread
    // evenly, "100" stood where the slider reads about 200 Hz.
    expect(Math.abs(centre(mark(label)) - centre(thumb()))).toBeLessThan(12);
  }
  // The end marks stay inside the track rather than hanging past its ends.
  const track = box('.frequency-slider');
  expect(mark('20 Hz').getBoundingClientRect().left).toBeGreaterThanOrEqual(
    track.left - 1,
  );
  expect(mark('20k Hz').getBoundingClientRect().right).toBeLessThanOrEqual(
    track.right + 1,
  );
  // No two marks overlap, down to a phone.
  await page.viewport(360, 740);
  const marks = [...container.querySelectorAll('.range-labels span')].map(
    (span) => span.getBoundingClientRect(),
  );
  for (let i = 1; i < marks.length; i++)
    expect(marks[i].left).toBeGreaterThanOrEqual(marks[i - 1].right);
});

/**
 * A real tone needs Web Audio, which WebKit under Playwright does not have:
 * `new AudioEngine()` throws there and the page shows its audio message. The
 * engine's own output is measured in audio.browser.test.mjs; what is checked
 * here is that a lesson hands it the right numbers and stops when told to.
 */
const audioTest = globalThis.AudioContext ? test : test.skip;

audioTest(
  'A lesson example plays its own frequencies at the laboratory’s volume and is silenced by leaving',
  async () => {
    const preview = vi
      .spyOn(AudioEngine.prototype, 'preview')
      .mockResolvedValue(undefined);
    const stopAll = vi.spyOn(AudioEngine.prototype, 'stopAll');
    await mount();
    await visit('#/en/t/tuning/read');
    const buttons = () => [...container.querySelectorAll('.listen-button')];
    expect(preview).not.toHaveBeenCalled();
    await click(buttons()[1]);
    const plan = planListenStep(lessonListening.tuning[1]);
    expect(preview).toHaveBeenCalledTimes(1);
    const [frequencies, wave, gain, duration, spacing] = preview.mock.calls[0];
    expect(frequencies).toEqual(plan.frequencies);
    // The just major third above A4, whatever the laboratory is tuned to.
    expect(frequencies[1] / frequencies[0]).toBeCloseTo(5 / 4, 12);
    expect(wave).toBe('triangle');
    expect(duration).toBe(plan.duration);
    expect(spacing).toBe(0);
    // The laboratory's starting volume, 18 %, and never more than that.
    expect(gain).toBeCloseTo(0.18, 9);
    expect(buttons()[1].getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('.listen-status').textContent).toBe(
      `Sounding: ${lessonListening.tuning[1].label.en}`,
    );
    expect(container.querySelector('.error-message')).toBeNull();
    // Escape is "stop everything" on every page.
    stopAll.mockClear();
    await act(async () => userEvent.keyboard('{Escape}'));
    expect(stopAll).toHaveBeenCalled();
    expect(buttons()[1].getAttribute('aria-pressed')).toBe('false');
    // Leaving the lesson silences it too.
    await click(buttons()[0]);
    stopAll.mockClear();
    await click(container.querySelector('.lesson-navigation [rel="next"]'));
    await expect.poll(() => window.location.hash).toBe('#/en/t/intervals/read');
    expect(stopAll).toHaveBeenCalled();
    expect(
      container.querySelector('.listen-button[aria-pressed="true"]'),
    ).toBeNull();
  },
);

audioTest(
  'The advertised keys still work after a control has been clicked, and leave typing and sliders alone',
  async () => {
    const start = vi
      .spyOn(AudioEngine.prototype, 'start')
      .mockResolvedValue(true);
    const preview = vi
      .spyOn(AudioEngine.prototype, 'preview')
      .mockResolvedValue(undefined);
    vi.spyOn(AudioEngine.prototype, 'update').mockImplementation(() => {});
    await mount();
    await visit('#/en/play');
    const frequency = () => Number(container.querySelector('#frequency').value);
    const key = (init) =>
      act(async () =>
        document.activeElement.dispatchEvent(
          new KeyboardEvent('keydown', {
            bubbles: true,
            cancelable: true,
            ...init,
          }),
        ),
      );
    // A clicked waveform button keeps focus. A note key is not its business.
    await click(
      [...container.querySelectorAll('.wave-picker button')].find(
        (button) => button.textContent === 'Triangle',
      ),
    );
    expect(document.activeElement.tagName).toBe('BUTTON');
    await key({ code: 'KeyA', key: 'a' });
    expect(preview).toHaveBeenCalledTimes(1);
    // An arrow still nudges the frequency from there…
    const before = frequency();
    await key({ code: 'ArrowRight', key: 'ArrowRight' });
    expect(frequency()).toBeCloseTo(before + 1, 6);
    // …but Space on a button presses that button; it does not start the tone.
    await key({ code: 'Space', key: ' ' });
    expect(start).not.toHaveBeenCalled();

    // In a number field every key is typing.
    const field = container.querySelector('#frequency');
    field.focus();
    const typed = frequency();
    preview.mockClear();
    await key({ code: 'KeyA', key: 'a' });
    await key({ code: 'ArrowRight', key: 'ArrowRight' });
    await key({ code: 'Space', key: ' ' });
    expect(preview).not.toHaveBeenCalled();
    expect(start).not.toHaveBeenCalled();
    expect(frequency()).toBe(typed);

    // On a slider the arrows belong to the slider; a note key is still free.
    const slider = container.querySelector(
      '.lens-play input[type="range"], .lens-play [role="slider"]',
    );
    slider.focus();
    const held = frequency();
    await key({ code: 'KeyS', key: 's' });
    expect(preview).toHaveBeenCalledTimes(1);
    const sounded = frequency();
    expect(sounded).not.toBe(held);
    await key({ code: 'ArrowRight', key: 'ArrowRight' });
    // Whatever the slider does with its own key, the page did not add its
    // 1 Hz step on top of it.
    expect(Math.abs(frequency() - sounded)).toBeLessThan(0.9);

    // With nothing focused, Space starts the tone as the button says.
    document.activeElement.blur();
    await key({ code: 'Space', key: ' ' });
    expect(start).toHaveBeenCalledTimes(1);

    // The width handle uses the arrows itself; the frequency stays put.
    const handle = container.querySelector('.sidebar-resizer');
    handle.focus();
    const steady = frequency();
    await key({ code: 'ArrowRight', key: 'ArrowRight' });
    expect(frequency()).toBe(steady);
  },
);

test('An example that cannot start says why and is not shown as sounding', async () => {
  vi.stubGlobal(
    'AudioContext',
    vi.fn(() => {
      throw new Error('No audio device');
    }),
  );
  await mount();
  await visit('#/ru/t/sound/read');
  // The caption's ordinary colour, read before anything fails.
  const idle = getComputedStyle(
    container.querySelector('.listen-status'),
  ).color;
  await click(container.querySelector('.listen-button'));
  // The card says so beside the button that was pressed, in a status region…
  const status = container.querySelector('.listen-status');
  await expect
    .poll(() => status.querySelector('output').textContent)
    .toContain('Звук не запустился.');
  expect(status.className).toContain('failed');
  expect(
    container.querySelector('.listen-button[aria-pressed="true"]'),
  ).toBeNull();
  // …and once only: nothing is repeated at the top of the page, out of sight.
  expect(container.querySelector('.error-message')).toBeNull();
  // In view without scrolling, and no longer in the caption's ordinary colour.
  const place = status.getBoundingClientRect();
  expect(place.top).toBeGreaterThanOrEqual(box('.topbar').bottom);
  expect(place.bottom).toBeLessThanOrEqual(window.innerHeight);
  expect(getComputedStyle(status).color).not.toBe(idle);
});

test('A reference changed after a lesson loaded its own tone re-tunes that tone, not the one before it', async () => {
  await mount();
  await visit('#/en/play');
  const frequency = () => Number(container.querySelector('#frequency').value);
  const preset = (hz) =>
    click(
      [...container.querySelectorAll('.preset-row button')].find(
        (button) => button.textContent === String(hz),
      ),
    );
  // The free lab at 440 Hz, re-tuned to A4 = 432: the tone follows to 432.
  await preset(432);
  expect(frequency()).toBeCloseTo(432, 2);
  // A lesson's laboratory is then opened by its address (the rail, the course
  // map and Back all arrive this way) and loads its own 220 Hz.
  await visit('#/en/t/sound/play');
  expect(frequency()).toBe(220);
  // Leaving the reference field without editing it must not move the tone.
  const reference = page.getByRole('spinbutton', {
    name: 'A4 reference frequency',
  });
  await act(async () => reference.click());
  await act(async () => userEvent.tab());
  expect(frequency()).toBe(220);
  // Back to A4 = 440: the lesson's 220 Hz is re-tuned, 220 × 440/432. Holding
  // on to the earlier ratio jumped to 440 Hz, a different note.
  await preset(440);
  expect(frequency()).toBeCloseTo((220 * 440) / 432, 2);
  // The same on arriving through history: another lesson is opened as a new
  // entry, and Back returns to this one, which loads its 220 Hz again.
  await act(async () => {
    window.history.pushState(null, '', '#/en/t/timbre/play');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  expect(frequency()).toBe(lessons.find((lesson) => lesson.id === 'timbre').hz);
  await act(async () => window.history.back());
  await expect.poll(() => window.location.hash).toBe('#/en/t/sound/play');
  await expect.poll(() => frequency()).toBe(220);
  await preset(415);
  expect(frequency()).toBeCloseTo((220 * 415) / 440, 2);
});

test('A chosen glossary term opens its entry and brings it into view on a narrow page', async () => {
  await page.viewport(360, 740);
  await mount();
  await visit('#/en/define');
  window.scrollTo(0, 0);
  const rows = () => [...container.querySelectorAll('.term-row')];
  const entry = () => container.querySelector('.term-entry');
  expect(rows().length).toBeGreaterThan(20);
  const target = rows()[6];
  const name = target.querySelector('.term-name').textContent;
  expect(entry().querySelector('h2').textContent).not.toBe(name);
  // Stacked, the entry starts below the list.
  expect(entry().getBoundingClientRect().top).toBeGreaterThan(
    target.getBoundingClientRect().top,
  );
  await act(async () => target.click());
  await expect.poll(() => entry().querySelector('h2').textContent).toBe(name);
  expect(target.getAttribute('aria-pressed')).toBe('true');
  expect(rows().filter((row) => row.className.includes('selected'))).toEqual([
    target,
  ]);
  // The definition is on screen, below the bar, without the reader scrolling.
  await expect
    .poll(() => entry().getBoundingClientRect().top)
    .toBeLessThan(window.innerHeight - 40);
  expect(entry().getBoundingClientRect().top).toBeGreaterThanOrEqual(
    box('.topbar').bottom,
  );
  // The list leaves room for the entry it opens.
  expect(box('.term-index ul').height).toBeLessThanOrEqual(740 * 0.4);
  // Each way out of the entry is on a line of its own.
  const links = [...entry().querySelectorAll(':scope > a, :scope > button')];
  expect(links.length).toBeGreaterThan(2);
  const tops = links.map((link) =>
    Math.round(link.getBoundingClientRect().top),
  );
  expect(new Set(tops).size).toBe(tops.length);
  // The German hint addresses the reader as du.
  await act(async () =>
    page.getByRole('button', { name: 'DE', exact: true }).click(),
  );
  await act(async () =>
    page
      .getByRole('textbox', { name: 'Musikalische Begriffe suchen' })
      .fill('zzzzzz'),
  );
  expect(container.querySelector('.index-actions').textContent).toContain(
    'Versuche „Tonhöhe“',
  );
});

test('Leaving the tempo field unchanged is not an edit: Redo, Undo and the phrase stay as they were', async () => {
  await mount();
  await visit('#/en/t/chords/play');
  const named = (name) => page.getByRole('button', { name, exact: true });
  const disabled = (name) => named(name).element().disabled;
  const tempo = page.getByRole('spinbutton', { name: 'Tempo', exact: true });
  const cards = () => container.querySelectorAll('.chord-card').length;
  const before = cards();
  const original = tempo.element().value;
  expect(disabled('Undo')).toBe(true);
  // Focus and leave: nothing happened, so there is nothing to undo.
  await act(async () => tempo.click());
  await act(async () => userEvent.tab());
  expect(disabled('Undo')).toBe(true);
  // An edit that can be redone…
  await act(async () => named('Duplicate chord').click());
  await act(async () => named('Undo').click());
  expect(cards()).toBe(before);
  expect(disabled('Redo')).toBe(false);
  // …survives a visit to the tempo field. It used to be wiped by the field
  // reporting its unchanged value on blur.
  await act(async () => tempo.click());
  await act(async () => userEvent.tab());
  expect(disabled('Redo')).toBe(false);
  expect(disabled('Undo')).toBe(true);
  await act(async () => named('Redo').click());
  expect(cards()).toBe(before + 1);
  // A real change is still an edit, and one Undo takes it back.
  await act(async () => named('Undo').click());
  await act(async () => tempo.fill('120'));
  await act(async () => userEvent.tab());
  expect(tempo.element().value).toBe('120');
  expect(disabled('Undo')).toBe(false);
  await act(async () => named('Undo').click());
  expect(tempo.element().value).toBe(original);
});

test('On a narrow column the staff keeps its shape, so each click row stays on the line it stands for', async () => {
  const host = document.body.appendChild(document.createElement('div'));
  const staffRoot = createRoot(host);
  const render = (width) =>
    act(async () =>
      staffRoot.render(
        createElement(
          'div',
          { style: { width } },
          createElement(StaffPosition, {
            clef: 'treble',
            accidental: 0,
            lang: 'en',
            disabled: false,
            value: null,
            onChange: () => {},
          }),
        ),
      ),
    );
  try {
    await render('600px');
    const field = () => host.querySelector('.staff-position');
    const natural = field().getBoundingClientRect();
    const ratio = natural.height / natural.width;
    // Where each row sits, as a fraction of the box, at its natural size.
    const fractions = () => {
      const frame = field().getBoundingClientRect();
      return [...field().querySelectorAll('button')].map((button) => {
        const row = button.getBoundingClientRect();
        return (row.top + row.height / 2 - frame.top) / frame.height;
      });
    };
    const at = fractions();
    expect(at.length).toBeGreaterThan(8);
    // Clamped to less than half its natural width.
    await render(`${Math.round(natural.width * 0.45)}px`);
    const clamped = field().getBoundingClientRect();
    expect(clamped.width).toBeLessThan(natural.width * 0.5);
    // The box scales as a whole; with a fixed height it kept its full height
    // and the rows drifted off the drawing above them.
    expect(clamped.height / clamped.width).toBeCloseTo(ratio, 1);
    const drawing = field().querySelector('svg').getBoundingClientRect();
    expect(Math.abs(drawing.height - clamped.height)).toBeLessThan(2);
    fractions().forEach((fraction, index) =>
      expect(fraction).toBeCloseTo(at[index], 2),
    );
  } finally {
    await act(async () => staffRoot.unmount());
    host.remove();
  }
});

test('The chosen answer mode is drawn as chosen, and the German prompts say du', async () => {
  await mount();
  await visit('#/de/t/staff/drill');
  const modes = () => [
    ...container.querySelectorAll('.drill-question .note-chooser button'),
  ];
  const state = () =>
    modes().map((button) => [
      button.className,
      button.getAttribute('aria-pressed'),
    ]);
  expect(state()).toEqual([
    ['selected', 'true'],
    ['', 'false'],
    ['', 'false'],
  ]);
  await click(modes()[2]);
  expect(state()).toEqual([
    ['', 'false'],
    ['', 'false'],
    ['selected', 'true'],
  ]);
  // The chosen mode is visibly different from the other two.
  expect(getComputedStyle(modes()[2]).backgroundColor).not.toBe(
    getComputedStyle(modes()[0]).backgroundColor,
  );
  const card = container.querySelector('.drill-question').textContent;
  expect(card).toContain('Setze diesen Ton:');
  expect(card).toContain('Klicke auf eine Position');
  expect(card).not.toMatch(/\bSie\b|\bIhre\b/);
});

test('The dynamics lesson plays the same note soft and strong, at different levels', async () => {
  audioContextIfMissing();
  const preview = vi
    .spyOn(AudioEngine.prototype, 'preview')
    .mockResolvedValue(undefined);
  vi.spyOn(AudioEngine.prototype, 'stopAll').mockImplementation(() => {});
  await mount();
  await visit('#/en/t/dynamics/read');
  const buttons = [...container.querySelectorAll('.listen-button')];
  const [soft, strong] = lessonListening.dynamics.map(planListenStep);
  await click(buttons[0]);
  await click(buttons[1]);
  expect(preview).toHaveBeenCalledTimes(2);
  const [softCall, strongCall] = preview.mock.calls;
  // The same pitch and length…
  expect(softCall[0]).toEqual(strongCall[0]);
  expect(softCall[3]).toBe(strongCall[3]);
  // …and only the level differs, by the plan's own factor of the lab volume.
  expect(strongCall[2]).toBeCloseTo(0.18 * strong.gain, 9);
  expect(softCall[2]).toBeCloseTo(0.18 * soft.gain, 9);
  expect(softCall[2]).toBeLessThan(strongCall[2]);
});

test('On a phone, choosing a lesson or the brand in the navigation sheet closes the sheet', async () => {
  await page.viewport(360, 740);
  await mount();
  await visit('#/en/t/staff/read');
  const sheet = () => document.querySelector('[role="dialog"]');
  const open = () =>
    act(async () =>
      page.getByRole('button', { name: 'Open navigation' }).click(),
    );
  await open();
  await expect.poll(() => sheet()).not.toBeNull();
  // The areas and the book are two named landmarks inside it.
  expect(
    [...sheet().querySelectorAll('nav')].map((nav) =>
      nav.getAttribute('aria-label'),
    ),
  ).toEqual(['Areas of the site', 'Course contents']);
  expect(
    sheet().querySelector('nav [aria-current="page"]').textContent,
  ).toContain('Music theory');
  // The open lesson is marked in the map; another one is chosen.
  expect(sheet().querySelector('.course-map [aria-current="page"]').hash).toBe(
    '#/en/t/staff/read',
  );
  await click(sheet().querySelector('.course-map a[href$="/t/clefs/read"]'));
  await expect.poll(() => window.location.hash).toBe('#/en/t/clefs/read');
  await expect.poll(() => sheet()).toBeNull();
  expect(container.querySelector('h1')).toBe(document.activeElement);

  await open();
  await expect.poll(() => sheet()).not.toBeNull();
  const before = window.history.length;
  await click(sheet().querySelector('.brand'));
  await expect.poll(() => window.location.hash).toBe('#/en/play');
  await expect.poll(() => sheet()).toBeNull();
  expect(window.history.length).toBe(before + 1);
});

test('A returning reader is offered the lesson their saved address was reading', async () => {
  await mount();
  // A saved profile arrives the way an imported backup does: the page starts
  // again from it, with the address it was last reading.
  const saved = emptyProfile();
  saved.lastRoute = '#/en/t/clefs/read';
  saved.completed = ['sound'];
  try {
    await act(async () => profileStore.replace(saved));
    await visit('#/en/read');
    const resume = container.querySelector('.course-resume');
    expect(resume.querySelector('.eyebrow').textContent).toBe('CONTINUE');
    expect(resume.querySelector('a.primary-button').hash).toBe(
      '#/en/t/clefs/read',
    );
    // And the map is open at that chapter although no lesson is open now.
    expect(
      [...container.querySelectorAll('.course-map details')]
        .filter((node) => node.open)
        .map((node) => node.querySelector('summary > span').textContent),
    ).toEqual(['Reading pitch']);
    expect(
      container.querySelector('.course-map .course-map-mark[data-done]'),
    ).not.toBeNull();
  } finally {
    // Later tests start from a reader with nothing saved.
    await act(async () => profileStore.replace(emptyProfile()));
  }
});

test('A control reached with the keyboard is never left under the top bar', async () => {
  await page.viewport(1280, 700);
  await mount();
  await visit('#/en/t/clefs/read');
  // Half-way down the lesson, then back up through the page with Shift+Tab:
  // each control that takes focus is scrolled clear of the sticky bar.
  const mark = container.querySelector('.lesson-progress input');
  mark.scrollIntoView({ block: 'center' });
  mark.focus();
  await expect.poll(() => window.scrollY).toBeGreaterThan(300);
  const bar = () => box('.topbar').bottom;
  for (let i = 0; i < 12; i++) {
    await act(async () => userEvent.tab({ shift: true }));
    const focused = document.activeElement;
    if (!container.querySelector('main').contains(focused)) break;
    const rect = focused.getBoundingClientRect();
    expect(rect.top, focused.outerHTML.slice(0, 80)).toBeGreaterThanOrEqual(
      bar(),
    );
  }
  // The skip link brings the start of the content below the bar as well.
  window.scrollTo(0, 600);
  const skip = container.querySelector('.skip-link');
  skip.focus({ preventScroll: true });
  await act(async () => userEvent.keyboard('{Enter}'));
  await expect
    .poll(() => box('h1').top)
    .toBeGreaterThanOrEqual(box('.topbar').bottom);
  expect(box('h1').bottom).toBeLessThan(window.innerHeight);
});

test('The prerendered shell is hidden only while the reader’s own page is pending', async () => {
  const shell = document.body.appendChild(document.createElement('div'));
  shell.dataset.slot = 'sidebar-wrapper';
  shell.textContent = 'prerendered default page';
  const visibility = () => getComputedStyle(shell).visibility;
  try {
    // Without JavaScript the mark is never set: the page shows as rendered.
    shell.setAttribute('aria-busy', 'true');
    expect(visibility()).toBe('visible');
    // Marked by the boot script and not ready yet: out of sight.
    document.documentElement.dataset.boot = 'pending';
    expect(visibility()).toBe('hidden');
    // Ready: shown, whatever the mark says.
    shell.setAttribute('aria-busy', 'false');
    expect(visibility()).toBe('visible');
    // And released if the application never became ready.
    shell.setAttribute('aria-busy', 'true');
    delete document.documentElement.dataset.boot;
    expect(visibility()).toBe('visible');
  } finally {
    delete document.documentElement.dataset.boot;
    shell.remove();
  }
  // The real shell is ready and visible once mounted, mark or no mark.
  document.documentElement.dataset.boot = 'pending';
  await mount();
  const wrapper = container.querySelector('[data-slot="sidebar-wrapper"]');
  expect(wrapper.getAttribute('aria-busy')).toBe('false');
  expect(getComputedStyle(wrapper).visibility).toBe('visible');
  delete document.documentElement.dataset.boot;
});

test('The oscilloscope sizes its canvas once per size, not once per frame, on a fractional display', async () => {
  const ratio = vi
    .spyOn(window, 'devicePixelRatio', 'get')
    .mockReturnValue(1.5);
  await mount();
  await visit('#/en/play');
  const canvas = container.querySelector('.scope canvas');
  const frames = (count) =>
    act(
      () =>
        new Promise((resolve) => {
          const step = (left) =>
            left ? requestAnimationFrame(() => step(left - 1)) : resolve();
          step(count);
        }),
    );
  await frames(3);
  // Whole pixels, at the display's own ratio.
  expect(canvas.width).toBe(Math.round(canvas.clientWidth * 1.5));
  expect(canvas.height).toBe(Math.round(canvas.clientHeight * 1.5));
  // Assigning a canvas its size clears it and reallocates the backing store.
  // With a fractional product the comparison never matched and that happened
  // on every frame; now further frames leave the canvas alone.
  let assigned = 0;
  const width = Object.getOwnPropertyDescriptor(
    HTMLCanvasElement.prototype,
    'width',
  );
  Object.defineProperty(canvas, 'width', {
    configurable: true,
    get() {
      return width.get.call(this);
    },
    set(value) {
      assigned++;
      width.set.call(this, value);
    },
  });
  await frames(6);
  expect(assigned).toBe(0);
  delete canvas.width;
  ratio.mockRestore();
});

test('A lesson address that names a passage which is not there opens the lesson at its title', async () => {
  await page.viewport(1280, 700);
  await mount();
  await visit('#/en/t/clefs/read');
  container
    .querySelector('.lesson-navigation')
    .scrollIntoView({ block: 'center' });
  await expect.poll(() => window.scrollY).toBeGreaterThan(400);
  // Sound has no rule to anchor, and this anchor names nothing anywhere.
  await visit('#/en/t/sound/read~no-such-passage');
  expect(container.querySelector('h1')).toBe(document.activeElement);
  await expect.poll(() => box('h1').top).toBeLessThan(200);
  expect(box('h1').top).toBeGreaterThanOrEqual(box('.topbar').bottom);
});

test('Keys a link, a disclosure or the navigation sheet need are left to them', async () => {
  audioContextIfMissing();
  const start = vi
    .spyOn(AudioEngine.prototype, 'start')
    .mockResolvedValue(true);
  const preview = vi
    .spyOn(AudioEngine.prototype, 'preview')
    .mockResolvedValue(undefined);
  vi.spyOn(AudioEngine.prototype, 'update').mockImplementation(() => {});
  vi.spyOn(AudioEngine.prototype, 'stopAll').mockImplementation(() => {});
  await mount();
  await visit('#/en/play');
  const frequency = () => Number(container.querySelector('#frequency').value);
  const key = (init) =>
    act(async () =>
      document.activeElement.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          ...init,
        }),
      ),
    );
  // Space opens a disclosure and follows a link; it does not start the tone.
  for (const selector of ['.course-browse > summary', '.course-map li a']) {
    container.querySelector(selector).focus();
    await key({ code: 'Space', key: ' ' });
    expect(start, selector).not.toHaveBeenCalled();
    // Neither owns the arrows or the note keys, so those still reach the lab.
    const before = frequency();
    await key({ code: 'ArrowRight', key: 'ArrowRight' });
    expect(frequency()).toBeCloseTo(before + 1, 6);
  }
  preview.mockClear();
  await key({ code: 'KeyD', key: 'd' });
  expect(preview).toHaveBeenCalledTimes(1);

  // Inside the open navigation sheet every key belongs to the sheet.
  await page.viewport(360, 740);
  await act(async () =>
    page.getByRole('button', { name: 'Open navigation' }).click(),
  );
  await expect
    .poll(() => document.querySelector('[role="dialog"]'))
    .not.toBeNull();
  document.querySelector('[role="dialog"] .course-map li a').focus();
  const held = frequency();
  preview.mockClear();
  await key({ code: 'KeyA', key: 'a' });
  await key({ code: 'ArrowRight', key: 'ArrowRight' });
  await key({ code: 'Space', key: ' ' });
  expect(preview).not.toHaveBeenCalled();
  expect(start).not.toHaveBeenCalled();
  expect(frequency()).toBe(held);
});
