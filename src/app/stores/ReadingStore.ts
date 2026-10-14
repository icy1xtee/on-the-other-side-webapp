import { computed, makeAutoObservable } from 'mobx';
import type { GameStore } from './GameStore';
import type { PersistentStore } from './PersistentStore';
import type { OptionView } from './presentation';
import type { Settings } from './SettingsStore';

/** Ren'Py's `config.skip_delay`: how long a line stays on screen while skipping, in ms. */
export const SKIP_DELAY_MS = 5;

/**
 * Reading time added to Auto's pause when the text is instant: Ren'Py's auto-forward formula,
 * `(length + afm_bonus) / afm_characters × afm_time`. `afm_time` is ours: at 4 s a line of the demo
 * reads, on average, as long as it takes to type at the default speed.
 */
const AFM_CHARACTERS = 250;
const AFM_BONUS = 25;
const AFM_TIME_S = 4;

export type ReadingMode = 'auto' | 'skip';

/** What Auto or Skip does next, and when. */
export type ModeStep = {
  /** `advance`: on to the next line; `reveal`: the prompt is read, the options come out; `stop`: Skip ends here. */
  action: 'advance' | 'reveal' | 'stop';
  delayMs: number;
  /** The line it is planned for: the step of a new line is a new step, even if it reads the same. */
  lineKey: string | null;
};

type ReadingSettings = Pick<Settings, 'textCps' | 'autoDelay' | 'skipMode'>;

/**
 * How long Auto waits once a line is out: the pause from the settings, plus — when the text is
 * instant and so hasn't taken any time to come out — the time to read it.
 */
export function autoForwardMs(
  length: number,
  { autoDelay, textCps }: Pick<Settings, 'autoDelay' | 'textCps'>,
): number {
  const reading = textCps <= 0 ? ((length + AFM_BONUS) / AFM_CHARACTERS) * AFM_TIME_S : 0;
  return Math.round((autoDelay + reading) * 1000);
}

/**
 * How far the player has read what is on screen, and the single way the story moves on. The line
 * itself is the game's (`GameStore.line`); this store knows whether it is out in full, whether
 * the prompt of a choice has been read, and whether it was read in an earlier pass.
 *
 * The typewriter runs in the UI, on the frame clock (`useTypewriter`): it tells this store when a
 * line has typed out (`lineTyped`), and shows the line whole once this store says so.
 *
 * Auto and Skip, as in Ren'Py. Their timers run in the UI too (`useReadingModes`), which waits
 * `nextStep.delayMs` and calls `step()`. Auto goes on after the pause from the settings and waits
 * at a choice for the pick. Skip passes the lines read before (or all of them, by the settings),
 * stops at the first unread one and at a choice, and doesn't go on after it. A click ends either
 * of them and does nothing else; turning one on turns the other off. Ctrl skips while it is held.
 */
export class ReadingStore {
  /** Auto or Skip, switched on by its button (Skip — by Tab too); null while reading by hand. */
  mode: ReadingMode | null = null;
  /** Ctrl is down: Skip runs while it is, whatever the mode. */
  skipHeld = false;
  /** The key of the line out in full: typed to its end, or shown at once. */
  private shownKey: string | null = null;
  /** The key of the choice prompt the player has clicked past. */
  private readPromptKey: string | null = null;
  private readonly game: GameStore;
  private readonly settings: ReadingSettings;
  private readonly persistent: PersistentStore;

  constructor(game: GameStore, settings: ReadingSettings, persistent: PersistentStore) {
    this.game = game;
    this.settings = settings;
    this.persistent = persistent;
    makeAutoObservable<this, 'game' | 'settings' | 'persistent'>(
      this,
      // Structural: the UI's timer restarts only when the step really changes.
      { game: false, settings: false, persistent: false, nextStep: computed.struct },
      { autoBind: true },
    );
  }

  get skipping(): boolean {
    return this.mode === 'skip' || this.skipHeld;
  }

  /** The line on screen was gone past before — in this playthrough or an earlier one. */
  get lineRead(): boolean {
    const line = this.game.line;
    const sceneId = this.game.state?.position.sceneId;
    return line !== null && sceneId !== undefined && this.persistent.isRead(sceneId, line.text);
  }

  /**
   * The whole line is out: typed to its end, shown at once by a click, the text is instant, or
   * Skip is passing it.
   */
  get lineShown(): boolean {
    const line = this.game.line;
    return (
      line === null ||
      this.settings.textCps <= 0 ||
      this.shownKey === line.key ||
      (this.skipping && this.passable)
    );
  }

  /**
   * The options to pick from, once the prompt has been read — so a prompt is never cut short; at
   * once for a choice without one. Null when there is nothing to pick yet.
   */
  get choiceOptions(): OptionView[] | null {
    return this.promptPending ? null : this.game.choiceOptions;
  }

