// zod/mini: the same validation as zod, tree-shaken down to what the save uses.
import * as z from 'zod/mini';
import { SPRITE_POSITIONS } from '../types/command';

/** The version of the save's shape. The story's own changes are caught by `sceneHashes` instead. */
export const SAVE_VERSION = 2;

const varValue = z.union([z.boolean(), z.number(), z.string()]);

/**
 * The game state as a snapshot, not a replay — the position on a line or a choice, the
 * variables, what is on screen and what plays. Ren'Py saves the current statement the same way.
 */
const stateSchema = z.object({
  /** An object, so a call stack can join it later without a new format. */
  position: z.object({ sceneId: z.string(), step: z.int().check(z.nonnegative()) }),
  vars: z.record(z.string(), varValue),
  stage: z.object({
    background: z.nullable(z.string()),
    sprites: z.array(
      z.object({ tag: z.string(), emotion: z.string(), at: z.enum(SPRITE_POSITIONS) }),
    ),
  }),
  audio: z.object({ music: z.nullable(z.string()) }),
});

/** A history entry: keys — the speaker's id and the Russian line — not the text shown. */
const historyEntrySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('line'), speaker: z.string(), text: z.string() }),
  z.object({ kind: z.literal('narration'), text: z.string() }),
  z.object({ kind: z.literal('choice'), text: z.string() }),
]);

/** A line or a choice rollback returns to, with what arriving there added to the history. */
const checkpointSchema = z.object({
  state: stateSchema,
  entries: z.array(historyEntrySchema),
  chosen: z.optional(z.int().check(z.nonnegative())),
});

/**
 * A save: the way the player has come, as rollback keeps it — the game on screen is the
 * checkpoint at `current`, the older ones are the way back, the newer ones the way forward the
 * player rolled back over — and the history read on it. Ren'Py's save holds its rollback log the
 * same way, so a loaded game can still roll back.
 */
export const saveSchema = z.object({
  version: z.literal(SAVE_VERSION),
  checkpoints: z.array(checkpointSchema).check(z.minLength(1)),
  current: z.int().check(z.nonnegative()),
  history: z.array(historyEntrySchema),
  /**
   * The fingerprint of every scene a checkpoint stands in, when the save was made: a scene
   * edited since can't be resumed mid-way.
   */
  sceneHashes: z.record(z.string(), z.string()),
  /** Milliseconds since the epoch. */
  savedAt: z.number(),
  /**
   * Milliseconds of play up to this save — the save's own data, like `savedAt`, not the game's
   * state.
   */
  playTime: z.number().check(z.nonnegative()),
});

export type SaveData = z.infer<typeof saveSchema>;
