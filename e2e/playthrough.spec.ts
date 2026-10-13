import { expect, test } from '@playwright/test';
import { advanceUntil, demo, startNewGame } from './game';

test('a new game plays to its end and comes back to the main menu', async ({ page }) => {
  await startNewGame(page);

  const option = page.getByRole('button', { name: demo.choice.options[0] });
  await advanceUntil(page, option);
  await option.click();

  await advanceUntil(page, page.getByRole('button', { name: 'Новая игра' }));
  // The playthrough is over: there is nothing left to continue.
  await expect(page.getByRole('button', { name: /Продолжить/ })).toHaveCount(0);
});
