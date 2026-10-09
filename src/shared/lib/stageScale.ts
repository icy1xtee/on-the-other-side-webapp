import { STAGE_HEIGHT, STAGE_WIDTH } from '@/shared/config/stage';

/** Scale that fits the whole stage into the viewport; the leftover space is letterbox. */
export function getStageScale(viewportWidth: number, viewportHeight: number): number {
  return Math.min(viewportWidth / STAGE_WIDTH, viewportHeight / STAGE_HEIGHT);
}
