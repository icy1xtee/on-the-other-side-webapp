import { expect, test } from '@playwright/test';
import { demo, line, openMenu, startNewGame } from './game';

test('F1 opens «Управление» over the game, and keys tried there leave the game alone', async ({
  page,
}) => {
  await startNewGame(page);
  await page.keyboard.press('F1');
  const menu = page.getByRole('dialog');
  await expect(menu.getByRole('heading', { name: 'Управление' })).toBeVisible();
  await expect(menu.getByRole('heading', { name: 'Откат' })).toBeVisible();

  // The game would go on, skip or pick on these; with the window open, none reaches it.
  for (const key of ['Space', 'Enter', 'PageDown', '1', 'Control']) {
    await page.keyboard.press(key);
  }
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(line(page, demo.firstLine)).toBeVisible();
});

test("the main menu offers «Управление» in the game menu's rail", async ({ page }) => {
  await openMenu(page);
  await page.getByRole('button', { name: 'Настройки' }).click();
  const menu = page.getByRole('dialog');
  await menu.getByRole('button', { name: 'Управление' }).click();
  await expect(menu.getByRole('heading', { name: 'Управление' })).toBeVisible();
});
