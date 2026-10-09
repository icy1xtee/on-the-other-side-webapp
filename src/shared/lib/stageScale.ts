import { STAGE_HEIGHT, STAGE_WIDTH } from '@/shared/config/stage';

/** Scale that fits the whole stage into the viewport; the leftover space is letterbox. */
export function getStageScale(viewportWidth: number, viewportHeight: number): number {
  return Math.min(viewportWidth / STAGE_WIDTH, viewportHeight / STAGE_HEIGHT);
}

export type StageFit = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

/**
 * Scale plus the offset that centres the stage. Offsets are snapped to whole device pixels:
 * a fractional translate blurs text once the browser composites it.
 */
export function fitStage(
  viewportWidth: number,
  viewportHeight: number,
  devicePixelRatio = 1,
): StageFit {
  const scale = getStageScale(viewportWidth, viewportHeight);
  const snap = (value: number) => Math.round(value * devicePixelRatio) / devicePixelRatio;

  return {
    scale,
    offsetX: snap((viewportWidth - STAGE_WIDTH * scale) / 2),
    offsetY: snap((viewportHeight - STAGE_HEIGHT * scale) / 2),
  };
}
