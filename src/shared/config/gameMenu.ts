/**
 * The parts of the game menu — Ren'Py's game menu screens. Only the settings so far: the
 * history comes with rollback, saving and loading with the save slots.
 */
export const MENU_SECTIONS = ['settings'] as const;

export type MenuSection = (typeof MENU_SECTIONS)[number];
