import { expect, test } from '@playwright/test';
import { advanceUntil, demo, line, startNewGame } from './game';

test('rollback brings the choice back to pick again; forward goes the way taken', async ({
  page,
}) => {
  await startNewGame(page);
  const first = page.getByRole('button', { name: demo.choice.options[0] });
  await advanceUntil(page, first);
  await first.click();
  await expect(line(page, demo.choice.branches[0])).toBeVisible();

  // The wheel up: back to the choice, its options out again.
  await page.mouse.move(640, 300);
  await page.mouse.wheel(0, -100);
  await expect(first).toBeVisible();

  // PageDown: forward with the pick made before.
  await page.keyboard.press('PageDown');
  await expect(line(page, demo.choice.branches[0])).toBeVisible();

  // «Назад», and another pick: a way with nothing ahead of it yet.
  await page.getByRole('button', { name: 'Назад' }).click();
  await page.getByRole('button', { name: demo.choice.options[1] }).click();
  await expect(line(page, demo.choice.branches[1])).toBeVisible();
  await page.keyboard.press('PageDown');
  await expect(line(page, demo.choice.branches[1])).toBeVisible();
});

test('History lists the lines read and the choice made, and loses what is rolled back', async ({
  page,
}) => {
  await startNewGame(page);
  const option = page.getByRole('button', { name: demo.choice.options[2] });
  await advanceUntil(page, option);
  await option.click();
  await expect(line(page, demo.choice.branches[2])).toBeVisible();

  const history = page.getByRole('button', { name: 'История' });
  const menu = page.getByRole('dialog');
  const choice = menu.getByText(`→ ${demo.choice.options[2]}`);
  await history.click();
  await expect(menu.getByText(demo.firstLine)).toBeVisible();
  await expect(choice).toBeVisible();
  await expect(menu.getByText(demo.choice.branches[2])).toBeVisible();

  await page.keyboard.press('Escape');
  await page.keyboard.press('PageUp');
  await history.click();
  await expect(menu.getByText(demo.choice.prompt)).toBeVisible();
  await expect(choice).toHaveCount(0);
});
