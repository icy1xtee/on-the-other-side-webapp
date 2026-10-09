import type { SpritePosition } from '../types/command';
import type { VarValue } from '../types/ids';

/** Where execution stands. An object, so a call stack can join it later without a new save format. */
export type Position = {
  readonly sceneId: string;
  /** Index into the scene's compiled program, not into its source commands. */
  readonly step: number;
};

export type Sprite = {
  readonly tag: string;
  readonly emotion: string;
  readonly at: SpritePosition;
};

/** What is on screen, like Ren'Py's master layer: one background and sprites in z-order. */
export type StageState = {
  readonly background: string | null;
  readonly sprites: readonly Sprite[];
};

export type AudioState = {
  readonly music: string | null;
};

/**
 * Everything a save needs, as plain data: a snapshot, not a replay. Every engine function
 * returns a new state instead of mutating this one.
 */
export type GameState = {
  readonly position: Position;
  readonly vars: Readonly<Record<string, VarValue>>;
  readonly stage: StageState;
  readonly audio: AudioState;
};

export function createInitialState(
  sceneId: string,
  variableDefaults: Readonly<Record<string, VarValue>>,
): GameState {
  return {
    position: { sceneId, step: 0 },
    vars: { ...variableDefaults },
    stage: { background: null, sprites: [] },
    audio: { music: null },
  };
}
