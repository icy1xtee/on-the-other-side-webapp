import {
  DESIGN_HEIGHT,
  DESIGN_WIDTH,
  MIN_UI_SCALE,
  PORTRAIT_HINT_MAX_WIDTH,
} from '@/shared/config/design';

/**
 * How much larger than the design every size is drawn. Fits the design size into the window
 * (the smaller ratio wins, so nothing overflows on wide or tall screens); never below the
 * readable minimum. The layout itself is fluid: this only scales sizes, there are no bars.
 */
export function getUiScale(width: number, height: number): number {
  return Math.max(MIN_UI_SCALE, Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT));
}

/** A phone held upright: the game is made for landscape, so it asks to turn the device. */
export function needsLandscape(width: number, height: number): boolean {
  return height > width && width < PORTRAIT_HINT_MAX_WIDTH;
}
