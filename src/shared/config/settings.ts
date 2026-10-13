/** The dialogue text's size: the design's S / M / L. */
export const TEXT_SIZES = ['small', 'normal', 'large'] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

/** How opaque the dialogue panel may get: below this the scene shows through the text. */
export const MIN_WINDOW_OPACITY = 0.4;
