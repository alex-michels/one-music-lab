import { afterEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '../../app/(root)/page.tsx';
import '../../app/globals.css';
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  resolveTheme,
} from '../../lib/client-store.ts';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;

const COLOUR_SCHEME = '(prefers-color-scheme: dark)';

/**
 * The effect asks the operating system what `system` means, so the query is
 * stubbed rather than left to whatever machine the suite runs on. The stub also
 * records its listeners, which is how the test sees the subscription go away.
 * Every other query is passed through: the sidebar asks for `(max-width: 767px)`
 * on the same render and must keep getting a real answer.
 */
function stubPrefersDark(matches) {
  const real = window.matchMedia.bind(window);
  const listeners = new Set();
  const media = {
    matches,
    addEventListener: (type, fn) => {
      expect(type).toBe('change');
      listeners.add(fn);
    },
    removeEventListener: (type, fn) => {
      listeners.delete(fn);
    },
  };
  vi.stubGlobal('matchMedia', (query) =>
    query === COLOUR_SCHEME ? media : real(query),
  );
  return { media, listeners };
}

function mount() {
  container = document.createElement('div');
  document.body.append(container);
  act(() => {
    root = createRoot(container);
    root.render(createElement(Home));
  });
}

const root_ = () => document.documentElement;
const token = (name) => getComputedStyle(root_()).getPropertyValue(name).trim();

afterEach(async () => {
  if (root) void act(() => root.unmount());
  root = null;
  container?.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  // documentElement and localStorage outlive the iframe a test file runs in.
  delete root_().dataset.theme;
  root_().classList.remove('dark');
  localStorage.removeItem(THEME_STORAGE_KEY);
  await page.viewport(1280, 900);
});

test('The theme is written on both channels, and released on unmount', () => {
  const { listeners } = stubPrefersDark(false);
  expect(root_().dataset.theme).toBeUndefined();

  mount();

  // The token layer reads [data-theme]; the dark: utilities inside
  // components/ui compile through .dark. One without the other leaves those
  // components rendering light values on a dark ground.
  const resolved = resolveTheme(DEFAULT_THEME, false);
  expect(root_().dataset.theme).toBe(resolved);
  expect(root_().classList.contains('dark')).toBe(resolved === 'dark');
  // What is remembered is the reader's choice, not what it resolved to.
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(DEFAULT_THEME);
  expect(listeners.size, 'the operating system is watched').toBe(1);

  void act(() => root.unmount());
  root = null;
  expect(listeners.size, 'and stops being watched').toBe(0);
});

test('A machine set to dark is honoured without anyone choosing a theme', () => {
  stubPrefersDark(true);
  mount();
  const wanted = resolveTheme(DEFAULT_THEME, true);
  expect(root_().dataset.theme).toBe(wanted);
  expect(root_().classList.contains('dark')).toBe(wanted === 'dark');
});

test('Chrome flips with the theme and notation does not', () => {
  stubPrefersDark(false);
  mount();

  const chrome = [
    '--c-ground',
    '--c-surface',
    '--c-ink',
    '--c-rule',
    '--c-link',
  ];
  const score = ['--s-paper', '--s-ink', '--s-ground', '--s-live', '--s-rule'];
  const before = Object.fromEntries(
    [...chrome, ...score].map((name) => [name, token(name)]),
  );
  for (const name of [...chrome, ...score])
    expect(before[name], `${name} is defined`).not.toBe('');

  root_().dataset.theme = 'dark';
  root_().classList.add('dark');

  for (const name of chrome)
    expect(token(name), `${name} flips`).not.toBe(before[name]);
  // The whole point of the second namespace: a staff is black ink on white
  // paper in either theme because no dark rule redefines these.
  for (const name of score)
    expect(token(name), `${name} holds`).toBe(before[name]);
});
