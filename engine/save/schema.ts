// zod/mini: the same validation as zod, tree-shaken down to what the save uses.
import * as z from 'zod/mini';
import { SPRITE_POSITIONS } from '../types/command';

/** The version of the save's shape. The story's own changes are caught by `sceneHash` instead. */
export const SAVE_VERSION = 1;

const varValue = z.union([z.boolean(), z.number(), z.string()]);

/**
 * A save: the game state as a snapshot, not a replay — the position on a line or a choice, the
 * variables, what is on screen and what plays. Ren'Py saves the current statement the same way.
 */
export const saveSchema = z.object({
  version: z.literal(SAVE_VERSION),
  /** An object, so a call stack can join it later without a new format. */
  position: z.object({ sceneId: z.string(), step: z.int().check(z.nonnegative()) }),
  /** The fingerprint of the scene's program when the save was made. */
  sceneHash: z.string(),
  vars: z.record(z.string(), varValue),
  stage: z.object({
    background: z.nullable(z.string()),
    sprites: z.array(
      z.object({ tag: z.string(), emotion: z.string(), at: z.enum(SPRITE_POSITIONS) }),
    ),
  }),
  audio: z.object({ music: z.nullable(z.string()) }),
  /** Milliseconds since the epoch. */
  savedAt: z.number(),
});

export type SaveData = z.infer<typeof saveSchema>;
