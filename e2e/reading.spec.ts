import { expect, test } from '@playwright/test';
import { demo, line, openMenu } from './game';

// The typewriter types in the UI and tells the reading store when a line is out: with the text
// at a speed rather than instant, a press does one thing or the other.

test('a press mid-line shows the line whole; the next one goes on', async ({ page }) => {
  // Slow enough for the first line to be still typing when the key comes.
  await openMenu(page, { textCps: 10 });
  await page.getByRole('button', { name: 'Новая игра' }).click();
  await expect(page.getByRole('toolbar')).toBeVisible();
  const first = line(page, demo.firstLine);

  await page.keyboard.press('Space');
  await expect(first).toBeVisible();

  await page.keyboard.press('Space');
  await expect(first).toBeHidden();
});

test('a line typed out by itself goes on with a single press', async ({ page }) => {
  await openMenu(page, { textCps: 60 });
  await page.getByRole('button', { name: 'Новая игра' }).click();
  const first = line(page, demo.firstLine);
  await expect(first).toBeVisible();

  await page.keyboard.press('Space');
  await expect(first).toBeHidden();
});
