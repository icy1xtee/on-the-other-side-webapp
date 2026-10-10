import { makeAutoObservable } from 'mobx';
import * as z from 'zod/mini';
import { defaultLanguage, languages, type Language } from '@/shared/i18n/languages';
import type { Volumes } from '@/shared/lib/audio';
import type { StorageSlot } from '@/shared/lib/storage';

export type Settings = {
  masterVolume: number;
  musicVolume: number;
  soundVolume: number;
  /** Characters per second; 0 shows a line at once — Ren'Py's `preferences.text_cps`. */
  textCps: number;
  language: Language;
};

export const DEFAULT_SETTINGS: Settings = {
  masterVolume: 1,
  // Ren'Py's docs set music at half by default: a loop under the text, not over it.
  musicVolume: 0.5,
  soundVolume: 1,
  // The design's typewriter speed; Ren'Py's docs use 40.
  textCps: 38,
  language: defaultLanguage,
};

const volume = z.number().check(z.gte(0), z.lte(1));
const fields = {
  masterVolume: volume,
  musicVolume: volume,
  soundVolume: volume,
  textCps: z.number().check(z.gte(0), z.lte(1000)),
  language: z.enum(languages),
} satisfies Record<keyof Settings, z.ZodMiniType>;

/**
 * Settings from storage, each field on its own: a broken or missing one takes its default and
 * the rest survive. Nothing stored, or not JSON, means all defaults.
 */
export function readSettings(text: string | null): Settings {
  let raw: unknown = null;
  try {
    raw = text === null ? null : JSON.parse(text);
  } catch {
    // Not JSON: defaults.
  }
  const stored = isRecord(raw) ? raw : {};

  const read = <K extends keyof Settings>(key: K): Settings[K] => {
    const parsed = fields[key].safeParse(stored[key]);
    return parsed.success ? (parsed.data as Settings[K]) : DEFAULT_SETTINGS[key];
  };
  return {
    masterVolume: read('masterVolume'),
    musicVolume: read('musicVolume'),
    soundVolume: read('soundVolume'),
    textCps: read('textCps'),
    language: read('language'),
  };
}

/**
 * The player's settings — the store that outlives every playthrough, under a key of its own,
 * apart from the save (Ren'Py keeps preferences apart the same way). Every change applies at
 * once and is written straight away: there is no "Apply" button.
 */
export class SettingsStore implements Settings {
  masterVolume: number;
  musicVolume: number;
  soundVolume: number;
  textCps: number;
  language: Language;
  private readonly slot: StorageSlot;

  constructor(slot: StorageSlot) {
    this.slot = slot;
    ({
      masterVolume: this.masterVolume,
      musicVolume: this.musicVolume,
      soundVolume: this.soundVolume,
      textCps: this.textCps,
      language: this.language,
    } = readSettings(slot.read()));
    makeAutoObservable<this, 'slot'>(this, { slot: false }, { autoBind: true });
  }

  get volumes(): Volumes {
    return { master: this.masterVolume, music: this.musicVolume, sound: this.soundVolume };
  }

  setMasterVolume(value: number) {
    this.masterVolume = clamp(value, 0, 1);
    this.persist();
  }

  setMusicVolume(value: number) {
    this.musicVolume = clamp(value, 0, 1);
    this.persist();
  }

  setSoundVolume(value: number) {
    this.soundVolume = clamp(value, 0, 1);
    this.persist();
  }

  setTextCps(value: number) {
    this.textCps = Math.max(0, value);
    this.persist();
  }

  setLanguage(language: Language) {
    this.language = language;
    this.persist();
  }

  private persist() {
    const { masterVolume, musicVolume, soundVolume, textCps, language } = this;
    this.slot.write(JSON.stringify({ masterVolume, musicVolume, soundVolume, textCps, language }));
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
