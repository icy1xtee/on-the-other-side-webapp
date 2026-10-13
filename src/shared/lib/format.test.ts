import { describe, expect, it } from 'vitest';
import { formatPlayTime, formatSavedAt } from './format';

describe('formatPlayTime', () => {
  it('reads as a clock, seconds rounded down', () => {
    expect(formatPlayTime(0)).toBe('00:00:00');
    expect(formatPlayTime(751_999)).toBe('00:12:31');
    expect(formatPlayTime(9_678_000)).toBe('02:41:18');
  });

  it('lets the hours run past a day', () => {
    expect(formatPlayTime(100 * 3_600_000 + 61_000)).toBe('100:01:01');
  });
});

describe('formatSavedAt', () => {
  // Local time: the player sees the date where they are.
  const savedAt = new Date(2026, 9, 12, 18, 57).getTime();

  it("writes the date and time the way the player's language does", () => {
    expect(formatSavedAt(savedAt, 'ru')).toBe('12.10.2026 · 18:57');
    expect(formatSavedAt(savedAt, 'en')).toMatch(/^10\/12\/2026 · 0?6:57\sPM$/);
  });
});
