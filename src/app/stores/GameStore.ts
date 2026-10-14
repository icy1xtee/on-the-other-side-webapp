import {
  advance,
  arrive,
  choose,
  goesTheSameWay,
  rollBack,
  rollForward,
  run,
  shownEntries,
  startGame,
  startTimeline,
  type GameState,
  type Interaction,
  type RunResult,
  type SceneRegistry,
  type Timeline,
  type VarValue,
} from '@engine';
import { makeAutoObservable, observable } from 'mobx';
import type { AudioOutput } from '@/shared/lib/audio';
import { playEffects } from './audioEffects';
import {
  frameView,
  historyView,
  lineView,
  optionViews,
  sceneTitle,
  type FrameView,
  type HistoryView,
  type LineView,
  type OptionView,
  type Presentation,
} from './presentation';
import type { SavedGame, SaveStore } from './SaveStore';

export type GameStoreOptions = {
  registry: SceneRegistry;
  variableDefaults: Readonly<Record<string, VarValue>>;
  presentation: Presentation;
  /** Plays the music and sounds the story asks for. */
  audio: AudioOutput;
  /** Autosaves every line and choice, and holds the games to load. */
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
 *
 * It also keeps the way the player has come (the engine's timeline): the history read so far and
 * the checkpoints rollback returns to, as in Ren'Py. Saves hold it whole.
 */
export class GameStore {
  state: GameState | null = null;
  interaction: Interaction | null = null;
  /** The way taken in this game: the history and the checkpoints; null before a game. */
  timeline: Timeline | null = null;
  /**
   * The line on screen was reached by rolling back or forward, or by loading, not by playing on:
   * the frame changes at once — Ren'Py shows no transition on rollback, nor after a load.
   */
  travelled = false;
  /** Counts what the player has been shown, so a key changes even on coming back to a step. */
  private turn = 0;
  private readonly options: GameStoreOptions;

  constructor(options: GameStoreOptions) {
    this.options = options;
    makeAutoObservable<this, 'options'>(
      this,
      {
        state: observable.ref,
        interaction: observable.ref,
        timeline: observable.ref,
        options: false,
      },
      { autoBind: true },
    );
  }

  /** There is a line or choice to roll back to. */
  get canRollBack(): boolean {
    return (this.timeline?.current ?? 0) > 0;
  }

  /** There is a way forward the player rolled back over. */
  get canRollForward(): boolean {
    const timeline = this.timeline;
    return timeline !== null && timeline.current < timeline.checkpoints.length - 1;
  }

  /** The lines read and the choices made in this game, oldest first: the History section. */
  get history(): HistoryView[] {
    return historyView(this.timeline?.history ?? [], this.options.presentation);
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

  newGame() {
    this.options.saves.startPlaying(0);
    this.apply(startGame(this.options.registry, this.options.variableDefaults), { fresh: true });
  }

  /**
   * Picks a saved game up — Continue, Load: on its line or choice, with its stage, vars and music,
   * its history and its way back and forward. Runs just that one statement — no replay, so no
   * sounds; the music comes back from the state, and `ifChanged` keeps a track that already
   * plays. The autosave takes the loaded game at once, as Ren'Py's does from its first line.
   */
  resume(saved: SavedGame) {
    this.options.saves.startPlaying(saved.playTime);
    this.travel(saved.timeline);
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
    const option = this.interaction.options[index];
    this.apply(choose(this.state, this.options.registry, index), {
      chosen: option && { index, text: option.text },
    });
  }

  /**
   * Back to the previous line or choice — Ren'Py's rollback: the stage, vars and music as they
   * were there, at once, without the sounds met on the way; a choice can be made again. False
   * when there is no way back.
   */
  rollBack(): boolean {
    return this.travel(this.timeline && rollBack(this.timeline));
  }

  /**
   * Forward along the way already taken — a choice passed with the same pick — the way rollback
   * goes back. False at the newest line.
   */
  rollForward(): boolean {
    return this.travel(this.timeline && rollForward(this.timeline));
  }

  private travel(timeline: Timeline | null): boolean {
    const checkpoint = timeline?.checkpoints[timeline.current];
    if (!timeline || !checkpoint) {
      return false;
    }
    const result = run(checkpoint.state, this.options.registry);
    this.timeline = timeline;
    this.travelled = true;
    this.turn += 1;
    this.state = result.state;
    this.interaction = result.interaction;
    this.restoreMusic(result.state);
    this.options.saves.autosave(timeline);
    return true;
  }

  /**
   * The story moved on by itself or by the player: plays what it met on the way, writes the new
   * line into the way taken — the same way as before keeps the way forward — and autosaves it.
   */
  private apply(
    result: RunResult,
    { fresh = false, chosen }: { fresh?: boolean; chosen?: { index: number; text: string } } = {},
  ) {
    const { saves, audio, presentation, onEnd } = this.options;
    this.turn += 1;
    this.travelled = false;
    this.state = result.state;
    this.interaction = result.interaction;
    playEffects(result.effects, audio, presentation.assets);
    if (result.interaction.type === 'end') {
      this.timeline = null;
      saves.forget();
      onEnd();
      return;
    }
    const checkpoint = {
      state: result.state,
      entries: [
        ...(chosen ? [{ kind: 'choice' as const, text: chosen.text }] : []),
        ...shownEntries(result.interaction),
      ],
    };
    const before = this.timeline;
    const sameWay = before && goesTheSameWay(before, chosen?.index) ? rollForward(before) : null;
    const timeline =
      fresh || !before
        ? startTimeline(checkpoint)
        : (sameWay ?? arrive(before, checkpoint, chosen?.index));
    this.timeline = timeline;
    saves.autosave(timeline);
  }

  /** The track a state plays, restarted only if another one plays now. */
  private restoreMusic(state: GameState) {
    const { audio, presentation } = this.options;
    const music = state.audio.music;
    playEffects([{ type: 'music', asset: music, ifChanged: true }], audio, presentation.assets);
  }
}
