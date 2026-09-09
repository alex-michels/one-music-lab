import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '../../app/(root)/page.tsx';
import '../../app/globals.css';
import {
  LANGUAGE_STORAGE_KEY,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_STORAGE_KEY,
} from '../../lib/client-store.ts';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
function mount() {
  container = document.createElement('div');
  document.body.append(container);
  act(() => {
    root = createRoot(container);
    root.render(createElement(Home));
  });
}
// The browser page keeps whatever viewport the previous file left. Below
// 768px the panel is a sheet with no resize handle and no visible labels, so
// each test states the width it needs instead of inheriting one.
beforeEach(async () => {
  await page.viewport(1280, 900);
});
afterEach(async () => {
  if (root) void act(() => root.unmount());
  root = null;
  container?.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  // These outlive the iframe a test file runs in. Leaving a saved language or
  // width behind would decide how an unrelated file's first render looks.
  localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  localStorage.removeItem(SIDEBAR_WIDTH_STORAGE_KEY);
  await page.viewport(1280, 900);
});

const click = (name) =>
  act(async () => {
    await page.getByRole('button', { name, exact: true }).click();
  });
const wrapper = () => container.querySelector('[data-slot="sidebar-wrapper"]');
const width = () =>
  Number.parseInt(
    getComputedStyle(wrapper()).getPropertyValue('--sidebar-width'),
    10,
  );
const handle = () => container.querySelector('.sidebar-resizer');
const navLabel = (name) =>
  [...container.querySelectorAll('.nav-item > span')].find(
    (span) => span.textContent === name,
  );
const pointer = {
  bubbles: true,
  cancelable: true,
  pointerId: 1,
  pointerType: 'mouse',
  isPrimary: true,
};
// A synthetic pointer id is one no browser issued, so // rejects it in Firefox. The handle must survive that, which is the point of
// dispatching these events rather than asking the driver to move a mouse.
function drag(to, { release = true } = {}) {
  act(() => {
    handle().dispatchEvent(
      new PointerEvent('pointerdown', { ...pointer, buttons: 1, clientX: 232 }),
    );
    handle().dispatchEvent(
      new PointerEvent('pointermove', { ...pointer, buttons: 1, clientX: to }),
    );
    if (release)
      handle().dispatchEvent(
        new PointerEvent('pointerup', { ...pointer, clientX: to }),
      );
  });
}
const press = (key, shiftKey = false) =>
  act(() => {
    handle().dispatchEvent(
      new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }),
    );
  });
const reset = () =>
  act(() => {
    handle().dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
  });

test('A translated navigation label wraps instead of being cut off', async () => {
  mount();
  await click('RU');
  const label = navLabel('Лаборатория аккордов');
  expect(label).toBeTruthy();
  // `truncate` on the shadcn menu button would hide the second word behind an
  // ellipsis; nothing here may overflow its own box at the default width.
  expect(getComputedStyle(label).whiteSpace).toBe('normal');
  expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1);
  expect(label.getBoundingClientRect().height).toBeGreaterThan(
    navLabel('Практика').getBoundingClientRect().height,
  );
  // Two lines of text still have to fit inside the button that draws them.
  const item = label.closest('.nav-item');
  expect(item.scrollHeight).toBeLessThanOrEqual(item.clientHeight + 1);
  await click('EN');
  expect(navLabel('Chords lab')).toBeTruthy();
});

test('The navigation panel can be resized by pointer and by keyboard, within bounds', async () => {
  mount();
  reset();
  expect(width()).toBe(SIDEBAR_WIDTH.preferred);

  drag(330, { release: false });
  expect(width()).toBe(330);
  // Releasing ends the drag: a later move must not keep resizing the panel.
  act(() => {
    handle().dispatchEvent(
      new PointerEvent('pointerup', { ...pointer, clientX: 330 }),
    );
    handle().dispatchEvent(
      new PointerEvent('pointermove', { ...pointer, clientX: 400 }),
    );
  });
  expect(width()).toBe(330);

  press('ArrowLeft');
  expect(width()).toBe(322);
  press('ArrowRight', true);
  expect(width()).toBe(354);
  // Keys the handle does not use are left to the browser.
  press('ArrowUp');
  expect(width()).toBe(354);
  press('Home');
  expect(width()).toBe(SIDEBAR_WIDTH.preferred);

  // The panel cannot be dragged into uselessness in either direction.
  drag(20);
  expect(width()).toBe(SIDEBAR_WIDTH.min);
  drag(2000);
  expect(width()).toBe(SIDEBAR_WIDTH.max);
  expect(localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY)).toBe(
    String(SIDEBAR_WIDTH.max),
  );
  reset();
  expect(width()).toBe(SIDEBAR_WIDTH.preferred);
});

test('The resize handle is reachable by keyboard and absent on a phone', async () => {
  mount();
  await click('EN');
  expect(handle().tabIndex).toBe(0);
  expect(handle().getAttribute('aria-label')).toContain('arrow keys');
  handle().focus();
  expect(document.activeElement).toBe(handle());

  await page.viewport(390, 844);
  // Below the breakpoint the panel is a sheet with no edge to drag, so the
  // handle leaves the tab order and the accessibility tree entirely.
  await expect
    .poll(
      () => handle() === null || getComputedStyle(handle()).display === 'none',
    )
    .toBe(true);
});

test('The language control offers three buttons and no punctuation', async () => {
  mount();
  const group = container.querySelector('.language-switch');
  const buttons = [...group.querySelectorAll('button')];
  expect(buttons.map((button) => button.textContent)).toEqual([
    'EN',
    'RU',
    'DE',
  ]);
  // Each label is a code written in the language it selects, so it carries
  // that language instead of being pronounced as English.
  expect(buttons.map((button) => button.lang)).toEqual(['en', 'ru', 'de']);
  // Nothing here submits anything, and `submit` is what a button without a
  // type defaults to should this ever sit inside a form.
  expect(buttons.map((button) => button.type)).toEqual([
    'button',
    'button',
    'button',
  ]);
  // What assistive technology is actually offered: the slashes separate the
  // three labels visually and must not be read out between them.
  const exposed = group.cloneNode(true);
  for (const hidden of exposed.querySelectorAll('[aria-hidden="true"]'))
    hidden.remove();
  expect(exposed.textContent.replace(/\s+/g, '')).toBe('ENRUDE');
});
