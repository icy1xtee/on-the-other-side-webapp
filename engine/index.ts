// Public API of the engine. The app imports only from here (`from '@engine'`).

export type { Ids, VarName, VarValue } from './types/ids';
export { resolveText, type LocalizedText } from './types/text';
export {
  requiresInteraction,
  type ChoiceOption,
  type ChoicePrompt,
  type Command,
  type InteractionCommand,
  type SpritePosition,
  type StateCommand,
} from './types/command';

export {
  createInitialState,
  type AudioState,
  type GameState,
  type Position,
  type Sprite,
  type StageState,
} from './state/state';
export type { Effect } from './state/applyInstant';

export { createSceneRegistry, type SceneRegistry } from './program/sceneRegistry';

export {
  advance,
  choose,
  run,
  startGame,
  STEP_LIMIT,
  type ChoiceView,
  type Interaction,
  type RunResult,
} from './interpreter/interpreter';

export { EngineError } from './errors';
