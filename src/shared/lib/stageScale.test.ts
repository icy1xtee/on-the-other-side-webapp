import { describe, expect, it } from 'vitest';
import { fitStage, getStageScale } from '@/shared/lib/stageScale';

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

describe('fitStage', () => {
  it('has no offset when the viewport matches the stage', () => {
    expect(fitStage(1920, 1080)).toEqual({ scale: 1, offsetX: 0, offsetY: 0 });
  });

  it('centres horizontally on a wider viewport', () => {
    expect(fitStage(2560, 1080)).toEqual({ scale: 1, offsetX: 320, offsetY: 0 });
  });

  it('centres vertically on a taller viewport', () => {
    const fit = fitStage(1280, 1024);
    expect(fit.offsetX).toBeCloseTo(0);
    expect(fit.offsetY).toBe(152);
  });

  it('snaps offsets to whole device pixels', () => {
    // 1 px of slack splits into 0.5 CSS px per side.
    expect(fitStage(1921, 1080, 1).offsetX).toBe(1);
    expect(fitStage(1921, 1080, 2).offsetX).toBe(0.5);
    expect(fitStage(1921, 1080, 1.25).offsetX).toBe(0.8);
  });
});
