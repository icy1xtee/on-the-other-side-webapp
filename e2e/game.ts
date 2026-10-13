// What the smoke tests share: the demo's text they look for and the way they play.

import { expect, type Locator, type Page } from '@playwright/test';

/** The demo's text the tests rely on — the one place to update when the demo changes. */
export const demo = {
  firstLine: 'Дождь не прекращается с вечера. Комнату освещают только мониторы.',
  /** A few lines in: somewhere for Continue to come back to. */
  laterLine: 'А мне здесь нравится. Даже тишина какая-то своя.',
  /** The last line before the choice. */
  beforeChoice: 'С другой стороны чего?..',
  choice: {
    prompt: 'Он ждёт ответа. Что будем делать?',
    options: ['Открыть дверь', 'Спросить, кто там', 'Промолчать'],
    /** The first line of each option's branch, in the same order. */
    branches: [
      'За дверью никого. Только мокрые следы на полу — они ведут к лестнице.',
      'Кто вы? Назовитесь.',
      'Мы не отвечаем. Только дождь и тиканье часов.',
    ],
    /** And the second. */
    branchesNext: [
      'Эй! Есть тут кто-нибудь?',
      'Ты меня знаешь, Мила. Просто давно не слышала.',
      'Я подожду внизу. Как всегда.',
    ],
  },
} as const;

/**
 * Opens the main menu with these settings stored first — lines shown at once unless they say
 * otherwise, so the tests don't wait for the typewriter.
 */
export async function openMenu(page: Page, settings: Record<string, unknown> = {}) {
  // Runs before every load, reloads included; the settings are all the tests change.
  await page.addInitScript(
    (stored) => {
      localStorage.setItem('ots:settings', JSON.stringify(stored));
    },
    { textCps: 0, ...settings },
  );
  await page.goto('/');
}

/** From a fresh browser: the menu, "Новая игра", the first line. */
export async function startNewGame(page: Page, settings: Record<string, unknown> = {}) {
  await openMenu(page, settings);
  await page.getByRole('button', { name: 'Новая игра' }).click();
  await expect(line(page, demo.firstLine)).toBeVisible();
}

/**
 * A line of text on screen. The panel also holds each line whole and invisible, to keep its size
 * while the text types out (DialogueBox), so only the visible copy counts.
 */
export function line(page: Page, text: string): Locator {
  return page.getByText(text, { exact: true }).filter({ visible: true });
}

/** Presses Space, as a reader does, until `target` shows up. */
export async function advanceUntil(page: Page, target: Locator, limit = 60) {
  for (let presses = 0; presses < limit; presses += 1) {
    if (await target.isVisible()) {
      return;
    }
    await page.keyboard.press('Space');
  }
  await expect(target, `still not on screen after ${limit} presses`).toBeVisible();
}
