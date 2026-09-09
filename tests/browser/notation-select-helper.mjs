import { expect } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { act } from 'react';

export async function openNotationChoice(label) {
  const control = page.getByRole('combobox', { name: label, exact: true });
  await act(async () => {
    control.element().focus();
    await userEvent.keyboard('{Enter}');
  });
  await expect
    .poll(() => control.element().getAttribute('aria-expanded'))
    .toBe('true');
  return control;
}

export async function chooseNotation(label, option) {
  const control = await openNotationChoice(label);
  await act(async () =>
    page.getByRole('option', { name: option, exact: true }).click(),
  );
  await expect
    .poll(() => control.element().getAttribute('aria-expanded'))
    .toBe('false');
  // Base UI restores focus after its close transition. Moving focus to the
  // next trigger earlier lets that restoration steal the next keyboard action.
  await expect.poll(() => document.activeElement).toBe(control.element());
  await expect
    .poll(
      () =>
        control.element().querySelector('[data-slot="select-value"]')
          .textContent,
    )
    .toBe(option);
}

export async function closeNotationChoice(control) {
  await act(() => userEvent.keyboard('{Escape}'));
  await expect
    .poll(() => control.element().getAttribute('aria-expanded'))
    .toBe('false');
  await expect.poll(() => document.activeElement).toBe(control.element());
}
