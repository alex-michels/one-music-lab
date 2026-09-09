import { afterEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Encyclopedia } from '../../components/learning.tsx';
import { terms } from '../../lib/learning.ts';
import { topicById } from '../../lib/topics.ts';
import '../../app/globals.css';

/**
 * The define lens is a reference, so the order of the index is part of what it
 * is for. These check the ordering against the reader's own alphabet rather
 * than against a list written into the test: a Cyrillic or German index sorted
 * with the English collator is wrong in a way that is easy to miss and easy to
 * reintroduce.
 */
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
const render = (props) => {
  if (!container) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  }
  return act(() =>
    root.render(createElement(Encyclopedia, { openLesson: vi.fn(), ...props })),
  );
};
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = null;
  container?.remove();
  container = null;
  vi.restoreAllMocks();
});

const names = () =>
  [...container.querySelectorAll('.term-name')].map((el) => el.textContent);
const kinds = () =>
  [...container.querySelectorAll('.term-kind')].map((el) => el.textContent);
const click = (name) =>
  act(async () => page.getByRole('button', { name, exact: true }).click());
/** The reader's own alphabet, wrapped so the comparator carries its collator. */
const alphabetical = (lang) => {
  const collator = new Intl.Collator(lang);
  return (a, b) => collator.compare(a, b);
};

test('The index opens alphabetically, in the alphabet being read', async () => {
  for (const [lang, label] of [
    ['en', 'Term'],
    ['ru', 'Термин'],
    ['de', 'Begriff'],
  ]) {
    await render({ lang });
    const shown = names();
    expect(shown).toHaveLength(terms.length);
    // Sorted by the language's own collator, not by code point.
    const sorted = [...shown].sort(alphabetical(lang));
    expect(shown, `${lang} is not in ${lang} alphabetical order`).toEqual(
      sorted,
    );
    // And the column doing the sorting says so.
    const column = page.getByRole('button', {
      name: `${label}, `,
      exact: false,
    });
    await expect.element(column).toHaveAttribute('aria-pressed', 'true');

    if (root) await act(() => root.unmount());
    root = null;
    container?.remove();
    container = null;
  }
});

test('The same column reverses; the other one takes over', async () => {
  await render({ lang: 'en' });
  const ascending = names();
  await click('Term, ascending');
  expect(names(), 'a second press reverses it').toEqual(
    [...ascending].reverse(),
  );
  await click('Term, descending');
  expect(names()).toEqual(ascending);

  // Kind groups the index, with the term as the tiebreaker inside a group.
  await click('Kind');
  const grouped = kinds();
  expect(grouped).toEqual([...grouped].sort(alphabetical('en')));
  expect(new Set(grouped).size).toBe(4);
  const within = names().filter((_, i) => grouped[i] === grouped[0]);
  expect(within).toEqual([...within].sort(alphabetical('en')));
});

test('Sorting by kind survives a language change, in that language', async () => {
  await render({ lang: 'en' });
  await click('Kind');
  await render({ lang: 'ru' });
  // The groups follow the translated kind names, because those are what the
  // reader sees written beside each row.
  const grouped = kinds();
  expect(grouped).toEqual([...grouped].sort(alphabetical('ru')));
});

test('Choosing a kind narrows the topics, so no empty combination is offered', async () => {
  await render({ lang: 'en' });
  const allTopics = [...container.querySelectorAll('.facet')].length;
  await click('sign');
  const offered = [...container.querySelectorAll('.facet')].length;
  expect(offered).toBeLessThan(allTopics);
  // Every row left is of that kind, and every topic still offered has some.
  // The rows write the kind in lower case; the uppercase is the stylesheet's.
  expect(new Set(kinds())).toEqual(new Set(['sign']));
  for (const term of terms.filter((t) => names().includes(t.title.en)))
    expect(topicById[term.lesson].kind).toBe('sign');
});
