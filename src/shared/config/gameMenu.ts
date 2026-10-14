/**
 * The parts of the game menu — Ren'Py's game menu screens — in the rail's order. Saving and
 * loading come with the save slots (stage 4), before these two.
 */
export const MENU_SECTIONS = ['history', 'settings'] as const;

export type MenuSection = (typeof MENU_SECTIONS)[number];
