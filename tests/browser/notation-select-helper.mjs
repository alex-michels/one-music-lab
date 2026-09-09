import { expect } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { act } from 'react';

export async function openNotationChoice(label) {
  const control = page.getByRole('combobox', { name: label, exact: true });
  await act(async () => {
    control.element().focus();
    // ArrowDown opens a combobox without also activating a focused option.
    await userEvent.keyboard('{ArrowDown}');
  });
  await expect
    .poll(() => control.element().getAttribute('aria-expanded'))
    .toBe('true');
  return control;
}

export async function chooseNotation(label, option) {
  const control = await openNotationChoice(label);
  const popup = document.getElementById(
    control.element().getAttribute('aria-controls'),
  );
  await act(async () =>
    page.getByRole('option', { name: option, exact: true }).click(),
  );
  await expect
    .poll(() => control.element().getAttribute('aria-expanded'))
    .toBe('false');
  await expect.element(page.elementLocator(popup)).not.toBeVisible();
  // A fading popup can already be invisible while its focus manager is still
  // mounted. Wait for Base UI's actual hidden/unmounted state before opening
  // another control, so a late focus restoration cannot steal that keypress.
  await expect
    .poll(() => !popup.isConnected || Boolean(popup.closest('[hidden]')))
    .toBe(true);
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
  const popup = document.getElementById(
    control.element().getAttribute('aria-controls'),
  );
  await act(() => userEvent.keyboard('{Escape}'));
  await expect
    .poll(() => control.element().getAttribute('aria-expanded'))
    .toBe('false');
  await expect.element(page.elementLocator(popup)).not.toBeVisible();
  await expect
    .poll(() => !popup.isConnected || Boolean(popup.closest('[hidden]')))
    .toBe(true);
  await expect.poll(() => document.activeElement).toBe(control.element());
}
