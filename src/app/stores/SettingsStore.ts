import { makeAutoObservable } from 'mobx';
import * as z from 'zod/mini';
import {
  AUTO_DELAY,
  MIN_WINDOW_OPACITY,
  SKIP_MODES,
  TEXT_SIZES,
  type SkipMode,
  type TextSize,
} from '@/shared/config/settings';
import { defaultLanguage, languages, type Language } from '@/shared/i18n/languages';
import type { Volumes } from '@/shared/lib/audio';
import type { StorageSlot } from '@/shared/lib/storage';

export type Settings = {
  masterVolume: number;
  musicVolume: number;
  soundVolume: number;
  /** Silences everything, the volumes kept as they are — Ren'Py's "Mute All". */
  muted: boolean;
  /** Characters per second; 0 shows a line at once — Ren'Py's `preferences.text_cps`. */
  textCps: number;
  /** Seconds Auto waits once a line is out — the design's "Задержка автоперехода". */
  autoDelay: number;
  /** What Skip passes — Ren'Py's `preferences.skip_unseen`, as `'all'`. */
  skipMode: SkipMode;
  textSize: TextSize;
  /** The dialogue panel's opacity, from `MIN_WINDOW_OPACITY` to 1. */
  windowOpacity: number;
  language: Language;
};

export const DEFAULT_SETTINGS: Settings = {
  masterVolume: 1,
  // Ren'Py's docs set music at half by default: a loop under the text, not over it.
  musicVolume: 0.5,
  soundVolume: 1,
  muted: false,
  // The design's typewriter speed; Ren'Py's docs use 40.
  textCps: 38,
  // The design's default pause.
  autoDelay: 2,
  // Ren'Py's default: only what has been read.
  skipMode: 'read',
  textSize: 'normal',
  // The design's panel: nearly opaque, the scene barely showing through.
  windowOpacity: 0.96,
  language: defaultLanguage,
};

const volume = z.number().check(z.gte(0), z.lte(1));
const fields = {
  masterVolume: volume,
  musicVolume: volume,
  soundVolume: volume,
  muted: z.boolean(),
  textCps: z.number().check(z.gte(0), z.lte(1000)),
  autoDelay: z.number().check(z.gte(AUTO_DELAY.min), z.lte(AUTO_DELAY.max)),
  skipMode: z.enum(SKIP_MODES),
  textSize: z.enum(TEXT_SIZES),
  windowOpacity: z.number().check(z.gte(MIN_WINDOW_OPACITY), z.lte(1)),
  language: z.enum(languages),
} satisfies Record<keyof Settings, z.ZodMiniType>;

const KEYS = Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[];

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
  return Object.fromEntries(KEYS.map((key) => [key, read(key)])) as Settings;
}

/**
 * The player's settings — the store that outlives every playthrough, under a key of its own,
 * apart from the save (Ren'Py keeps preferences apart the same way). Every change applies at
 * once and is written straight away: there is no "Apply" button.
 */
export class SettingsStore implements Settings {
  masterVolume = DEFAULT_SETTINGS.masterVolume;
  musicVolume = DEFAULT_SETTINGS.musicVolume;
  soundVolume = DEFAULT_SETTINGS.soundVolume;
  muted = DEFAULT_SETTINGS.muted;
  textCps = DEFAULT_SETTINGS.textCps;
  autoDelay = DEFAULT_SETTINGS.autoDelay;
  skipMode = DEFAULT_SETTINGS.skipMode;
  textSize = DEFAULT_SETTINGS.textSize;
  windowOpacity = DEFAULT_SETTINGS.windowOpacity;
  language = DEFAULT_SETTINGS.language;
  private readonly slot: StorageSlot;

  constructor(slot: StorageSlot) {
    this.slot = slot;
    Object.assign(this, readSettings(slot.read()));
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

  setMuted(muted: boolean) {
    this.muted = muted;
    this.persist();
  }

  setTextCps(value: number) {
    this.textCps = Math.max(0, value);
    this.persist();
  }

  /** In seconds, on the slider's half-second steps. */
  setAutoDelay(value: number) {
    const stepped = Math.round(value / AUTO_DELAY.step) * AUTO_DELAY.step;
    this.autoDelay = clamp(stepped, AUTO_DELAY.min, AUTO_DELAY.max);
    this.persist();
  }

  setSkipMode(mode: SkipMode) {
    this.skipMode = mode;
    this.persist();
  }

  setTextSize(size: TextSize) {
    this.textSize = size;
    this.persist();
  }

  setWindowOpacity(value: number) {
    this.windowOpacity = clamp(value, MIN_WINDOW_OPACITY, 1);
    this.persist();
  }

  setLanguage(language: Language) {
    this.language = language;
    this.persist();
  }

  /** Everything back to the defaults — "Сбросить" in the settings. */
  reset() {
    Object.assign(this, DEFAULT_SETTINGS);
    this.persist();
  }

  private persist() {
    const settings = Object.fromEntries(KEYS.map((key) => [key, this[key]]));
    this.slot.write(JSON.stringify(settings));
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
