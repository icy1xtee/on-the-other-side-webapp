import {
  createSave,
  parseSave,
  restoreSave,
  type SceneRegistry,
  type Timeline,
  type VarValue,
} from '@engine';
import { makeAutoObservable, observable } from 'mobx';
import { SAVE_SLOTS, type LoadSource, type SaveSlot } from '@/shared/config/saveSlots';
import type { StorageSlot } from '@/shared/lib/storage';
import { savePreview, type Presentation, type SavePreview } from './presentation';

/** A game to pick up: the way taken in it — the line on screen, the way back, the history — and what the save says about itself. */
export type SavedGame = {
  timeline: Timeline;
  /** Milliseconds since the epoch. */
  savedAt: number;
  /** Milliseconds of play up to the save. */
  playTime: number;
};

export type SaveStoreOptions = {
  registry: SceneRegistry;
  variableDefaults: Readonly<Record<string, VarValue>>;
  presentation: Presentation;
  /**
   * Where each save lives — the autosave, the slots. Called once per save, at boot. Storage may
   * refuse to work: the game then plays on without saves.
   */
  storage: (source: LoadSource) => StorageSlot;
  /** Called once, the first time an autosave can't be written: the player should know. */
  onUnavailable?: () => void;
  /** The clock, in milliseconds since the epoch; tests pass their own. */
  now?: () => number;
};

/**
 * The saves and the play time they carry. The autosave is written at every line and choice —
 * Ren'Py's "saving occurs at the start of a statement" — so it always holds the game where the
 * player is; "Продолжить" resumes from it. Six slots take the game on the player's word and give
 * it back on Load. A save holds the way taken — the history and the way back — so a loaded game
 * rolls back as far as it could when it was saved.
 *
 * The play time is a clock the game screen starts while the player is in the game and stops when
 * they leave it, hide the tab or open the game menu — Ren'Py's game runtime doesn't count the
 * menus either.
 */
export class SaveStore {
  /**
   * Where "Продолжить" resumes: the game on screen in this session, or the autosave found at
   * boot. Kept in memory too, so Continue works within the session even when storage doesn't.
   */
  resumable: SavedGame | null = null;
  /** The slots with a game in them, as last read — when the Save or Load section opened. */
  slots: Readonly<Partial<Record<SaveSlot, SavedGame>>> = {};
  /** Play time banked before the clock last started. */
  private playedMs = 0;
  /** When the clock started, or null while it stands. */
  private clockStartedAt: number | null = null;
  private unavailableReported = false;
  private readonly autosaveSlot: StorageSlot;
  private readonly slotStorage: ReadonlyMap<SaveSlot, StorageSlot>;
  private readonly options: SaveStoreOptions;
  private readonly now: () => number;

  constructor(options: SaveStoreOptions) {
    this.options = options;
    this.now = options.now ?? Date.now;
    this.autosaveSlot = options.storage('auto');
    this.slotStorage = new Map(SAVE_SLOTS.map((slot) => [slot, options.storage(slot)]));
    makeAutoObservable<
      this,
      'options' | 'now' | 'unavailableReported' | 'autosaveSlot' | 'slotStorage'
    >(
      this,
      {
        resumable: observable.ref,
        slots: observable.ref,
        options: false,
        now: false,
        unavailableReported: false,
        autosaveSlot: false,
        slotStorage: false,
      },
      { autoBind: true },
    );
    this.resumable = this.read('auto');
  }

  get canContinue(): boolean {
    return this.resumable !== null;
  }

  /** The game a load would pick up: the autosave or a slot's, as last read; null if none. */
  game(source: LoadSource): SavedGame | null {
    return (source === 'auto' ? this.resumable : this.slots[source]) ?? null;
  }

  /** What a save shows of itself in the menus — the picture, the scene, the line; null if none. */
  preview(source: LoadSource): SavePreview | null {
    const game = this.game(source);
    if (!game) {
      return null;
    }
    const { timeline, savedAt } = game;
    const { registry, presentation } = this.options;
    const checkpoint = timeline.checkpoints[timeline.current];
    return checkpoint ? savePreview(checkpoint.state, savedAt, registry, presentation) : null;
  }

