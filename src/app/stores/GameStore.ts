import {
  advance,
  choose,
  run,
  startGame,
  type GameState,
  type Interaction,
  type RunResult,
  type SceneRegistry,
  type VarValue,
} from '@engine';
import { makeAutoObservable, observable } from 'mobx';
import type { AudioOutput } from '@/shared/lib/audio';
import { playEffects } from './audioEffects';
import {
  frameView,
  lineView,
  optionViews,
  quotedLine,
  sceneTitle,
  type FrameView,
  type LineView,
  type OptionView,
  type Presentation,
  type QuotedLine,
} from './presentation';
import type { SaveStore } from './SaveStore';

/** What "Продолжить" leads back to, for the menu's card. Text is the story's source, untranslated. */
export type ContinuePreview = {
  frame: FrameView;
  /** The line on screen there; null if the save stands on a choice without a prompt. */
  line: QuotedLine | null;
  /** Milliseconds since the epoch. */
  savedAt: number;
};

export type GameStoreOptions = {
  registry: SceneRegistry;
  variableDefaults: Readonly<Record<string, VarValue>>;
  presentation: Presentation;
  /** Plays the music and sounds the story asks for. */
  audio: AudioOutput;
  /** Autosaves every line and choice, and holds the game to continue. */
  saves: SaveStore;
  /** Called when the script runs out — Ren'Py goes back to the main menu then. */
  onEnd: () => void;
};

/**
 * The game loop: a MobX wrapper around the pure engine. The engine returns a new state on every
 * step; the store swaps it in whole (`observable.ref`), so observers react to the change of the
 * snapshot rather than to deep mutations, and a save is simply `state`. Its views turn ids into
 * files and names (`presentation.ts`), so the UI never sees content ids; what the engine met on
 * the way is played (`audioEffects.ts`) and the line reached is autosaved (`SaveStore`).
 */
export class GameStore {
  state: GameState | null = null;
  interaction: Interaction | null = null;
  /** Counts what the player has been shown, so a key changes even on coming back to a step. */
  private turn = 0;
  private readonly options: GameStoreOptions;

  constructor(options: GameStoreOptions) {
    this.options = options;
    makeAutoObservable<this, 'options'>(
      this,
      { state: observable.ref, interaction: observable.ref, options: false },
      { autoBind: true },
    );
  }

  /** The background and the sprites in z-order, as files. */
  get frame(): FrameView {
    return frameView(this.state, this.options.presentation);
  }

  /** The title of the scene being played, untranslated; empty for a scene without one. */
  get sceneTitle(): string {
    return sceneTitle(this.state, this.options.presentation);
  }

  /** The line on screen: the one the player is reading, or the prompt of the current choice. */
  get line(): LineView | null {
    if (!this.state) {
      return null;
    }
    const { sceneId, step } = this.state.position;
    return lineView(this.interaction, `${sceneId}:${step}:${this.turn}`, this.options.presentation);
  }

  /** The options of the current choice the player may pick, or null when there is no choice. */
  get choiceOptions(): OptionView[] | null {
    return optionViews(this.interaction);
  }

  /**
   * Where "Продолжить" leads: the picture and the line there. The line comes from running the
   * saved state — the same `run` Continue does, without its effects.
   */
  get continuePreview(): ContinuePreview | null {
    const resumable = this.options.saves.resumable;
    if (!resumable) {
      return null;
    }
    const { registry, presentation } = this.options;
    return {
      frame: frameView(resumable.state, presentation),
      line: quotedLine(run(resumable.state, registry).interaction, presentation),
      savedAt: resumable.savedAt,
    };
  }

  newGame() {
    this.options.saves.startPlaying(0);
    this.apply(startGame(this.options.registry, this.options.variableDefaults));
  }

  /**
   * Picks the game up where it was left: on the same line or choice, with the same stage, vars
   * and music. Runs just that one statement — no replay. False when there is nothing to resume.
   */
  continueGame(): boolean {
    const { saves, registry, audio, presentation } = this.options;
    const resumed = saves.resumable;
    if (!resumed) {
      return false;
    }
    saves.startPlaying(resumed.playTime);
    this.apply(run(resumed.state, registry));
    // Nothing was re-executed, so nothing re-played: the music comes back from the state.
    // `ifChanged`: coming back from the menu to the same scene, the track isn't restarted.
    const music = resumed.state.audio.music;
    playEffects([{ type: 'music', asset: music, ifChanged: true }], audio, presentation.assets);
    return true;
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
    const { saves, audio, presentation, onEnd } = this.options;
    this.turn += 1;
    this.state = result.state;
    this.interaction = result.interaction;
    playEffects(result.effects, audio, presentation.assets);
    if (result.interaction.type === 'end') {
      saves.forget();
      onEnd();
    } else {
      saves.autosave(result.state);
    }
  }
}
