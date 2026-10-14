import { describe, expect, it } from 'vitest';
import { formatPlayTime, formatSavedAt, formatTenths } from './format';

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

  it("writes the date the way the player's language does, the time on a 24-hour clock", () => {
    expect(formatSavedAt(savedAt, 'ru')).toBe('12.10.2026 · 18:57');
    expect(formatSavedAt(savedAt, 'en')).toBe('10/12/2026 · 18:57');
  });
});

describe('formatTenths', () => {
  it("keeps one decimal, with the player's language's separator", () => {
    expect(formatTenths(2, 'ru')).toBe('2,0');
    expect(formatTenths(0.5, 'en')).toBe('0.5');
  });
});
