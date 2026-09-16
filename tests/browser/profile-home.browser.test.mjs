import { afterEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '../../app/(root)/page.tsx';
import {
  emptyProfile,
  PROFILE_KEY,
  parseBackup,
  serializeProfile,
} from '../../lib/local-profile.ts';
import '../../app/globals.css';
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
const click = (name) =>
  act(async () => page.getByRole('button', { name, exact: true }).click());
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
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = null;
  container?.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  for (const key of [
    'oml-language',
    'oml-theme',
    'oml-sidebar-width',
    'oml-profile',
  ])
    localStorage.removeItem(key);
});
test('A saved tone and route restore silently; lesson and practice progress persist across new sessions', async () => {
  const p = emptyProfile();
  p.lastRoute = '#/en/play';
  p.lab.frequency = 432;
  p.lab.wave = 'triangle';
  p.lab.volume = 9;
  p.settings.theme = 'dark';
  p.settings.sidebarWidth = 300;
  localStorage.setItem(PROFILE_KEY, serializeProfile(p));
  window.history.replaceState(null, '', window.location.pathname);
  const audio = vi.fn(() => {
    throw new Error('No user gesture');
  });
  vi.stubGlobal('AudioContext', audio);
  await mount();
  expect(container.querySelector('#frequency').value).toBe('432');
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(audio).not.toHaveBeenCalled();
  await visit('#/en/t/staff/read');
  await act(async () =>
    page
      .getByRole('checkbox', { name: 'I have worked through this lesson' })
      .click(),
  );
  await visit('#/en/t/dots-ties/drill');
  const answer = container.querySelector('.drill-question .answer-grid button');
  await act(async () => page.elementLocator(answer).click());
  const saved = parseBackup(localStorage.getItem(PROFILE_KEY));
  expect(saved.completed).toEqual(['staff']);
  expect(
    Object.values(saved.answers).reduce((sum, row) => sum + row.asked, 0),
  ).toBe(1);
  await click('Start a new session');
  expect(parseBackup(localStorage.getItem(PROFILE_KEY)).answers).toEqual(
    saved.answers,
  );
  await visit('#/en/play');
  expect(container.querySelector('#frequency').value).toBe('432');
  expect(audio).not.toHaveBeenCalled();
  await act(async () =>
    page.elementLocator(container.querySelector('.local-data summary')).click(),
  );
  await click('Reset local data');
  await click('Confirm replacement');
  expect(document.activeElement).toBe(container.querySelector('h1'));
  expect(container.querySelector('#frequency').value).toBe('440');
  expect(parseBackup(localStorage.getItem(PROFILE_KEY)).answers).toEqual({});
  expect(parseBackup(localStorage.getItem(PROFILE_KEY)).completed).toEqual([]);
  expect(audio).not.toHaveBeenCalled();
});
