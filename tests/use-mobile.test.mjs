import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { mobileViewport, useIsMobile } from '../hooks/use-mobile.ts';

function Probe() {
  return createElement('span', null, String(useIsMobile()));
}

test('Server rendering reports a desktop viewport without touching window', () => {
  assert.equal(typeof globalThis.window, 'undefined');
  assert.equal(renderToString(createElement(Probe)), '<span>false</span>');
  assert.equal(mobileViewport.getServerSnapshot(), false);
});

test('The viewport snapshot follows the window width around the 768px breakpoint', () => {
  const previous = globalThis.window;
  try {
    for (const [width, expected] of [
      [320, true],
      [767, true],
      [768, false],
      [1440, false],
    ]) {
      globalThis.window = { innerWidth: width };
      assert.equal(mobileViewport.getSnapshot(), expected, `${width}px`);
    }
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});

test('Subscribing listens to the media query and cleanup removes the listener', () => {
  const previous = globalThis.window;
  const listeners = new Set();
  const queries = [];
  try {
    globalThis.window = {
      innerWidth: 500,
      matchMedia(query) {
        queries.push(query);
        return {
          addEventListener(type, listener) {
            assert.equal(type, 'change');
            listeners.add(listener);
          },
          removeEventListener(type, listener) {
            assert.equal(type, 'change');
            listeners.delete(listener);
          },
        };
      },
    };
    let notified = 0;
    const unsubscribe = mobileViewport.subscribe(() => {
      notified += 1;
    });
    assert.deepEqual(queries, ['(max-width: 767px)']);
    assert.equal(listeners.size, 1);
    for (const listener of listeners) listener();
    assert.equal(notified, 1);
    unsubscribe();
    assert.equal(listeners.size, 0);
  } finally {
    if (previous === undefined) delete globalThis.window;
    else globalThis.window = previous;
  }
});
