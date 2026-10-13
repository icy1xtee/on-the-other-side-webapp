import { expect, test } from '@playwright/test';
import { advanceUntil, demo, line, startNewGame } from './game';

test('Continue after a reload comes back to the same line', async ({ page }) => {
  await startNewGame(page);
  await advanceUntil(page, line(page, demo.laterLine));

  await page.reload();
  const card = page.getByRole('button', { name: /Продолжить/ });
  await card.click();

  await expect(card).toBeHidden();
  await expect(line(page, demo.laterLine)).toBeVisible();
});
