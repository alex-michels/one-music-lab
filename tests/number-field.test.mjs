/** @vitest-environment jsdom */
import { test } from 'vitest';
import assert from 'node:assert/strict';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { NumberField } from '../components/number-field.tsx';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/** Mounts an element and exposes the input, a rerender and an unmount. */
function mount(element) {
  const container = document.createElement('div');
  document.body.append(container);
  let root;
  act(() => {
    root = createRoot(container);
    root.render(element);
  });
  return {
    get input() {
      const input = container.querySelector('input');
      assert.ok(input, 'the field renders an input');
      return input;
    },
    rerender(next) {
      void act(() => root.render(next));
    },
    unmount() {
      void act(() => root.unmount());
      container.remove();
    },
  };
}

/**
 * Types the way a browser does. React remembers the value it last wrote, so a
 * plain assignment would look like no change and no change event would run;
 * setting through the prototype is what the browser itself does.
 */
function type(input, value) {
  act(() => {
    Reflect.set(HTMLInputElement.prototype, 'value', value, input);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function focus(input) {
  void act(() => input.focus());
}

function blur(input) {
  void act(() => input.blur());
}

const field = (value, onValue, extra = {}) =>
  createElement(NumberField, {
    value,
    onValue,
    min: 20,
    max: 20000,
    'aria-label': 'Frequency in hertz',
    ...extra,
  });

test('The field renders a bounded number input carrying the caller props', () => {
  const view = mount(field(440, () => {}, { id: 'frequency', step: '0.01' }));
  const input = view.input;
  assert.equal(input.type, 'number');
  assert.equal(input.min, '20');
  assert.equal(input.max, '20000');
  assert.equal(input.value, '440');
  assert.equal(input.id, 'frequency');
  assert.equal(input.step, '0.01');
  assert.equal(input.getAttribute('aria-label'), 'Frequency in hertz');
  view.unmount();
});

test('A value inside the range is reported while typing', () => {
  const seen = [];
  const view = mount(field(440, (n) => seen.push(n)));
  focus(view.input);
  type(view.input, '441');
  assert.deepEqual(seen, [441]);
  assert.equal(view.input.value, '441');
  view.unmount();
});

test('Out-of-range and unparsable drafts are shown but never reported', () => {
  const seen = [];
  const view = mount(field(440, (n) => seen.push(n)));
  focus(view.input);
  for (const draft of ['19', '20001', '']) {
    type(view.input, draft);
    assert.equal(view.input.value, draft, `draft ${JSON.stringify(draft)}`);
  }
  for (const draft of ['-', 'abc']) {
    type(view.input, draft);
    assert.equal(
      view.input.value,
      '',
      `a number input discards ${JSON.stringify(draft)}`,
    );
  }
  assert.deepEqual(seen, [], 'nothing outside the range reaches the caller');

  type(view.input, '20');
  type(view.input, '20000');
  assert.deepEqual(seen, [20, 20000], 'the boundaries themselves are valid');
  view.unmount();
});

test('Leaving the field clamps the draft into the range', () => {
  for (const [draft, expected] of [
    ['19', 20],
    ['0', 20],
    ['-5', 20],
    ['20001', 20000],
    ['1e9', 20000],
    ['523.2511', 523.2511],
  ]) {
    const seen = [];
    const view = mount(field(440, (n) => seen.push(n)));
    focus(view.input);
    type(view.input, draft);
    blur(view.input);
    assert.equal(seen.at(-1), expected, `draft ${draft}`);
    assert.equal(view.input.value, String(expected), `display ${draft}`);
    view.unmount();
  }
});

test('Leaving an empty or unusable field restores the current value', () => {
  for (const draft of ['', '   ', 'abc']) {
    const seen = [];
    const view = mount(field(440, (n) => seen.push(n)));
    focus(view.input);
    type(view.input, draft);
    blur(view.input);
    assert.deepEqual(seen, [440], `draft ${JSON.stringify(draft)}`);
    assert.equal(view.input.value, '440');
    view.unmount();
  }
});

test('Enter commits the draft by leaving the field', () => {
  const seen = [];
  const view = mount(field(440, (n) => seen.push(n)));
  const input = view.input;
  focus(input);
  type(input, '19');
  assert.equal(document.activeElement, input, 'the field holds focus');
  act(() => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
  });
  assert.equal(document.activeElement, document.body, 'the field is left');
  assert.deepEqual(seen, [20], 'the value is clamped on the way out');
  view.unmount();
});

test('An external value replaces the display only while the field is idle', () => {
  const view = mount(field(440, () => {}));
  view.rerender(field(523.25113, () => {}));
  assert.equal(view.input.value, '523.2511', 'idle fields follow the value');

  focus(view.input);
  type(view.input, '44');
  view.rerender(field(880, () => {}));
  assert.equal(view.input.value, '44', 'typing is never overwritten');

  blur(view.input);
  view.rerender(field(880, () => {}));
  assert.equal(
    view.input.value,
    '44',
    'leaving keeps what the field reported; an unchanged value is not re-applied',
  );

  view.rerender(field(990, () => {}));
  assert.equal(view.input.value, '990', 'a later value applies again');
  view.unmount();
});
