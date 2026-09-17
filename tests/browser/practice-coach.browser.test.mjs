import { afterEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Practice,
  Theory,
  resetPracticeSession,
} from '../../components/learning.tsx';
import { EarTraining } from '../../components/ear-training.tsx';
import {
  CreativeReflection,
  CoachingHistory,
} from '../../components/practice-coach.tsx';
import { profileStore, emptyProfile } from '../../lib/local-profile.ts';
import {
  dueQuestion,
  emptyCoaching,
  emptyCoachingRow,
  itemForRule,
  nextSeed,
} from '../../lib/practice-coach.ts';
import { paragraphAnchors, ruleTopic } from '../../lib/topics.ts';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
async function mount(component, props) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(() => root.render(createElement(component, props)));
}
async function unmount() {
  if (root) await act(() => root.unmount());
  root = null;
  container?.remove();
  container = null;
}
afterEach(async () => {
  await unmount();
  vi.restoreAllMocks();
  await page.viewport(1280, 900);
});
const click = (name) =>
  act(() => page.getByRole('button', { name, exact: true }).click());
const press = (element) => act(() => element.click());
const profile = () => profileStore.getSnapshot().profile;
const setProfile = async (p) =>
  act(async () => {
    profileStore.replace(p);
    resetPracticeSession();
  });
