import { describe, expect, it } from 'vitest';
import { getStageScale } from '@/shared/lib/stageScale';

describe('getStageScale', () => {
  it('is 1 when the viewport matches the stage', () => {
    expect(getStageScale(1920, 1080)).toBe(1);
  });

  it('fits by height on a wider viewport, leaving bars on the sides', () => {
    expect(getStageScale(2560, 1080)).toBe(1);
  });

  it('fits by width on a taller viewport, leaving bars on top and bottom', () => {
    expect(getStageScale(1280, 1024)).toBeCloseTo(2 / 3);
  });
});
