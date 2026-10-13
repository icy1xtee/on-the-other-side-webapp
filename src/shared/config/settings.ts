/** The dialogue text's size: the design's S / M / L. */
export const TEXT_SIZES = ['small', 'normal', 'large'] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

/** How opaque the dialogue panel may get: below this the scene shows through the text. */
export const MIN_WINDOW_OPACITY = 0.4;

/** "Задержка автоперехода": the pause Auto makes after a line is out, in seconds (the design's). */
export const AUTO_DELAY = { min: 0.5, max: 6, step: 0.5 } as const;

/** What Skip passes: only the lines read before (Ren'Py's default), or everything. */
export const SKIP_MODES = ['read', 'all'] as const;
export type SkipMode = (typeof SKIP_MODES)[number];
