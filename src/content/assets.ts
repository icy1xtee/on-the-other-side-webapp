import roomBackground from '@/assets/backgrounds/room.webp';
import streetBackground from '@/assets/backgrounds/street.svg';
import mila from '@/assets/characters/mila.webp';
import themeMusic from '@/assets/music/theme.mp3';
import milaPortrait from '@/assets/portraits/mila.webp';
import doorSound from '@/assets/sounds/door.ogg';
import knockSound from '@/assets/sounds/knock.ogg';
import stepsSound from '@/assets/sounds/steps.ogg';
import type { BackgroundId, CharacterId, EmotionOf, MusicId, SfxId } from './ids';
import type { SpeakerId } from './speakers';

/**
 * Which file stands behind each id — Ren'Py's `image` statements. `satisfies` makes a missing
 * background, emotion, track or sound a compile error.
 *
 * Demo art comes from the design reference. There is one drawing of Mila so far, so all her
 * emotions share it until the real sprites arrive. The theme is the demo track Pavel picked; the
 * sounds are Kenney's (CC0) until the game's own — where they come from is in
 * `assets/sounds/CREDITS.md`.
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
  sounds: {
    knock: knockSound,
    door: doorSound,
    steps: stepsSound,
  } satisfies Record<SfxId, string>,
};

/** The main menu's key art: the room and Mila until real key art is drawn. */
export const menuArt = {
  background: roomBackground,
  character: mila,
};

/**
 * The main menu's track — Ren'Py's `config.main_menu_music`: the game's theme, so it plays on
 * without a break from the menu into the game and back.
 */
export const menuMusic = themeMusic;
