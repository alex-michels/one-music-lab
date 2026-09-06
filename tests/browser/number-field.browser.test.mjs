import { expect, test } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { NumberField } from '../../components/number-field.tsx';

// The same component is covered in jsdom; this runs it in Chromium, Firefox
// and WebKit, where a number input's own sanitising and focus handling are the
// browser's, not a simulation of it.

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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
      return container.querySelector('input');
    },
    unmount() {
      void act(() => root.unmount());
      container.remove();
    },
  };
}

function type(input, value) {
  act(() => {
    Reflect.set(HTMLInputElement.prototype, 'value', value, input);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

const field = (value, onValue) =>
  createElement(NumberField, {
    value,
    onValue,
    min: 20,
    max: 20000,
    'aria-label': 'Frequency in hertz',
  });

test('The field is a real number input the browser accepts', () => {
  const view = mount(field(440, () => {}));
  const input = view.input;
  expect(input.type).toBe('number');
  expect(input.min).toBe('20');
  expect(input.max).toBe('20000');
  expect(input.value).toBe('440');
  expect(input.checkValidity()).toBe(true);
  view.unmount();
});

test('A frequency typed inside the range reaches the caller', () => {
  const seen = [];
  const view = mount(field(440, (n) => seen.push(n)));
  act(() => view.input.focus());
  type(view.input, '441');
  expect(seen).toEqual([441]);
  view.unmount();
});

test('The browser itself refuses text in a number field', () => {
  const seen = [];
  const view = mount(field(440, (n) => seen.push(n)));
  act(() => view.input.focus());
  type(view.input, 'abc');
  // Every engine discards a non-numeric value here; the component must not
  // depend on seeing it, and nothing is reported to the caller.
  expect(view.input.value).toBe('');
  expect(seen).toEqual([]);
  view.unmount();
});

test('Leaving the field clamps an out-of-range frequency', () => {
  const seen = [];
  const view = mount(field(440, (n) => seen.push(n)));
  act(() => view.input.focus());
  type(view.input, '19');
  act(() => view.input.blur());
  expect(seen.at(-1)).toBe(20);
  expect(view.input.value).toBe('20');
  view.unmount();
});

test('Enter leaves the field and commits the frequency', () => {
  const seen = [];
  const view = mount(field(440, (n) => seen.push(n)));
  const input = view.input;
  act(() => input.focus());
  type(input, '99999');
  expect(document.activeElement).toBe(input);
  act(() => {
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
  });
  expect(document.activeElement).not.toBe(input);
  expect(seen.at(-1)).toBe(20000);
  view.unmount();
});
