// Stand-ins for the browser's storage and audio in store tests.

import { vi } from 'vitest';
import type { AudioOutput } from '@/shared/lib/audio';

/** A storage slot in memory; a refusing one behaves like blocked or full browser storage. */
export function memorySlot(initial: string | null = null, { refusing = false } = {}) {
  let value = initial;
  return {
    get value() {
      return value;
    },
    writes: 0,
    read: () => (refusing ? null : value),
    write(text: string) {
      if (refusing) {
        return false;
      }
      value = text;
      this.writes += 1;
      return true;
    },
    clear: () => {
      value = null;
    },
  };
}

/** Audio that only records what it was asked to play. */
export function fakeAudio() {
  return {
    playMusic: vi.fn<AudioOutput['playMusic']>(),
    playSound: vi.fn<AudioOutput['playSound']>(),
    stopSounds: vi.fn<AudioOutput['stopSounds']>(),
    setVolumes: vi.fn<AudioOutput['setVolumes']>(),
    setMuted: vi.fn<AudioOutput['setMuted']>(),
  };
}
