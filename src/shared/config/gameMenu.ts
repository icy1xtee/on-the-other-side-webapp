/** The parts of the game menu — Ren'Py's game menu screens — in the rail's order. */
export const MENU_SECTIONS = ['save', 'load', 'history', 'settings'] as const;

export type MenuSection = (typeof MENU_SECTIONS)[number];
