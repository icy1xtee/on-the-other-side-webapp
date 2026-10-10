import {
  advance,
  choose,
  createSave,
  parseSave,
  resolveText,
  restoreSave,
  run,
  startGame,
  type GameState,
  type Interaction,
  type RunResult,
  type SceneRegistry,
  type SpritePosition,
  type VarValue,
} from '@engine';
import { makeAutoObservable, observable } from 'mobx';
import type { StorageSlot } from '@/shared/lib/storage';

/** What turns the engine's ids into pictures and names. Supplied by content at boot. */
export type Presentation = {
  speakers: Readonly<Record<string, { name: string }>>;
  assets: {
    backgrounds: Readonly<Record<string, string>>;
    characters: Readonly<Record<string, Readonly<Record<string, string>>>>;
    portraits: Readonly<Record<string, string>>;
  };
};

export type SpriteView = {
  tag: string;
  src: string | undefined;
  at: SpritePosition;
};

export type LineView = {
  /**
   * Changes with every line, even when two lines read the same or the story comes back to the
   * same step: restarts the typewriter and the reading of a choice's prompt.
   */
  key: string;
  speaker: { name: string; portrait: string | undefined } | null;
  text: string;
};

export type OptionView = {
  /** The option's place among all the choice's options, hidden ones included: what `choose` takes. */
  index: number;
  text: string;
};

export type GameStoreOptions = {
  registry: SceneRegistry;
  variableDefaults: Readonly<Record<string, VarValue>>;
  presentation: Presentation;
  /** Where the autosave lives. It may refuse to work: the game then plays on without saves. */
  saveSlot: StorageSlot;
  /** Called when the script runs out — Ren'Py goes back to the main menu then. */
  onEnd: () => void;
  /** Called once, the first time an autosave can't be written: the player should know. */
  onSaveUnavailable?: () => void;
};

/**
 * MobX wrapper around the pure engine. The engine returns a new state on every step; the store
 * swaps it in whole (`observable.ref`), so observers react to the change of the snapshot rather
 * than to deep mutations, and a save is simply `state`. Computed views resolve ids into files and
 * names, so the UI never sees content ids.
 *
 * One save slot, written on every line and choice — Ren'Py's "saving occurs at the start of a
 * statement". "Продолжить" resumes from it.
 */
export class GameStore {
  state: GameState | null = null;
  interaction: Interaction | null = null;
  /**
   * Where "Продолжить" resumes: the last line or choice of this session, or the autosave found
   * at boot. Kept in memory too, so the menu's Continue works even when storage doesn't.
   */
  resumable: GameState | null = null;
  /** Counts what the player has been shown, so a key changes even on coming back to a step. */
  private turn = 0;
  private saveUnavailableReported = false;
  private readonly options: GameStoreOptions;

  constructor(options: GameStoreOptions) {
    this.options = options;
    makeAutoObservable<this, 'options' | 'saveUnavailableReported'>(
      this,
      {
        state: observable.ref,
        interaction: observable.ref,
        resumable: observable.ref,
        options: false,
        saveUnavailableReported: false,
      },
      { autoBind: true },
    );
    this.resumable = this.readSave();
  }

  get canContinue(): boolean {
    return this.resumable !== null;
  }

  /** Background image URL. */
  get background(): string | undefined {
    const id = this.state?.stage.background;
    return id ? this.options.presentation.assets.backgrounds[id] : undefined;
  }

  /** Sprites in z-order, with their image URLs. */
  get sprites(): SpriteView[] {
    const { characters } = this.options.presentation.assets;
    return (this.state?.stage.sprites ?? []).map(({ tag, emotion, at }) => ({
      tag,
      at,
      src: characters[tag]?.[emotion],
    }));
  }

  /** The line on screen: the one the player is reading, or the prompt of the current choice. */
  get line(): LineView | null {
    const current = this.interaction;
    const shown =
      current?.type === 'say' ? current : current?.type === 'choice' ? current.prompt : undefined;
    if (!this.state || !shown) {
      return null;
    }
    const { speakers, assets } = this.options.presentation;
    const { speaker, text } = shown;
    const { sceneId, step } = this.state.position;
    return {
      key: `${sceneId}:${step}:${this.turn}`,
      speaker: speaker
        ? { name: speakers[speaker]?.name ?? speaker, portrait: assets.portraits[speaker] }
        : null,
      text: resolveText(text),
    };
  }

  /**
   * The options of the current choice the player may pick, or null when there is no choice.
   * Options ruled out by their condition are left out — hidden, as in Ren'Py.
   */
  get choiceOptions(): OptionView[] | null {
    if (this.interaction?.type !== 'choice') {
      return null;
    }
    return this.interaction.options.flatMap((option, index) =>
      option.available ? [{ index, text: resolveText(option.text) }] : [],
    );
  }

  newGame() {
    this.apply(startGame(this.options.registry, this.options.variableDefaults));
  }

  /**
   * Picks the game up where it was left: on the same line or choice, with the same stage, vars
   * and music. Runs just that one statement — no replay. False when there is nothing to resume.
   */
  continueGame(): boolean {
    if (!this.resumable) {
      return false;
    }
    this.apply(run(this.resumable, this.options.registry));
    return true;
  }

  /** Saves the game as it stands now — the Save button. False when storage refused. */
  saveNow(): boolean {
    return this.state !== null && this.interaction?.type !== 'end' && this.writeSave(this.state);
  }

  /** The player clicked through the current line. Ignored when there is no line to pass. */
  advance() {
    if (!this.state || this.interaction?.type !== 'say') {
      return;
    }
    this.apply(advance(this.state, this.options.registry));
  }

  /** The player picked an option, by its `OptionView.index`. Ignored when there is no choice. */
  choose(index: number) {
    if (!this.state || this.interaction?.type !== 'choice') {
      return;
    }
    this.apply(choose(this.state, this.options.registry, index));
  }

  private apply(result: RunResult) {
    this.turn += 1;
    this.state = result.state;
    this.interaction = result.interaction;
    // result.effects (music, sfx) are dropped until the audio layer arrives in stage 6.
    if (result.interaction.type === 'end') {
      // The playthrough is over: nothing is left to continue.
      this.resumable = null;
      this.options.saveSlot.clear();
      this.options.onEnd();
    } else if (!this.writeSave(result.state) && !this.saveUnavailableReported) {
      this.saveUnavailableReported = true;
      this.options.onSaveUnavailable?.();
    }
  }

  private writeSave(state: GameState): boolean {
    this.resumable = state;
    const save = createSave(state, this.options.registry, Date.now());
    return this.options.saveSlot.write(JSON.stringify(save));
  }

  /** The autosave found at boot, if it can be resumed. A broken one is logged and ignored. */
  private readSave(): GameState | null {
    const text = this.options.saveSlot.read();
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
    }
    return state;
  }
}
