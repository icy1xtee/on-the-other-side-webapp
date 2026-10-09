import { describe, expect, it } from 'vitest';
import { getUiScale, needsLandscape } from '@/shared/lib/uiScale';

describe('getUiScale', () => {
  it('is 1 at the design size and 1.5 at Full HD', () => {
    expect(getUiScale(1280, 720)).toBe(1);
    expect(getUiScale(1920, 1080)).toBe(1.5);
  });

  it('follows the tighter side on wide and tall windows', () => {
    expect(getUiScale(2560, 1080)).toBe(1.5);
    expect(getUiScale(1024, 1024)).toBe(0.8);
  });

  it('never drops below the readable minimum on small screens', () => {
    expect(getUiScale(844, 390)).toBe(0.75);
  });
});

describe('needsLandscape', () => {
  it('asks to turn a phone held upright', () => {
    expect(needsLandscape(390, 844)).toBe(true);
  });

  it('accepts a phone on its side and a tablet held upright', () => {
    expect(needsLandscape(844, 390)).toBe(false);
    expect(needsLandscape(768, 1024)).toBe(false);
  });
});
