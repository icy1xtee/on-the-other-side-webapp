import {
  createSave,
  parseSave,
  restoreSave,
  type GameState,
  type SceneRegistry,
  type VarValue,
} from '@engine';
import { makeAutoObservable, observable } from 'mobx';
import type { StorageSlot } from '@/shared/lib/storage';

/** A game to continue: the autosave's state and what the save says about itself. */
export type Resumable = {
  state: GameState;
  /** Milliseconds since the epoch. */
  savedAt: number;
  /** Milliseconds of play up to the save. */
  playTime: number;
};

export type SaveStoreOptions = {
  registry: SceneRegistry;
  variableDefaults: Readonly<Record<string, VarValue>>;
  /** Where the autosave lives. It may refuse to work: the game then plays on without saves. */
  slot: StorageSlot;
  /** Called once, the first time an autosave can't be written: the player should know. */
  onUnavailable?: () => void;
  /** The clock, in milliseconds since the epoch; tests pass their own. */
  now?: () => number;
};

/**
 * The saves and the play time they carry. One slot so far, the autosave, written at every line
 * and choice — Ren'Py's "saving occurs at the start of a statement" — so it always holds the game
 * where the player is; "Продолжить" resumes from it. Manual slots join it in stage 4.
 *
 * The play time is a clock the game screen starts while the player is in the game and stops when
 * they leave it, hide the tab or open the game menu — Ren'Py's game runtime doesn't count the
 * menus either.
 */
export class SaveStore {
  /**
   * Where "Продолжить" resumes: the line or choice on screen in this session, or the autosave
   * found at boot. Kept in memory too, so Continue works within the session even when storage
   * doesn't.
   */
  resumable: Resumable | null = null;
  /** Play time banked before the clock last started. */
  private playedMs = 0;
  /** When the clock started, or null while it stands. */
  private clockStartedAt: number | null = null;
  private unavailableReported = false;
  private readonly options: SaveStoreOptions;
  private readonly now: () => number;

  constructor(options: SaveStoreOptions) {
    this.options = options;
    this.now = options.now ?? Date.now;
    makeAutoObservable<this, 'options' | 'now' | 'unavailableReported'>(
      this,
      { resumable: observable.ref, options: false, now: false, unavailableReported: false },
      { autoBind: true },
    );
    this.resumable = this.read();
  }

  get canContinue(): boolean {
    return this.resumable !== null;
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
      this.write(this.resumable.state);
    }
  }

  /** Another game's time from here on — a new one from zero, a continued one from its save. */
  startPlaying(playedMs: number) {
    this.playedMs = playedMs;
    if (this.clockStartedAt !== null) {
      this.clockStartedAt = this.now();
    }
  }

  /** The game reached a line or a choice: the autosave. Tells once if storage refuses. */
  autosave(state: GameState) {
    if (!this.write(state) && !this.unavailableReported) {
      this.unavailableReported = true;
      this.options.onUnavailable?.();
    }
  }

  /**
   * Writes the game where it stands — the line or choice on screen — at once: the Save button.
   * False when storage refused, or when there is no game to save.
   */
  saveNow(): boolean {
    return this.resumable !== null && this.write(this.resumable.state);
  }

  /** The playthrough is over: nothing is left to continue. */
  forget() {
    this.resumable = null;
    this.options.slot.clear();
  }

  private write(state: GameState): boolean {
    const savedAt = this.now();
    const playTime = this.playTime(savedAt);
    this.resumable = { state, savedAt, playTime };
    const save = createSave(state, this.options.registry, { savedAt, playTime });
    return this.options.slot.write(JSON.stringify(save));
  }

  /** The autosave found at boot, if it can be resumed. A broken one is logged and ignored. */
  private read(): Resumable | null {
    const text = this.options.slot.read();
    if (text === null) {
      return null;
    }
    const parsed = parseSave(text);
    if (!parsed.ok) {
      console.warn(`Autosave ignored: ${parsed.reason}`);
      return null;
    }
    const { registry, variableDefaults } = this.options;
    const state = restoreSave(parsed.save, registry, variableDefaults);
    if (!state) {
      console.warn(`Autosave ignored: scene "${parsed.save.position.sceneId}" is gone`);
      return null;
    }
    return { state, savedAt: parsed.save.savedAt, playTime: parsed.save.playTime ?? 0 };
  }
}
