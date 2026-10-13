import type { Effect } from '@engine';
import type { AudioOutput } from '@/shared/lib/audio';
import type { Presentation } from './presentation';

/**
 * Plays the music changes and sounds the engine met on its way to the line, in order. A track
 * without a file plays as silence rather than leaving the last one on; a sound without one plays
 * nothing.
 */
export function playEffects(
  effects: readonly Effect[],
  audio: AudioOutput,
  assets: Presentation['assets'],
) {
  for (const effect of effects) {
    if (effect.type === 'music') {
      const src = effect.asset === null ? null : (assets.music[effect.asset] ?? null);
      audio.playMusic(src, { ifChanged: effect.ifChanged });
      continue;
    }
    const src = assets.sounds[effect.asset];
    if (src) {
      audio.playSound(src);
    }
  }
}
