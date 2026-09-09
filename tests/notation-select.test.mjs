/** @vitest-environment jsdom */
import { afterEach, expect, test, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { NotationSelect } from '../components/notation-select.tsx';

// Observe the real primitive's callback contract; actual popup interactions
// are tested in all three browser engines, not simulated in jsdom.
let primitiveChange;
vi.mock('../components/ui/select', async (original) => {
  const actual = await original();
  return {
    ...actual,
    Select: (props) => {
      primitiveChange = props.onValueChange;
      return createElement(actual.Select, props);
    },
  };
});
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
afterEach(async () => {
  if (root) await act(() => root.unmount());
  container?.remove();
});

test('A required musical choice rejects the nullable primitive result and keeps its labelled value', async () => {
  const onChange = vi.fn();
  container = document.body.appendChild(document.createElement('div'));
  root = createRoot(container);
  await act(() =>
    root.render(
      createElement(NotationSelect, {
        label: 'Ключ',
        value: 'treble',
        onChange,
        options: [
          { value: 'treble', label: 'Скрипичный' },
          { value: 'bass', label: 'Басовый' },
        ],
      }),
    ),
  );
  const trigger = container.querySelector('[role="combobox"]');
  expect(container.querySelector('label').htmlFor).toBe(trigger.id);
  await act(() => primitiveChange(null));
  expect(onChange).not.toHaveBeenCalled();
  expect(trigger.querySelector('[data-slot="select-value"]').textContent).toBe(
    'Скрипичный',
  );
  await act(() => primitiveChange('bass'));
  expect(onChange).toHaveBeenCalledExactlyOnceWith('bass');
});