async function answerItem(item, correct = true) {
  const option = item.options.find(
    (option) => (option.id === item.answer) === correct,
  );
  const button = [...container.querySelectorAll('.answer-grid button')].find(
    (button) => button.textContent.trim() === option.label,
  );
  expect(button, option.label).toBeTruthy();
  await press(button);
}
const hintName = {
  en: 'Show a hint',
  ru: 'Показать подсказку',
  de: 'Hinweis anzeigen',
};
const nextHint = {
  en: 'Show another hint',
  ru: 'Ещё подсказка',
  de: 'Weiteren Hinweis anzeigen',
};
const nextName = {
  en: 'Next question',
  ru: 'Следующий вопрос',
  de: 'Nächste Frage',
};
for (const lang of ['en', 'ru', 'de']) {
  test(`Two optional hints precede the answer, reset for a new question and keep assisted success separate in ${lang}`, async () => {
    await setProfile(emptyProfile());
    const rule = 'enharmonic-respelling';
    await mount(Practice, { lang, topic: ruleTopic[rule] });
    expect(container.querySelector('.answer-feedback')).toBe(null);
    await click(hintName[lang]);
    await click(nextHint[lang]);
    expect(container.querySelectorAll('.practice-hints li').length).toBe(2);
    expect(container.querySelector('.practice-hints button')).toBe(null);
    expect(profile().coaching.knowledge[rule]).toBeUndefined();
    await answerItem(itemForRule(rule, 1, lang));
    expect(profile().coaching.knowledge[rule].assisted).toEqual({
      asked: 1,
      correct: 1,
    });
    expect(profile().coaching.knowledge[rule].independent.asked).toBe(0);
    expect(container.querySelector('.attempt-notice').textContent).toContain(
      '3',
    );
    const snapshot = JSON.stringify(profile());
    await press(container.querySelector('.answer-grid button'));
    expect(JSON.stringify(profile())).toBe(snapshot);
    expect(
      container.querySelector('a[href*="/read~enharmonic-respelling"]'),
    ).not.toBe(null);
    await click(nextName[lang]);
    expect(container.querySelectorAll('.practice-hints li').length).toBe(0);
    expect(container.querySelector('.answer-feedback')).toBe(null);
  });
  test(`Creative reflection requires all criteria, gives revision guidance and stays out of automatic scores in ${lang}`, async () => {
    await setProfile(emptyProfile());
    await page.viewport(320, 760);
    await mount(CreativeReflection, { lang });
    const button = () => container.querySelector('button');
    expect(button().disabled).toBe(true);
    const groups = [...container.querySelectorAll('fieldset')];
    for (const group of groups) await press(group.querySelector('input'));
    expect(button().disabled).toBe(false);
    await press(button());
    expect(profile().coaching.creative).toEqual({
      intention: 'revisit',
      comparison: 'revisit',
      explanation: 'revisit',
    });
    expect(profile().coaching.knowledge).toEqual({});
    expect(profile().coaching.hearing).toEqual({});
    expect(button().disabled).toBe(true);
    expect(container.querySelector('.creative-reflection output')).not.toBe(
      null,
    );
    for (const group of groups) await press(group.querySelectorAll('input')[1]);
    await press(button());
    expect(profile().coaching.creative).toEqual({
      intention: 'met',
      comparison: 'met',
      explanation: 'met',
    });
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(322);
  });
}
test('A wrong answer is explained, followed by three completed questions and a changed later check that survives leaving the page', async () => {
  await setProfile(emptyProfile());
  const rule = 'enharmonic-respelling';
  expect(paragraphAnchors[ruleTopic[rule]]).toEqual([rule]);
  await mount(Practice, { lang: 'en', topic: ruleTopic[rule] });
  const original = container.querySelector('.exercise-prompt').textContent;
  await answerItem(itemForRule(rule, 1, 'en'), false);
  expect(container.querySelector('.answer-feedback').textContent).toContain(
    'Not quite',
  );
  let seed = 1;
  for (let i = 0; i < 3; i++) {
    await click('Next question');
    seed = nextSeed(seed);
    expect(container.querySelector('.later-check')).toBe(null);
    await answerItem(itemForRule(rule, seed, 'en'));
  }
  const due = dueQuestion(profile().coaching.knowledge, [rule]);
  await unmount();
  await mount(Practice, { lang: 'en', topic: ruleTopic[rule] });
  expect(container.querySelector('.later-check').textContent).toContain(
    'changed example',
  );
  expect(container.querySelector('.exercise-prompt').textContent).not.toBe(
    original,
  );
  await answerItem(itemForRule(rule, due.seed, 'en'));
  expect(profile().coaching.knowledge[rule].checks).toEqual({
    asked: 1,
    correct: 1,
  });
  expect(profile().coaching.knowledge[rule].pending).toBe(null);
  expect(container.querySelector('.attempt-notice').textContent).toContain(
    'one observation',
  );
});
test('A due check with hints reschedules, while a different lesson and a fresh session retain the pending work', async () => {
  const rule = 'enharmonic-respelling';
  const p = emptyProfile();
  p.coaching.knowledge[rule] = {
    ...emptyCoachingRow(),
    pending: { remaining: 0, seed: 1 },
  };
  await setProfile(p);
  await mount(Practice, { lang: 'en', topic: ruleTopic['natural-name'] });
  expect(container.querySelector('.later-check')).toBe(null);
  await unmount();
  const due = dueQuestion(profile().coaching.knowledge, [rule]);
  await mount(Practice, { lang: 'en', topic: ruleTopic[rule] });
  await click('Start a new session');
  expect(container.querySelector('.later-check')).not.toBe(null);
  await click('Show a hint');
  await answerItem(itemForRule(rule, due.seed, 'en'));
  expect(profile().coaching.knowledge[rule].checks).toEqual({
    asked: 1,
    correct: 0,
  });
  expect(profile().coaching.knowledge[rule].pending).toEqual({
    remaining: 3,
    seed: due.seed,
  });
});
test('Inline lesson hints also schedule practice without scoring an open rubric', async () => {
  await setProfile(emptyProfile());
  for (const rule of ['natural-name', 'compare-beaming']) {
    await mount(Theory, {
      lang: 'en',
      lessonId: ruleTopic[rule],
      setLessonId: vi.fn(),
      openLab: vi.fn(),
      anchor: rule,
    });
    await click('Show a hint');
    if (rule === 'compare-beaming') {
      await click('Compare with the rubric');
      expect(profile().coaching.knowledge[rule]).toBeUndefined();
    } else {
      await answerItem(itemForRule(rule, 1, 'en'), false);
      expect(profile().coaching.knowledge[rule].assisted).toEqual({
        asked: 1,
        correct: 0,
      });
    }
    await unmount();
  }
});
test('Multipart reading records one assisted completion with feedback for each wrong part', async () => {
  const rule = 'read-a-short-excerpt';
  const p = emptyProfile();
  p.coaching.knowledge[rule] = {
    ...emptyCoachingRow(),
    pending: { remaining: 0, seed: 1 },
  };
  await setProfile(p);
  const due = dueQuestion(p.coaching.knowledge, [rule]);
  await mount(Practice, { lang: 'en', topic: ruleTopic[rule] });
  await click('Show a hint');
  const item = itemForRule(rule, due.seed, 'en');
  for (const [index, part] of item.parts.entries()) {
    const group = container.querySelectorAll('.notation-response fieldset')[
      index
    ];
    const wrong = part.options.find((option) => option.id !== part.answer);
    await press(
      [...group.querySelectorAll('button')].find(
        (b) => b.textContent.trim() === wrong.label,
      ),
    );
  }
  expect(profile().coaching.knowledge[rule].assisted).toEqual({
    asked: 1,
    correct: 0,
  });
  expect(profile().answers[rule].asked).toBe(item.parts.length);
  expect(
    container.querySelectorAll('.notation-response .answer-feedback').length,
  ).toBe(item.parts.length);
});
test('Inline multipart feedback preserves individual answers and records one completed knowledge attempt', async () => {
  await setProfile(emptyProfile());
  const rule = 'read-a-short-excerpt';
  const item = itemForRule(rule, 1, 'en');
  await mount(Theory, {
    lang: 'en',
    lessonId: ruleTopic[rule],
    setLessonId: vi.fn(),
    openLab: vi.fn(),
    anchor: rule,
  });
  await click('Show a hint');
  for (const [index, part] of item.parts.entries()) {
    const group = container.querySelectorAll('.notation-response fieldset')[
      index
    ];
    const option = part.options.find((option) =>
      index === 0 ? option.id !== part.answer : option.id === part.answer,
    );
    await press(
      [...group.querySelectorAll('button')].find(
        (button) => button.textContent.trim() === option.label,
      ),
    );
  }
  expect(profile().coaching.knowledge[rule].assisted).toEqual({
    asked: 1,
    correct: 0,
  });
  expect(profile().answers[rule]).toMatchObject({
    asked: item.parts.length,
    missed: 1,
  });
  expect(container.querySelector('.attempt-notice').textContent).toContain(
    'Recorded with hints',
  );
});
test('Listening feedback distinguishes narrower/wider errors, uses hints honestly and records a transposed later check separately', async () => {
  await setProfile(emptyProfile());
  vi.spyOn(Math, 'random').mockReturnValue(0);
  const play = vi.fn().mockResolvedValue();
  await mount(EarTraining, { lang: 'en', reference: 442, play });
  await click('Start listening');
  await click('Show a hint');
  await click('Show another hint');
  await press(container.querySelectorAll('.answer-grid button')[3]);
  expect(container.querySelector('.answer-feedback').textContent).toContain(
    'wider',
  );
  expect(profile().coaching.hearing['minor-third'].assisted).toEqual({
    asked: 1,
    correct: 0,
  });
  const first = play.mock.calls[0][0];
  for (let i = 0; i < 3; i++) {
    await click('Next interval');
    await press(container.querySelectorAll('.answer-grid button')[0]);
  }
  await click('Next interval');
  expect(container.querySelector('.later-check')).not.toBe(null);
  const transposed = play.mock.calls.at(-1)[0];
  expect(transposed[0]).not.toBe(first[0]);
  expect(transposed[1] / transposed[0]).toBeCloseTo(2 ** (3 / 12));
  await press(container.querySelectorAll('.answer-grid button')[0]);
  expect(profile().coaching.hearing['minor-third'].checks).toEqual({
    asked: 1,
    correct: 1,
  });
  expect(profile().coaching.knowledge).toEqual({});
  vi.mocked(Math.random).mockReturnValue(0.99);
  await click('Next interval');
  await press(container.querySelectorAll('.answer-grid button')[0]);
  expect(container.querySelector('.answer-feedback').textContent).toContain(
    'narrower',
  );
});
test('Failed and superseded audio cannot unlock answers or create false attempts; replay can recover', async () => {
  await setProfile(emptyProfile());
  const pending = [];
  const play = vi.fn(
    () => new Promise((resolve, reject) => pending.push({ resolve, reject })),
  );
  await mount(EarTraining, { lang: 'de', reference: 440, play });
  await press(container.querySelector('button'));
  const options = () => [...container.querySelectorAll('.answer-grid button')];
  expect(options().every((b) => b.disabled)).toBe(true);
  await press(container.querySelector('.secondary-button'));
  await act(() => pending[0].resolve());
  expect(options().every((b) => b.disabled)).toBe(true);
  await act(() => pending[1].reject(new Error('blocked')));
  expect(container.querySelector('[role="alert"]')).not.toBe(null);
  expect(profile().coaching.hearing).toEqual({});
  await press(container.querySelector('.secondary-button'));
  await press(container.querySelector('.secondary-button'));
  await act(() => pending[2].reject(new Error('superseded')));
  expect(container.querySelector('[role="alert"]')).toBe(null);
  await act(() => pending[3].resolve());
  expect(options().every((b) => !b.disabled)).toBe(true);
  await press(options()[0]);
  expect(Object.values(profile().coaching.hearing)[0].independent.asked).toBe(
    1,
  );
  await press(container.querySelector('.secondary-button'));
  await unmount();
  await act(() => pending[4].resolve());
});
for (const lang of ['en', 'ru', 'de'])
  test(`History shows unknown/empty channels honestly and separates all three assessments in ${lang}`, async () => {
    await page.viewport(320, 780);
    await mount(CoachingHistory, { lang, coaching: emptyCoaching() });
    expect(container.querySelectorAll('h3').length).toBe(3);
    expect(container.querySelector('a').getAttribute('href')).toBe(
      `#/${lang}/t/chords/play`,
    );
    await unmount();
    const coaching = emptyCoaching();
    coaching.knowledge['natural-name'] = {
      ...emptyCoachingRow(),
      independent: { asked: 2, correct: 1 },
      pending: { remaining: 0, seed: 1 },
    };
    coaching.hearing.octave = {
      ...emptyCoachingRow(),
      assisted: { asked: 3, correct: 2 },
    };
    coaching.creative = {
      intention: 'met',
      comparison: 'revisit',
      explanation: 'met',
    };
    await mount(CoachingHistory, { lang, coaching });
    expect(container.textContent).toContain('1/2');
    expect(container.textContent).toContain('2/3');
    expect(container.querySelectorAll('dl').length).toBe(3);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(322);
  });
