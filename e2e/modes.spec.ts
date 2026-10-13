import { expect, test, type Page } from '@playwright/test';
import { advanceUntil, demo, line, startNewGame } from './game';

/** Plays up to the choice and through it, then starts over: everything before it is read now. */
async function readOnceAndStartOver(page: Page) {
  await startNewGame(page);
  const option = page.getByRole('button', { name: demo.choice.options[0] });
  await advanceUntil(page, option);
  await option.click();
  await expect(line(page, demo.choice.branches[0])).toBeVisible();

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Главное меню' }).click();
  await page.getByRole('button', { name: 'Новая игра' }).click();
  await page.getByRole('button', { name: 'Начать' }).click();
  await expect(line(page, demo.firstLine)).toBeVisible();
}

test('Tab skips what was read on a second pass and stops at the choice', async ({ page }) => {
  await readOnceAndStartOver(page);

  await page.keyboard.press('Tab');
  // The prompt was read too: the options are out, and Skip has stopped.
  await expect(page.getByRole('button', { name: demo.choice.options[0] })).toBeVisible();
  await expect(page.getByText('SKIP ▸▸')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Пропуск' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});

test('held Ctrl skips what was read, and only while it is held', async ({ page }) => {
  await readOnceAndStartOver(page);

  await page.keyboard.down('Control');
  await expect(page.getByText('SKIP ▸▸')).toBeVisible();
  await expect(page.getByRole('button', { name: demo.choice.options[0] })).toBeVisible();
  await page.keyboard.up('Control');
  await expect(page.getByText('SKIP ▸▸')).toBeHidden();
});

test('Auto turns the pages by itself, waits at the choice and goes on after it', async ({
  page,
}) => {
  await startNewGame(page, { autoDelay: 0.5 });
  await advanceUntil(page, line(page, demo.beforeChoice));

  const auto = page.getByRole('button', { name: 'Авто' });
  await auto.click();
  await expect(auto).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('AUTO ▸')).toBeVisible();

  // The prompt comes and is read by itself; the pick is the player's.
  const option = page.getByRole('button', { name: demo.choice.options[1] });
  await expect(option).toBeVisible();
  await page.waitForTimeout(2_000);
  await expect(option).toBeVisible();

  await option.click();
  await expect(line(page, demo.choice.branches[1])).toBeVisible();
  await expect(line(page, demo.choice.branchesNext[1])).toBeVisible();
  await expect(auto).toHaveAttribute('aria-pressed', 'true');
});
