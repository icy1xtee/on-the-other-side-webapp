import { SAVE_VERSION } from './schema';

type RawSave = Record<string, unknown>;

/**
 * `migrations[n]` turns a save of format n into format n + 1, so saves made before a change to
 * the format still load. A step trusts nothing: whatever it can't make sense of is left for the
 * schema to refuse.
 */
const migrations: Readonly<Record<number, (save: RawSave) => RawSave>> = {
  /**
   * 1 → 2: the history and the way back join the save. A save from before them has neither — the
   * game on screen is the only checkpoint — and its play time, optional in format 1, is zero
   * when it has none.
   */
  1: ({ position, vars, stage, audio, sceneHash, savedAt, playTime }) => ({
    version: 2,
    checkpoints: [{ state: { position, vars, stage, audio }, entries: [] }],
    current: 0,
    history: [],
    sceneHashes:
      isRecord(position) && typeof position.sceneId === 'string'
        ? { [position.sceneId]: sceneHash }
        : {},
    savedAt,
    playTime: playTime ?? 0,
  }),
};

export type Migrated = { ok: true; save: RawSave } | { ok: false; reason: string };

/** Brings a save of an older format up to the current one, step by step; a newer one is refused. */
export function migrate(save: RawSave, version: number): Migrated {
  if (version > SAVE_VERSION) {
    return { ok: false, reason: `format ${version} is newer than this game's ${SAVE_VERSION}` };
  }
  let current = save;
  for (let from = version; from < SAVE_VERSION; from++) {
    const step = migrations[from];
    if (!step) {
      return { ok: false, reason: `no migration from format ${from}` };
    }
    current = step(current);
  }
  return { ok: true, save: current };
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
