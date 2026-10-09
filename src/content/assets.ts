import roomBackground from '@/assets/backgrounds/room.webp';
import streetBackground from '@/assets/backgrounds/street.svg';
import mila from '@/assets/characters/mila.webp';
import milaPortrait from '@/assets/portraits/mila.webp';
import type { BackgroundId, CharacterId, EmotionOf } from './ids';
import type { SpeakerId } from './speakers';

/**
 * Which file stands behind each id — Ren'Py's `image` statements. `satisfies` makes a missing
 * background or emotion a compile error.
 *
 * Demo art comes from the design reference. There is one drawing of Mila so far, so all her
 * emotions share it until the real sprites arrive.
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
};
