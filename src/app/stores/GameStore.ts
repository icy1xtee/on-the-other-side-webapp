import {
  advance,
  resolveText,
  startGame,
  type GameState,
  type Interaction,
  type RunResult,
  type SceneRegistry,
  type SpritePosition,
  type VarValue,
} from '@engine';
import { makeAutoObservable, observable } from 'mobx';

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
  /** Changes with every line, even when two lines read the same: restarts the typewriter. */
  key: string;
  speaker: { name: string; portrait: string | undefined } | null;
  text: string;
};

export type GameStoreOptions = {
  registry: SceneRegistry;
  variableDefaults: Readonly<Record<string, VarValue>>;
  presentation: Presentation;
  /** Called when the script runs out — Ren'Py goes back to the main menu then. */
  onEnd: () => void;
};

/**
 * MobX wrapper around the pure engine. The engine returns a new state on every step; the store
 * swaps it in whole (`observable.ref`), so observers react to the change of the snapshot rather
 * than to deep mutations, and a save is simply `state`. Computed views resolve ids into files and
 * names, so the UI never sees content ids.
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

  /** The current line, if the player is reading one. */
  get line(): LineView | null {
    if (!this.state || this.interaction?.type !== 'say') {
      return null;
    }
    const { speakers, assets } = this.options.presentation;
    const { speaker, text } = this.interaction;
    const { sceneId, step } = this.state.position;
    return {
      key: `${sceneId}:${step}`,
      speaker: speaker
        ? { name: speakers[speaker]?.name ?? speaker, portrait: assets.portraits[speaker] }
        : null,
      text: resolveText(text),
    };
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
