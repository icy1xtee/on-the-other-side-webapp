// Public API of the engine. The app imports only from here (`from '@engine'`).

export type { Ids, VarName, VarValue } from './types/ids';
export type { LocalizedText } from './types/text';
export {
  SPRITE_POSITIONS,
  type ChoiceOption,
  type ChoicePrompt,
  type Command,
  type SpritePosition,
  type StateCommand,
} from './types/command';

export type { AudioState, GameState, Position, Sprite, StageState } from './state/state';
export type { Effect } from './state/applyInstant';

export { createSceneRegistry, type SceneRegistry } from './program/sceneRegistry';
export { hashText } from './program/hashProgram';

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

export { SAVE_VERSION, type SaveData } from './save/schema';
export { createSave, parseSave, restoreSave, type ParsedSave, type SaveMeta } from './save/save';

export { EngineError } from './errors';
