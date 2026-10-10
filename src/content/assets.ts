import roomBackground from '@/assets/backgrounds/room.webp';
import streetBackground from '@/assets/backgrounds/street.svg';
import mila from '@/assets/characters/mila.webp';
import themeMusic from '@/assets/music/theme.mp3';
import milaPortrait from '@/assets/portraits/mila.webp';
import type { BackgroundId, CharacterId, EmotionOf, MusicId, SfxId } from './ids';
import type { SpeakerId } from './speakers';

/**
 * Which file stands behind each id — Ren'Py's `image` statements. `satisfies` makes a missing
 * background, emotion or track a compile error.
 *
 * Demo art comes from the design reference. There is one drawing of Mila so far, so all her
 * emotions share it until the real sprites arrive. The theme is the demo track Pavel picked.
 */
export const assets = {
  backgrounds: {
    room: roomBackground,
    street: streetBackground,
  } satisfies Record<BackgroundId, string>,
  characters: {
    mila: { neutral: mila, happy: mila, sad: mila },
  } satisfies { [C in CharacterId]: Record<EmotionOf<C>, string> },
  portraits: {
    mila: milaPortrait,
  } satisfies Partial<Record<SpeakerId, string>>,
  music: {
    theme: themeMusic,
  } satisfies Record<MusicId, string>,
  // No sound files yet: `door` plays nothing until one arrives.
  sounds: {} satisfies Partial<Record<SfxId, string>>,
};