  /** Milliseconds of play in this game so far, the running stretch included. */
  playTime(now = this.now()): number {
    return this.playedMs + (this.clockStartedAt === null ? 0 : now - this.clockStartedAt);
  }

  /** The player is in the game: time counts. */
  startClock() {
    this.clockStartedAt ??= this.now();
  }

  /**
   * The player left the game, hid the tab or opened the game menu: time stops. The autosave
   * takes the time played on the last line, which no line or choice has saved yet.
   */
  stopClock() {
    if (this.clockStartedAt === null) {
      return;
    }
    this.playedMs = this.playTime();
    this.clockStartedAt = null;
    if (this.resumable) {
      this.writeAutosave(this.resumable.timeline);
    }
  }

  /** Another game's time from here on — a new one from zero, a loaded one from its save. */
  startPlaying(playedMs: number) {
    this.playedMs = playedMs;
    if (this.clockStartedAt !== null) {
      this.clockStartedAt = this.now();
    }
  }

  /** The game reached a line or a choice: the autosave. Tells once if storage refuses. */
  autosave(timeline: Timeline) {
    if (!this.writeAutosave(timeline) && !this.unavailableReported) {
      this.unavailableReported = true;
      this.options.onUnavailable?.();
    }
  }

  /** The playthrough is over: nothing is left to continue. */
  forget() {
    this.resumable = null;
    this.autosaveSlot.clear();
  }

  /** Reads what the slots hold: the Save and Load sections open on what is in storage now. */
  readSlots() {
    const slots: Partial<Record<SaveSlot, SavedGame>> = {};
    for (const slot of SAVE_SLOTS) {
      const game = this.read(slot);
      if (game) {
        slots[slot] = game;
      }
    }
    this.slots = slots;
  }

  /**
   * Puts the game on screen into a slot, over whatever was there. False when storage refused,
   * or when there is no game to save.
   */
  saveTo(slot: SaveSlot): boolean {
    if (!this.resumable) {
      return false;
    }
    const game = this.stamp(this.resumable.timeline);
    if (!this.write(this.slotStorage.get(slot), game)) {
      return false;
    }
    this.slots = { ...this.slots, [slot]: game };
    return true;
  }

  /** Empties a slot. */
  deleteSlot(slot: SaveSlot) {
    this.slotStorage.get(slot)?.clear();
    const { [slot]: _, ...rest } = this.slots;
    this.slots = rest;
  }

  private writeAutosave(timeline: Timeline): boolean {
    this.resumable = this.stamp(timeline);
    return this.write(this.autosaveSlot, this.resumable);
  }

  /** The game as saved now: the way taken, the time and the time played. */
  private stamp(timeline: Timeline): SavedGame {
    const savedAt = this.now();
    return { timeline, savedAt, playTime: this.playTime(savedAt) };
  }

  private write(storage: StorageSlot | undefined, { timeline, ...meta }: SavedGame): boolean {
    const save = createSave(timeline, this.options.registry, meta);
    return storage?.write(JSON.stringify(save)) ?? false;
  }

  /** A save that can be resumed, or null. A broken one is logged and counts as empty. */
  private read(source: LoadSource): SavedGame | null {
    const storage = source === 'auto' ? this.autosaveSlot : this.slotStorage.get(source);
    const text = storage?.read() ?? null;
    if (text === null) {
      return null;
    }
    const name = source === 'auto' ? 'Autosave' : `Slot ${source}`;
    const parsed = parseSave(text);
    if (!parsed.ok) {
      console.warn(`${name} ignored: ${parsed.reason}`);
      return null;
    }
    const { registry, variableDefaults } = this.options;
    const restored = restoreSave(parsed.save, registry, variableDefaults);
    if (!restored.ok) {
      console.warn(`${name} ignored: ${restored.reason}`);
      return null;
    }
    const { savedAt, playTime } = parsed.save;
    return { timeline: restored.timeline, savedAt, playTime };
  }
}
