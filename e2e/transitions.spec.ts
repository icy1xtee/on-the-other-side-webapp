import { expect, test, type Page } from '@playwright/test';
import { advanceUntil, demo, line, startNewGame } from './game';

/** Through the door and on to the street, which comes in with `fade` (a second in all). */
async function toTheStreet(page: Page) {
  await startNewGame(page);
  const option = page.getByRole('button', { name: demo.choice.options[0] });
  await advanceUntil(page, option);
  await option.click();
  await advanceUntil(page, line(page, demo.street.before));
  await page.keyboard.press('Space');
}

test("a line waits for the story's transition, and a press cuts it short", async ({ page }) => {
  await toTheStreet(page);
  const street = line(page, demo.street.first);
  await expect(street).toBeHidden();

  // Well before the fade is over: the press brings the line out and does nothing else.
  await page.keyboard.press('Space');
  await expect(street).toBeVisible({ timeout: 500 });
});

test('for a player who asked for less motion, the fade is a short dissolve', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await toTheStreet(page);

  // Out by itself well before a full fade would be over.
  await expect(line(page, demo.street.first)).toBeVisible({ timeout: 700 });
});
