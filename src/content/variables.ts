/** How the player answered the knock at the door: the demo's one choice. */
export type DoorAnswer = 'none' | 'opened' | 'asked' | 'silent';

/**
 * Every variable the story changes, with its default — Ren'Py's `default`. A save made before a
 * variable existed still loads: the missing variable takes its default. `metMila` and `trust`
 * are set and tested by the dev scenes (content/__dev__).
 */
export const variableDefaults = {
  metMila: false,
  trust: 0,
  doorAnswer: 'none' as DoorAnswer,
};

export type GameVars = typeof variableDefaults;
