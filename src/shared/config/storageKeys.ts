/**
 * Keys in the browser's storage, prefixed with the project's initials so nothing else on the
 * same origin collides with them. Settings have a key of their own: they outlive every
 * playthrough, the save doesn't — clearing one never touches the other.
 */
export const STORAGE_KEYS = {
  autosave: 'ots:save:auto',
  /** Runs started with `?dev=` on the dev server save here, not over the real playthrough. */
  devAutosave: 'ots:save:dev',
  settings: 'ots:settings',
} as const;
