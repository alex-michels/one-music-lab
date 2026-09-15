import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { LocalData, LessonProgress } from '../../components/local-data.tsx';
import {
  emptyProfile,
  parseBackup,
  PROFILE_KEY,
  profileStore,
  serializeProfile,
} from '../../lib/local-profile.ts';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
const restored = vi.fn();
const click = (name) =>
  act(async () => page.getByRole('button', { name, exact: true }).click());
async function mount(lang = 'en') {
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  await act(() =>
    root.render(
      createElement(
        'div',
        {},
        createElement(LessonProgress, { topic: 'staff', lang }),
        createElement(LocalData, { lang, onRestore: restored }),
      ),
    ),
  );
  await act(async () =>
    page.elementLocator(container.querySelector('summary')).click(),
  );
}
async function upload(file) {
  const input = container.querySelector('input[type=file]');
  let reading;
  if (file) {
    const read = file.text.bind(file);
    vi.spyOn(file, 'text').mockImplementation(() => {
      reading = read();
      return reading;
    });
  }
  await act(async () => {
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: file ? [file] : [],
    });
    input.dispatchEvent(new Event('change', { bubbles: true }));
    if (reading) await reading.catch(() => {});
  });
}
beforeEach(() => {
  profileStore.replace(emptyProfile());
  restored.mockClear();
});
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = null;
  container?.remove();
  vi.restoreAllMocks();
  await page.viewport(1280, 900);
});
for (const [lang, mark, reset, cancel, confirm, title] of [
  [
    'en',
    'I have worked through this lesson',
    'Reset local data',
    'Cancel',
    'Confirm replacement',
    'Learning data',
  ],
  [
    'ru',
    'Я проработал(а) этот урок',
    'Сбросить локальные данные',
    'Отмена',
    'Подтвердить замену',
    'Учебные данные',
  ],
  [
    'de',
    'Ich habe diese Lektion durchgearbeitet',
    'Lokale Daten zurücksetzen',
    'Abbrechen',
    'Ersetzen bestätigen',
    'Lerndaten',
  ],
])
  test(`A reading marker and confirmed reset work on mobile in ${lang}`, async () => {
    await page.viewport(360, 800);
    await mount(lang);
    expect(container.querySelector('summary').textContent).toBe(title);
    const checkbox = page.getByRole('checkbox', { name: mark });
    await act(async () => checkbox.click());
    expect(parseBackup(localStorage.getItem(PROFILE_KEY)).completed).toEqual([
      'staff',
    ]);
    await act(async () => checkbox.click());
    expect(profileStore.getSnapshot().profile.completed).toEqual([]);
    await act(async () => checkbox.click());
    await click(reset);
    await click(cancel);
    expect(profileStore.getSnapshot().profile.completed).toEqual(['staff']);
    await click(reset);
    // Native keyboard activation is checked on the built site in all engines,
    // outside Vitest's concurrent Firefox iframe focus handling.
    await click(confirm);
    expect(restored.mock.calls).toEqual([[emptyProfile()]]);
    expect(profileStore.getSnapshot().profile.completed).toEqual([]);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      window.innerWidth + 1,
    );
  });
test('An exported JSON file imports only after confirmation, keeping settings and progress', async () => {
  const p = emptyProfile();
  p.completed = ['staff'];
  p.settings.theme = 'dark';
  p.answers['natural-name'] = { asked: 3, missed: 1, tag: 'wrong-letter' };
  profileStore.replace(p);
  await mount();
  expect(container.querySelector('.saved-answers').textContent).toContain(
    'Answered: 3',
  );
  let blob;
  const createURL = URL.createObjectURL.bind(URL);
  vi.spyOn(URL, 'createObjectURL').mockImplementation((value) => {
    blob = value;
    return createURL(value);
  });
  const revoke = vi.spyOn(URL, 'revokeObjectURL');
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  await click('Export backup');
  expect(parseBackup(await blob.text())).toEqual(p);
  expect(revoke).toHaveBeenCalledTimes(1);
  expect(document.querySelector('a[download]')).toBeNull();
  await act(() => profileStore.replace(emptyProfile()));
  await upload(new File([blob], 'backup.json', { type: 'application/json' }));
  expect(profileStore.getSnapshot().profile.completed).toEqual([]);
  await click('Cancel');
  expect(restored).not.toHaveBeenCalled();
  await upload(new File([blob], 'backup.json'));
  await click('Confirm replacement');
  expect(restored).toHaveBeenCalledWith(p);
  expect(parseBackup(localStorage.getItem(PROFILE_KEY))).toEqual(p);
});
test('Bad, future, oversized and unreadable files preserve existing work', async () => {
  await mount();
  for (const file of [
    new File(['{'], 'bad.json'),
    new File(['{"version":99}'], 'future.json'),
    new File(['x'.repeat(1_000_001)], 'large.json'),
    { size: 10, text: () => Promise.reject(new Error('read denied')) },
  ]) {
    await upload(file);
    expect(container.textContent).toContain('Nothing was replaced.');
    expect(container.querySelector('fieldset')).toBeNull();
    expect(restored).not.toHaveBeenCalled();
  }
  await upload(undefined);
  expect(container.textContent).not.toContain('Nothing was replaced.');
});
test('Storage and download failures leave data available and announce the failure', async () => {
  await mount();
  await upload(new File([serializeProfile(emptyProfile())], 'backup.json'));
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota');
  });
  await click('Confirm replacement');
  expect(restored).not.toHaveBeenCalled();
  expect(container.querySelector('[role=alert]').textContent).toContain(
    'only in memory',
  );
  expect(container.textContent).toContain('The operation failed.');
  vi.spyOn(URL, 'createObjectURL').mockImplementation(() => {
    throw new Error('download denied');
  });
  await click('Export backup');
  expect(container.textContent).toContain(
    'Your current data is still available.',
  );
});
test('Warnings explain protected invalid and conflicting storage in every locale', async () => {
  for (const lang of ['en', 'ru', 'de']) {
    await mount(lang);
    for (const problem of ['invalid', 'conflict', 'unavailable']) {
      await act(async () => {
        profileStore.set({ ...profileStore.getSnapshot(), problem });
      });
      expect(
        container.querySelector('[role=alert]').textContent.length,
      ).toBeGreaterThan(60);
    }
    await act(() => root.unmount());
    root = null;
    container.remove();
  }
});
