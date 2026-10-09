import {
  advance,
  startGame,
  type GameState,
  type Interaction,
  type RunResult,
  type SceneRegistry,
  type VarValue,
} from '@engine';
import { makeAutoObservable, observable } from 'mobx';

export type GameStoreOptions = {
  registry: SceneRegistry;
  variableDefaults: Readonly<Record<string, VarValue>>;
  /** Called when the script runs out — Ren'Py goes back to the main menu then. */
  onEnd: () => void;
};

/**
 * MobX wrapper around the pure engine. The engine returns a new state on every step; the store
 * swaps it in whole (`observable.ref`), so observers react to the change of the snapshot rather
 * than to deep mutations, and a save is simply `state`.
 */
export class GameStore {
  state: GameState | null = null;
  interaction: Interaction | null = null;
  private readonly options: GameStoreOptions;

  constructor(options: GameStoreOptions) {
    this.options = options;
    makeAutoObservable<this, 'options'>(
      this,
      { state: observable.ref, interaction: observable.ref, options: false },
      { autoBind: true },
    );
  }

  /** What is on screen: background and sprites. */
  get stage() {
    return this.state?.stage ?? null;
  }

  /** The current line, if the player is reading one. */
  get line() {
    return this.interaction?.type === 'say' ? this.interaction : null;
  }

  newGame() {
    this.apply(startGame(this.options.registry, this.options.variableDefaults));
  }

  /** The player clicked through the current line. Ignored when there is no line to pass. */
  advance() {
    if (!this.state || this.interaction?.type !== 'say') {
      return;
    }
    this.apply(advance(this.state, this.options.registry));
  }

  private apply(result: RunResult) {
    this.state = result.state;
    this.interaction = result.interaction;
    // result.effects (music, sfx) are dropped until the audio layer arrives in stage 6.
    if (result.interaction.type === 'end') {
      this.options.onEnd();
    }
  }
}
