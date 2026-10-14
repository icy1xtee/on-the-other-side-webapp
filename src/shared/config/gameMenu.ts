/**
 * The parts of the game menu — Ren'Py's game menu screens — in the rail's order. «Управление» is
 * Ren'Py's help screen.
 */
export const MENU_SECTIONS = ['save', 'load', 'history', 'settings', 'controls'] as const;

export type MenuSection = (typeof MENU_SECTIONS)[number];
