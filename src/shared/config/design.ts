/**
 * The page size the design was drawn for. Sizes in the theme are design px; on screen they are
 * multiplied by the UI scale, so 1920×1080 looks like the design at 1280×720, only larger.
 */
export const DESIGN_WIDTH = 1280;
export const DESIGN_HEIGHT = 720;

/** Below this the text gets unreadable; small screens keep this scale and the layout reflows. */
export const MIN_UI_SCALE = 0.75;

/** Narrower than this and in portrait — a phone held upright: ask to turn it. */
export const PORTRAIT_HINT_MAX_WIDTH = 600;
