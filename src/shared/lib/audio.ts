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
  /** Cuts every sound short — Ren'Py stops its `sound` channel on the way to the main menu. */
  stopSounds(): void;
  setVolumes(volumes: Volumes): void;
  /** Silences everything without touching the volumes — Ren'Py's "Mute All". */
  setMuted(muted: boolean): void;
};

/**
 * Two channels over howler.js, like Ren'Py's `music` and `sound`: one looped track at a time,
 * sounds over each other. Nothing else in the app touches howler, so moving to the Web Audio API
 * would change this file alone.
 *
 * The browser's autoplay policy: the main menu's track is asked for as the page opens, before the
 * player has clicked or pressed anything, and the browser refuses it. The track then waits for
 * howler's `unlock` — the first click or key anywhere — and starts on it. Sounds play only in the
 * game, which the player has clicked their way into.
 *
 * `sounds` are loaded up front, so the first knock isn't late for its line.
 */
export function createAudioPlayer({
  fadeMs,
  sounds: preloaded = [],
}: {
  fadeMs: number;
  sounds?: readonly string[];
}): AudioOutput {
  let music: { src: string; howl: Howl } | null = null;
  let volumes: Volumes = { master: 1, music: 1, sound: 1 };
  const sounds = new Map<string, Howl>();
  const soundFor = (src: string) => {
    let howl = sounds.get(src);
    if (!howl) {
      howl = new Howl({ src: [src] });
      sounds.set(src, howl);
    }
    return howl;
  };
  preloaded.forEach(soundFor);

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
        // Howler may report one refusal twice: the track waits for the unlock once.
        onplayerror: () => {
          howl.off('unlock');
          howl.once('unlock', () => howl.play());
        },
      });
      howl.play();
      howl.fade(0, volumes.music, fadeMs);
      music = { src, howl };
    },

    playSound(src) {
      const howl = soundFor(src);
      howl.volume(volumes.sound);
      howl.play();
    },

    stopSounds() {
      for (const howl of sounds.values()) {
        howl.stop();
      }
    },

    setVolumes(next) {
      volumes = next;
      Howler.volume(next.master);
      music?.howl.volume(next.music);
    },

    setMuted(muted) {
      Howler.mute(muted);
    },
  };
}
