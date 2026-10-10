import { Howl, Howler } from 'howler';

export type Volumes = {
  /** Every sound, multiplied with its channel's own volume — Ren'Py's main mixer. */
  master: number;
  music: number;
  sound: number;
};

/** What the game asks of audio. Sources are file URLs. */
export type AudioOutput = {
  /**
   * Plays a looped track, fading over from the one playing; null fades the music out. With
   * `ifChanged`, a track that is already playing isn't restarted — Ren'Py's
   * `play music ... if_changed`.
   */
  playMusic(src: string | null, options?: { ifChanged?: boolean }): void;
  playSound(src: string): void;
  setVolumes(volumes: Volumes): void;
};

/**
 * Two channels over howler.js, like Ren'Py's `music` and `sound`: one looped track at a time,
 * sounds over each other. Nothing else in the app touches howler, so moving to the Web Audio API
 * would change this file alone.
 *
 * The browser's autoplay policy needs no special handling: music starts from a click (New game,
 * Continue), and a page that has had a click may play sound. Should a play still be refused,
 * howler's `unlock` retries it on the next gesture.
 */
export function createAudioPlayer({ fadeMs }: { fadeMs: number }): AudioOutput {
  let music: { src: string; howl: Howl } | null = null;
  let volumes: Volumes = { master: 1, music: 1, sound: 1 };
  const sounds = new Map<string, Howl>();

  const fadeOut = (howl: Howl) => {
    howl.once('fade', () => howl.unload());
    howl.fade(howl.volume(), 0, fadeMs);
  };

  return {
    playMusic(src, { ifChanged = false } = {}) {
      if (src !== null && ifChanged && music?.src === src) {
        return;
      }
      if (music) {
        fadeOut(music.howl);
        music = null;
      }
      if (src === null) {
        return;
      }
      const howl = new Howl({
        src: [src],
        // Streamed: a track of several minutes isn't decoded into memory whole.
        html5: true,
        loop: true,
        volume: 0,
        onplayerror: () => howl.once('unlock', () => howl.play()),
      });
      howl.play();
      howl.fade(0, volumes.music, fadeMs);
      music = { src, howl };
    },

    playSound(src) {
      let howl = sounds.get(src);
      if (!howl) {
        howl = new Howl({ src: [src] });
        sounds.set(src, howl);
      }
      howl.volume(volumes.sound);
      howl.play();
    },

    setVolumes(next) {
      volumes = next;
      Howler.volume(next.master);
      music?.howl.volume(next.music);
    },
  };
}
