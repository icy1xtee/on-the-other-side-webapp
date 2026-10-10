import { SAVE_VERSION } from './schema';

type RawSave = Record<string, unknown>;

/**
 * `migrations[n]` turns a save of format n into format n + 1. Empty while there has only ever been
 * format 1: the next change to the format adds a step here, and saves made before it still load.
 */
const migrations: Readonly<Record<number, (save: RawSave) => RawSave>> = {};

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
