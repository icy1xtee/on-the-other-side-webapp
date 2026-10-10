/**
 * Keys in the browser's storage, prefixed with the project's initials so nothing else on the
 * same origin collides with them. Settings get a key of their own in stage 6: they outlive every
 * playthrough, the save doesn't.
 */
export const STORAGE_KEYS = {
  autosave: 'ots:save:auto',
  /** Runs started with `?dev=` on the dev server save here, not over the real playthrough. */
  devAutosave: 'ots:save:dev',
} as const;
