/** @vitest-environment jsdom */
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInThisContext } from 'node:vm';
import { BOOT_SCRIPT, BOOT_TIMEOUT_MS } from '../lib/theme-boot.ts';
import {
  emptyProfile,
  PROFILE_KEY,
  serializeProfile,
} from '../lib/local-profile.ts';
import { THEME_STORAGE_KEY } from '../lib/client-store.ts';

const html = document.documentElement;
/**
 * Runs the script the way a browser runs an inline <script>: as plain text, in
 * the page's own global scope, with nothing imported or passed in.
 */
const boot = () => runInThisContext(BOOT_SCRIPT);
const device = (dark) =>
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query) => ({
      matches: query === '(prefers-color-scheme: dark)' ? dark : false,
    })),
  );
const saveTheme = (theme) => {
  const profile = emptyProfile();
  profile.settings.theme = theme;
  localStorage.setItem(PROFILE_KEY, serializeProfile(profile));
};
const state = () => ({
  theme: html.dataset.theme,
  dark: html.classList.contains('dark'),
});

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  delete html.dataset.theme;
  delete html.dataset.boot;
  html.classList.remove('dark');
  device(false);
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test('A new reader gets the device’s theme on both channels before anything is drawn', () => {
  boot();
  expect(state()).toEqual({ theme: 'light', dark: false });
  device(true);
  boot();
  // The tokens read the attribute and components/ui read the class.
  expect(state()).toEqual({ theme: 'dark', dark: true });
});

test('A saved theme wins over the device, in both directions, and "system" follows it', () => {
  device(false);
  saveTheme('dark');
  boot();
  expect(state()).toEqual({ theme: 'dark', dark: true });
  device(true);
  saveTheme('light');
  boot();
  expect(state()).toEqual({ theme: 'light', dark: false });
  saveTheme('system');
  boot();
  expect(state()).toEqual({ theme: 'dark', dark: true });
});

test('The older single-key preference is honoured until a profile exists, and the profile then wins', () => {
  localStorage.setItem(THEME_STORAGE_KEY, 'dark');
  boot();
  expect(state()).toEqual({ theme: 'dark', dark: true });
  saveTheme('light');
  boot();
  expect(state()).toEqual({ theme: 'light', dark: false });
});

test('Corrupt or unknown saved values fall back to the device instead of breaking the page', () => {
  device(true);
  for (const value of ['{not json', 'null', '{"settings":{}}', '[]', '42']) {
    html.classList.remove('dark');
    delete html.dataset.theme;
    localStorage.setItem(PROFILE_KEY, value);
    expect(boot).not.toThrow();
    expect(state(), value).toEqual({ theme: 'dark', dark: true });
  }
  // A value that is no theme at all behaves like "system", not like dark.
  device(false);
  localStorage.setItem(PROFILE_KEY, '{"settings":{"theme":"sepia"}}');
  boot();
  expect(state()).toEqual({ theme: 'light', dark: false });
});

test('Blocked storage still yields the device theme and never throws', () => {
  device(true);
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new DOMException('denied', 'SecurityError');
  });
  expect(boot).not.toThrow();
  expect(state()).toEqual({ theme: 'dark', dark: true });
});

test('A browser without matchMedia keeps the page usable and still releases it', () => {
  vi.stubGlobal('matchMedia', undefined);
  expect(boot).not.toThrow();
  expect(html.dataset.boot).toBe('pending');
  vi.advanceTimersByTime(BOOT_TIMEOUT_MS);
  expect(html.dataset.boot).toBeUndefined();
});

test('The prerendered shell is hidden only while pending, and is released if the application never starts', () => {
  boot();
  expect(html.dataset.boot).toBe('pending');
  vi.advanceTimersByTime(BOOT_TIMEOUT_MS - 1);
  expect(html.dataset.boot).toBe('pending');
  vi.advanceTimersByTime(1);
  expect(html.dataset.boot).toBeUndefined();
  // The script reads storage and never writes it.
  const write = vi.spyOn(Storage.prototype, 'setItem');
  boot();
  expect(write).not.toHaveBeenCalled();
});

test('The stylesheet hides exactly the pending, not-yet-ready shell, and both layouts carry the script', () => {
  // The tests run from the repository root; a jsdom module URL is not a file.
  const css = readFileSync(resolve('app/globals.css'), 'utf8');
  // Keyed on both conditions: no mark (no JavaScript) or a ready shell shows.
  expect(css).toMatch(
    /html\[data-boot='pending'\] \[data-slot='sidebar-wrapper'\]\[aria-busy='true'\] \{\s*visibility: hidden;\s*\}/,
  );
  for (const layout of ['app/(root)/layout.tsx', 'app/[lang]/layout.tsx']) {
    const source = readFileSync(resolve(layout), 'utf8');
    expect(source, layout).toContain('__html: BOOT_SCRIPT');
    expect(source, layout).toContain('suppressHydrationWarning');
  }
  // Plain text for an inline script: no module syntax, no closing tag in it.
  expect(BOOT_SCRIPT).not.toMatch(/<\/script|import |export /);
  expect(BOOT_SCRIPT).toContain(JSON.stringify(PROFILE_KEY));
  expect(BOOT_SCRIPT).toContain(JSON.stringify(THEME_STORAGE_KEY));
});
