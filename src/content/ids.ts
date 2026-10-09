// Every id the story may use. Lists rather than file maps: asset files are attached in stage 3.
// Scene ids are declared here, not derived from the scenes, because scenes refer to each other
// through `goTo` and a type can't be inferred from itself.

export const sceneIds = ['intro', 'walk'] as const;
export const backgroundIds = ['room', 'street'] as const;
export const characterEmotions = {
  mila: ['neutral', 'happy', 'sad'],
} as const;
export const musicIds = ['theme'] as const;
export const sfxIds = ['door'] as const;

export type SceneId = (typeof sceneIds)[number];
export type BackgroundId = (typeof backgroundIds)[number];
export type CharacterId = keyof typeof characterEmotions;
export type EmotionOf<C extends CharacterId> = (typeof characterEmotions)[C][number];
export type EmotionId = EmotionOf<CharacterId>;
export type MusicId = (typeof musicIds)[number];
export type SfxId = (typeof sfxIds)[number];
