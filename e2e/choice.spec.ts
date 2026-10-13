import { expect, test } from '@playwright/test';
import { advanceUntil, demo, line, startNewGame } from './game';

test('a click on an option leads into its branch', async ({ page }) => {
  await startNewGame(page);

  const option = page.getByRole('button', { name: demo.choice.options[0] });
  await advanceUntil(page, option);
  await option.click();

  await expect(line(page, demo.choice.branches[0])).toBeVisible();
});

test('a digit picks the option in that place, once the prompt is read', async ({ page }) => {
  await startNewGame(page);

  const option = page.getByRole('button', { name: demo.choice.options[1] });
  await advanceUntil(page, line(page, demo.choice.prompt));
  // The prompt is a line like any other: the options come out once it has been read.
  await expect(option).toBeHidden();
  await page.keyboard.press('Space');
  await expect(option).toBeVisible();

  await page.keyboard.press('2');
  await expect(line(page, demo.choice.branches[1])).toBeVisible();
});
