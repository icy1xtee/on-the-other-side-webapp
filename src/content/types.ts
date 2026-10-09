import type { ChoiceOption, Command } from '@engine';
import type { BackgroundId, CharacterId, EmotionId, MusicId, SceneId, SfxId } from './ids';
import type { SpeakerId } from './speakers';
import type { GameVars } from './variables';

/** The engine's id spaces narrowed to this story: a typo in any id is a compile error. */
export type ContentIds = {
  scene: SceneId;
  background: BackgroundId;
  character: CharacterId;
  emotion: EmotionId;
  speaker: SpeakerId;
  music: MusicId;
  sfx: SfxId;
  vars: GameVars;
};

export type Cmd = Command<ContentIds>;
export type Option = ChoiceOption<ContentIds>;
export type Scene = readonly Cmd[];
