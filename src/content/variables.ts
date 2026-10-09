/**
 * Every variable the story changes, with its default — Ren'Py's `default`. A save made before a
 * variable existed still loads: the missing variable takes its default.
 */
export const variableDefaults = {
  metAnna: false,
  trust: 0,
};

export type GameVars = typeof variableDefaults;
