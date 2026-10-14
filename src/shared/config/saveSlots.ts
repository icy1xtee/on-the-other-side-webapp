/** The player's own save slots — six on one page, like a page of Ren'Py's file slots. */
export const SAVE_SLOTS = [1, 2, 3, 4, 5, 6] as const;

export type SaveSlot = (typeof SAVE_SLOTS)[number];

/** Where a game can be loaded from: one of the slots, or the autosave. */
export type LoadSource = SaveSlot | 'auto';

/** A question about a save, asked over the game menu before what can't be undone. */
export type SlotQuestion =
  | { type: 'overwrite'; slot: SaveSlot }
  | { type: 'delete'; slot: SaveSlot }
  | { type: 'load'; source: LoadSource };
