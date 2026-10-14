import type { LoadSource } from './saveSlots';

/**
 * Keys in the browser's storage, prefixed with the project's initials so nothing else on the
 * same origin collides with them. Three kinds of data, as in Ren'Py, each under a key of its own
 * so clearing one never touches the others: the saves belong to playthroughs; the settings and
 * `persistent` (what the player has read) outlive every one.
 */
export const STORAGE_KEYS = {
  settings: 'ots:settings',
  persistent: 'ots:persistent',
  /** Runs started with `?dev=` on the dev server mark what they read here, not in the story. */
  devPersistent: 'ots:persistent:dev',
} as const;

/**
 * Where a save lives: `ots:save:auto` for the autosave, `ots:save:1` … `ots:save:6` for the
 * slots. A `?dev=` run saves apart — `ots:save:dev`, `ots:save:dev:1` … — not over the real
 * playthrough.
 */
export function saveKey(source: LoadSource, dev = false): string {
  if (!dev) {
    return `ots:save:${source}`;
  }
  return source === 'auto' ? 'ots:save:dev' : `ots:save:dev:${source}`;
}
