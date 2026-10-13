/**
 * Keys in the browser's storage, prefixed with the project's initials so nothing else on the
 * same origin collides with them. Three kinds of data, as in Ren'Py, each under a key of its own
 * so clearing one never touches the others: the save belongs to a playthrough; the settings and
 * `persistent` (what the player has read) outlive every one.
 */
export const STORAGE_KEYS = {
  autosave: 'ots:save:auto',
  /** Runs started with `?dev=` on the dev server save here, not over the real playthrough. */
  devAutosave: 'ots:save:dev',
  settings: 'ots:settings',
  persistent: 'ots:persistent',
  /** And mark what they read here: a dev run doesn't make the real story read. */
  devPersistent: 'ots:persistent:dev',
} as const;
