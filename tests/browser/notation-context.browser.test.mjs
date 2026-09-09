import { afterEach, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { act, createElement, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { NotesLab } from '../../components/notes-lab.tsx';
import { Encyclopedia, Practice } from '../../components/learning.tsx';
import Home from '../../app/(root)/page.tsx';
import { initialNotesLabState } from '../../lib/notation-experiments.ts';
import { terms } from '../../lib/learning.ts';
import { termAnchor, termSearchText, TOPIC_IDS } from '../../lib/topics.ts';
import { routeFromHash } from '../../lib/client-store.ts';
import { notationForwardLinks } from '../../lib/notation-programme.ts';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
async function mount(Component, props) {
  container ??= document.body.appendChild(document.createElement('div'));
  root ??= createRoot(container);
  await act(() => root.render(createElement(Component, props)));
}
afterEach(async () => {
  await act(async () => {
    window.history.replaceState(null, '', '#/en/play');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  if (root) await act(() => root.unmount());
  container?.remove();
  root = container = null;
  vi.restoreAllMocks();
  await page.viewport(1280, 900);
});

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

for (const lang of ['en', 'ru', 'de']) {
  test(`Reference entries expose their related lessons, future modules and additional sources in ${lang}`, async () => {
    for (const title of [
      'Figured bass',
      'Acciaccatura: distinguish the usage',
      'Pitch-name systems',
    ]) {
      const target = terms.find((term) => term.title.en === title);
      expect(target).toBeDefined();
      await mount(Encyclopedia, {
        key: title,
        lang,
        subject: target.lesson,
        anchor: termAnchor(target),
        openLesson: vi.fn(),
      });
      const links = [...container.querySelectorAll('.term-entry a')];
      for (const id of target.relatedTopics ?? [])
        expect(
          links.some((link) => link.hash === `#/${lang}/t/${id}/read`),
        ).toBe(true);
      for (const id of target.forwardModules ?? [])
        expect(
          links.some((link) => link.href === notationForwardLinks[id]),
        ).toBe(true);
      for (const source of target.furtherSources ?? [])
        expect(links.some((link) => link.href === source.url)).toBe(true);
    }
  });
  test(`The ledger budget supports real keyboard placement at both extremes in ${lang}`, async () => {
    await page.viewport(390, 844);
    const play = vi.fn();
    const stop = vi.fn();
    await mount(ControlledLab, { lang, play, stop, playExample: vi.fn() });
    expect(play).not.toHaveBeenCalled();
    const budget = container.querySelector('input[type="range"]');
    await act(async () => {
      budget.focus();
      await userEvent.keyboard('{End}');
    });
    expect(budget.value).toBe('6');
    expect(play).not.toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
    const positions = container.querySelector('.staff-position');
    expect(positions.querySelectorAll('button')).toHaveLength(35);
    await act(async () => {
      positions.querySelector('[tabindex="0"]').focus();
      await userEvent.keyboard('{End}');
    });
    expect(play).toHaveBeenLastCalledWith(100); // Top outer space: E7.
    await act(() => userEvent.keyboard('{Home}'));
    expect(play).toHaveBeenLastCalledWith(41); // Bottom outer space: F2.
    expect(container.querySelectorAll('[data-tie="2"]')).toHaveLength(1);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(391);
    await act(async () => {
      budget.focus();
      await userEvent.keyboard('{Home}');
    });
    expect(budget.value).toBe('0');
    expect(positions.querySelectorAll('button')).toHaveLength(11);
    expect(positions.querySelectorAll('[tabindex="0"]')).toHaveLength(1);
  });

  test(`A reference deep link opens its headword, source and learning context in ${lang}`, async () => {
    const target = terms.find((term) => term.title.en === 'Key signature');
    expect(target).toBeDefined();
    const anchor = termAnchor(target);
    await mount(Encyclopedia, {
      lang,
      subject: target.lesson,
      anchor,
      openLesson: vi.fn(),
    });
    expect(container.querySelector('.term-entry h2').textContent).toBe(
      target.title[lang],
    );
    const link = [...container.querySelectorAll('.term-entry a')].find((item) =>
      item.hash.includes('define~'),
    );
    expect(routeFromHash(link.hash, { lang, topics: TOPIC_IDS })).toEqual({
      lang,
      lens: 'define',
      topic: target.lesson,
      anchor,
    });
    const exits = [...container.querySelectorAll('.term-entry a')].map(
      (a) => a.hash,
    );
    expect(exits).toContain(`#/${lang}/t/${target.lesson}/play`);
    expect(exits).toContain(`#/${lang}/t/${target.lesson}/drill`);
    expect(termSearchText(target, lang)).toContain(
      target.title[lang].toLowerCase(),
    );
    // Malformed/unknown anchors fall back to the subject index, never decode as HTML.
    await mount(Encyclopedia, {
      key: 'unknown',
      lang,
      subject: target.lesson,
      anchor: '%ZZ<script>',
      openLesson: vi.fn(),
    });
    expect(container.querySelector('.term-entry')).not.toBeNull();
    expect(container.querySelector('.term-entry script')).toBeNull();
  });
}

test('Advancing the actual trainer reaches the mixed pitch-and-rhythm excerpts', async () => {
  // Staff has a single-pitch rule followed by the excerpt rule. Choose the latter.
  vi.spyOn(Math, 'random').mockReturnValue(0.9999);
  await mount(Practice, { lang: 'en', topic: 'staff' });
  await act(() =>
    [...container.querySelectorAll('button')]
      .find((button) => button.textContent === 'Start a new session')
      .click(),
  );
  await act(() =>
    container.querySelector('.drill-question .answer-grid button').click(),
  );
  await act(() =>
    [...container.querySelectorAll('button')]
      .find((button) => button.textContent.includes('Next question'))
      .click(),
  );
  expect(
    container.querySelector('.notation-response .notation-figure'),
  ).not.toBeNull();
  const parts = [...container.querySelectorAll('.notation-response fieldset')];
  expect(parts.length).toBeGreaterThan(4);
  expect(
    parts.some((part) =>
      /duration/i.test(part.querySelector('legend').textContent),
    ),
  ).toBe(true);
  for (const part of parts)
    await act(() => part.querySelector('button').click());
  expect(
    container.querySelector('.notation-response [aria-live]').textContent,
  ).toContain('Rhythm:');
});

test('A pasted term address opens the same reference after application hydration', async () => {
  const target = terms.find((term) => term.title.en === 'Key signature');
  window.history.replaceState(
    null,
    '',
    `#/en/t/${target.lesson}/define~${termAnchor(target)}`,
  );
  await mount(Home);
  expect(container.querySelector('.term-entry h2').textContent).toBe(
    'Key signature',
  );
  expect(container.querySelector('.term-entry .source-link')).not.toBeNull();
});

test('Search includes localized aliases without mixing interface languages', () => {
  const term = {
    title: { en: 'Quarter note', ru: 'Четверть', de: 'Viertelnote' },
    body: {
      en: 'One quarter of a whole.',
      ru: 'Четверть целой.',
      de: 'Ein Viertel einer Ganzen.',
    },
    aliases: { en: 'crotchet', ru: 'четвертная нота', de: 'Viertel' },
  };
  expect(termSearchText(term, 'en')).toContain('crotchet');
  expect(termSearchText(term, 'de')).not.toContain('crotchet');
  expect(termAnchor(term)).toBe('Quarter%20note');
  const reserved = { ...term, title: { ...term.title, en: 'A~B / 2%' } };
  const anchor = termAnchor(reserved);
  expect(anchor).toBe('A%7EB%20%2F%202%25');
  expect(
    routeFromHash(`#/en/t/durations/define~${anchor}`, {
      lang: 'en',
      topics: TOPIC_IDS,
    }).anchor,
  ).toBe(anchor);
});
