import { expect, test } from '@playwright/test';
import { advanceUntil, demo, line, startNewGame } from './game';

test('a slot keeps the game: saved, a new game started, loaded back with its history', async ({
  page,
}) => {
  await startNewGame(page);
  await advanceUntil(page, line(page, demo.laterLine));

  await page.getByRole('button', { name: 'Сохранить' }).click();
  const menu = page.getByRole('dialog');
  await expect(menu.getByRole('heading', { name: 'Сохранение' })).toBeVisible();
  await menu.getByRole('button', { name: 'Сохранить в слот 1' }).click();
  await expect(page.getByRole('status')).toHaveText('Сохранено в слот 1');
  await expect(menu.getByRole('button', { name: /^Перезаписать слот 1/ })).toBeVisible();

  // Another game over it: the slot outlives it.
  await menu.getByRole('button', { name: 'Главное меню' }).click();
  await page.getByRole('button', { name: 'Новая игра' }).click();
  await page.getByRole('button', { name: 'Начать' }).click();
  await expect(line(page, demo.firstLine)).toBeVisible();

  // In the game, loading asks first.
  await page.getByRole('button', { name: 'Загрузить' }).click();
  await menu.getByRole('button', { name: /^Загрузить слот 1/ }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Загрузить' }).click();
  await expect(menu).toBeHidden();
  await expect(line(page, demo.laterLine)).toBeVisible();

  // The history came back with it, and so did the way back.
  await page.getByRole('button', { name: 'История' }).click();
  await expect(menu.getByText(demo.firstLine)).toBeVisible();
  await page.keyboard.press('Escape');
  await page.keyboard.press('PageUp');
  await expect(line(page, demo.laterLine)).toBeHidden();
});

test('from the main menu a slot loads at once, after a reload too', async ({ page }) => {
  await startNewGame(page);
  await advanceUntil(page, line(page, demo.laterLine));
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').getByRole('button', { name: 'Сохранить в слот 4' }).click();

  await page.reload();
  await page.getByRole('button', { name: 'Загрузить' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: /^Загрузить слот 4/ })
    .click();
  await expect(line(page, demo.laterLine)).toBeVisible();
});

test('a slot in use asks before it is overwritten or deleted', async ({ page }) => {
  await startNewGame(page);
  await page.keyboard.press('Escape');
  const menu = page.getByRole('dialog');
  const question = page.getByRole('alertdialog');
  await menu.getByRole('button', { name: 'Сохранить в слот 2' }).click();

  await menu.getByRole('button', { name: /^Перезаписать слот 2/ }).click();
  await expect(question.getByRole('heading', { name: 'Перезаписать слот 2?' })).toBeVisible();
  await question.getByRole('button', { name: 'Перезаписать' }).click();
  await expect(question).toBeHidden();

  // The bin comes out over the slot under the pointer.
  await menu.getByRole('button', { name: /^Перезаписать слот 2/ }).hover();
  await menu.getByRole('button', { name: 'Удалить сохранение' }).click();
  await expect(question.getByText('Слот 2 станет пустым. Это нельзя отменить.')).toBeVisible();
  await question.getByRole('button', { name: 'Удалить' }).click();
  await expect(menu.getByRole('button', { name: 'Сохранить в слот 2' })).toBeVisible();
});
