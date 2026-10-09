import roomBackground from '@/assets/backgrounds/room.webp';
import streetBackground from '@/assets/backgrounds/street.svg';
import anna from '@/assets/characters/anna.webp';
import annaPortrait from '@/assets/portraits/anna.webp';
import type { BackgroundId, CharacterId, EmotionOf } from './ids';
import type { SpeakerId } from './speakers';

/**
 * Which file stands behind each id — Ren'Py's `image` statements. `satisfies` makes a missing
 * background or emotion a compile error.
 *
 * Demo art comes from the design reference. There is one drawing of Anna so far, so all her
 * emotions share it until the real sprites arrive.
 */
export const assets = {
  backgrounds: {
    room: roomBackground,
    street: streetBackground,
  } satisfies Record<BackgroundId, string>,
  characters: {
    anna: { neutral: anna, happy: anna, sad: anna },
  } satisfies { [C in CharacterId]: Record<EmotionOf<C>, string> },
  portraits: {
    anna: annaPortrait,
  } satisfies Partial<Record<SpeakerId, string>>,
};