  /** What Auto or Skip does next and when; null while it waits — for the typewriter or the player. */
  get nextStep(): ModeStep | null {
    const interaction = this.game.interaction;
    const line = this.game.line;
    const lineKey = line?.key ?? null;
    if (interaction?.type !== 'say' && interaction?.type !== 'choice') {
      return null;
    }
    if (this.skipping) {
      if (interaction.type === 'choice') {
        // A choice stops Skip; a prompt read before comes out read first, with its options.
        if (this.promptPending && this.passable) {
          return { action: 'reveal', delayMs: SKIP_DELAY_MS, lineKey };
        }
        return this.mode === 'skip' ? { action: 'stop', delayMs: 0, lineKey } : null;
      }
      if (this.passable) {
        return { action: 'advance', delayMs: SKIP_DELAY_MS, lineKey };
      }
      // An unread line stops Skip: the player reads it. Held Ctrl waits on it instead.
      return this.mode === 'skip' ? { action: 'stop', delayMs: 0, lineKey } : null;
    }
    if (this.mode !== 'auto' || !line || !this.lineShown) {
      return null;
    }
    const delayMs = autoForwardMs(line.text.length, this.settings);
    if (interaction.type === 'choice') {
      // The prompt is read by itself; the pick is the player's.
      return this.promptPending ? { action: 'reveal', delayMs, lineKey } : null;
    }
    return { action: 'advance', delayMs, lineKey };
  }

  /** The time of `nextStep` has come: does it. */
  step() {
    const next = this.nextStep;
    if (next?.action === 'advance') {
      this.advanceLine();
    } else if (next?.action === 'reveal') {
      this.readPrompt();
    } else if (next?.action === 'stop') {
      this.setMode(null);
    }
  }

  /** The typewriter has typed out the line under `key`. A line already gone is left alone. */
  lineTyped(key: string) {
    if (this.game.line?.key === key) {
      this.shownKey = key;
    }
  }

  /** Shows the rest of the line at once. */
  finishLine() {
    this.shownKey = this.game.line?.key ?? null;
  }

  /**
   * A click on the stage, Space or Enter. With Auto or Skip on, it ends them and does nothing
   * else (Ren'Py's `afm_after_click = False`, and its click while skipping). Otherwise: while the
   * line is still typing, show it whole; once it is whole, go on. At a choice, going on means the
   * prompt has been read: the options come out.
   */
  requestAdvance() {
    if (this.mode) {
      this.setMode(null);
    } else if (!this.lineShown) {
      this.finishLine();
    } else if (this.promptPending) {
      this.readPrompt();
    } else {
      this.advanceLine();
    }
  }

  /** The player picked an option, by its `OptionView.index`. Auto goes on after it; Skip doesn't. */
  choose(index: number) {
    this.markLineRead();
    this.game.choose(index);
  }

  /**
   * Keys 1–9: picks the option in that place among those on screen — hidden ones don't count.
   * False when there is no such option out, so the key goes on to do whatever else it does.
   */
  pickOption(place: number): boolean {
    const option = this.choiceOptions?.[place - 1];
    if (!option) {
      return false;
    }
    this.choose(option.index);
    return true;
  }

  /**
   * «Назад», the wheel up, PageUp: the previous line, shown whole — it was read already — and a
   * choice with its options out, to pick again. Auto and Skip end.
   */
  rollBack() {
    this.stopModes();
    if (this.game.rollBack()) {
      this.showWhole();
    }
  }

  /** The wheel down, PageDown: forward along the way already read, each line shown whole. */
  rollForward() {
    this.stopModes();
    if (this.game.rollForward()) {
      this.showWhole();
    }
  }

  toggleAuto() {
    this.setMode(this.mode === 'auto' ? null : 'auto');
  }

  toggleSkip() {
    this.setMode(this.mode === 'skip' ? null : 'skip');
  }

  /** Ctrl went down or up. */
  holdSkip(held: boolean) {
    this.pinLine();
    this.skipHeld = held;
  }

  /** Both off: the player left the game screen, opened the game menu, or the game ended. */
  stopModes() {
    this.pinLine();
    this.mode = null;
    this.skipHeld = false;
  }

  private setMode(mode: ReadingMode | null) {
    this.pinLine();
    this.mode = mode;
  }

  /** A line Skip is passing stays whole when Skip stops on it: no typing it out again. */
  private pinLine() {
    if (this.skipping && this.passable) {
      this.finishLine();
    }
  }

  private readPrompt() {
    this.readPromptKey = this.game.line?.key ?? null;
  }

  /** A line come back to: whole at once, and a choice's options out. */
  private showWhole() {
    this.finishLine();
    if (this.promptPending) {
      this.readPrompt();
    }
  }

  /** On to the next line; the one left is read from now on. */
  private advanceLine() {
    this.markLineRead();
    this.game.advance();
  }

  /** Ren'Py marks a line seen once the player has gone past it, not while it is on screen. */
  private markLineRead() {
    const line = this.game.line;
    const sceneId = this.game.state?.position.sceneId;
    if (line && sceneId !== undefined) {
      this.persistent.markRead(sceneId, line.text);
    }
  }

  /** Skip may pass the line on screen: it was read before, or the player skips everything. */
  private get passable(): boolean {
    return this.settings.skipMode === 'all' || this.lineRead;
  }

  /** A choice with a prompt the player hasn't clicked past yet. */
  private get promptPending(): boolean {
    const line = this.game.line;
    return this.game.choiceOptions !== null && line !== null && this.readPromptKey !== line.key;
  }
}
