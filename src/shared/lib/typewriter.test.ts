import { describe, expect, it } from 'vitest';
import { revealedChars } from '@/shared/lib/typewriter';

describe('revealedChars', () => {
  it('reveals characters at the given speed', () => {
    expect(revealedChars(0, 40, 100)).toBe(0);
    expect(revealedChars(500, 40, 100)).toBe(20);
    expect(revealedChars(1010, 40, 100)).toBe(40);
  });

  it('never goes past the end of the line', () => {
    expect(revealedChars(60_000, 40, 12)).toBe(12);
  });

  it('shows the whole line at once at speed 0', () => {
    expect(revealedChars(0, 0, 12)).toBe(12);
  });
});
