import { makeAutoObservable } from 'mobx';
import type { GameStore } from './GameStore';
import type { OptionView } from './presentation';
import type { Settings } from './SettingsStore';

/**
 * How far the player has read what is on screen, and the single way the story moves on. The line
 * itself is the game's (`GameStore.line`); this store knows whether it is out in full and whether
 * the prompt of a choice has been read — the state Auto and Skip build on.
 *
 * The typewriter runs in the UI, on the frame clock (`useTypewriter`): it tells this store when a
 * line has typed out (`lineTyped`), and shows the line whole once this store says so
 * (`finishLine` — a click mid-line now, Skip and rollback later).
 */
export class ReadingStore {
  /** The key of the line out in full: typed to its end, or shown at once. */
  private shownKey: string | null = null;
  /** The key of the choice prompt the player has clicked past. */
  private readPromptKey: string | null = null;
  private readonly game: GameStore;
  private readonly settings: Pick<Settings, 'textCps'>;

  constructor(game: GameStore, settings: Pick<Settings, 'textCps'>) {
    this.game = game;
    this.settings = settings;
    makeAutoObservable<this, 'game' | 'settings'>(
      this,
      { game: false, settings: false },
      { autoBind: true },
    );
  }

  /** The whole line is out: typed to its end, shown at once by a click, or the text is instant. */
  get lineShown(): boolean {
    const line = this.game.line;
    return line === null || this.settings.textCps <= 0 || this.shownKey === line.key;
  }

  /**
   * The options to pick from, once the prompt has been read — so a prompt is never cut short; at
   * once for a choice without one. Null when there is nothing to pick yet.
   */
  get choiceOptions(): OptionView[] | null {
    return this.promptPending ? null : this.game.choiceOptions;
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
   * A click on the stage, Space or Enter: while the line is still typing, show it whole; once it
   * is whole, go on. At a choice, going on means the prompt has been read: the options come out.
   */
  requestAdvance() {
    const line = this.game.line;
    if (!this.lineShown) {
      this.finishLine();
    } else if (this.promptPending && line) {
      this.readPromptKey = line.key;
    } else {
      this.game.advance();
    }
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
    this.game.choose(option.index);
    return true;
  }

  /** A choice with a prompt the player hasn't clicked past yet. */
  private get promptPending(): boolean {
    const line = this.game.line;
    return this.game.choiceOptions !== null && line !== null && this.readPromptKey !== line.key;
  }
}
