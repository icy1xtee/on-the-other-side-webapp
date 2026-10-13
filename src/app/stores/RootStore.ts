import type { SceneRegistry, VarValue } from '@engine';
import i18next from 'i18next';
import { autorun, reaction } from 'mobx';
import { GameStore } from '@/app/stores/GameStore';
import type { Presentation } from '@/app/stores/presentation';
import { ReadingStore } from '@/app/stores/ReadingStore';
import { SaveStore } from '@/app/stores/SaveStore';
import { SettingsStore } from '@/app/stores/SettingsStore';
import { UiStore } from '@/app/stores/UiStore';
import type { AudioOutput } from '@/shared/lib/audio';
import type { StorageSlot } from '@/shared/lib/storage';

/** The main menu's art: a background over the whole window and a character beside the menu. */
export type MenuArt = {
  background: string;
  character: string;
};

export type RootStoreOptions = {
  registry: SceneRegistry;
  variableDefaults: Readonly<Record<string, VarValue>>;
  presentation: Presentation;
  audio: AudioOutput;
  /** Where the autosave lives. It may refuse to work: the game then plays on without saves. */
  saveSlot: StorageSlot;
  /** Where the settings live — apart from the save: they outlive every playthrough. */
  settingsSlot: StorageSlot;
  menuArt: MenuArt;
  /** The clock, in milliseconds since the epoch; tests pass their own. */
  now?: () => number;
};

/** Owns every store and the actions that span several of them. */
export class RootStore {
  readonly ui = new UiStore();
  readonly settings: SettingsStore;
  readonly saves: SaveStore;
  readonly game: GameStore;
  readonly reading: ReadingStore;
  readonly menuArt: MenuArt;
  private readonly options: RootStoreOptions;

  constructor(options: RootStoreOptions) {
    const {
      registry,
      variableDefaults,
      presentation,
      audio,
      saveSlot,
      settingsSlot,
      menuArt,
      now,
    } = options;
    this.options = options;
    this.menuArt = menuArt;
    this.settings = new SettingsStore(settingsSlot);
    this.saves = new SaveStore({
      registry,
      variableDefaults,
      slot: saveSlot,
      now,
      // Say it once: in a private window the player would otherwise trust a save that isn't there.
      onUnavailable: () => this.ui.showNotice(i18next.t('notice.autosaveUnavailable')),
    });
    this.game = new GameStore({
      registry,
      variableDefaults,
      presentation,
      audio,
      saves: this.saves,
      onEnd: this.toMainMenu,
    });
    this.reading = new ReadingStore(this.game, this.settings);

    // Settings apply at once: the volumes while a slider moves, the language on a click.
    autorun(() => audio.setVolumes(this.settings.volumes));
    autorun(() => audio.setMuted(this.settings.muted));
    reaction(
      () => this.settings.language,
      (language) => void i18next.changeLanguage(language),
    );
  }

  /**
   * "Новая игра" from the menu. With a game to continue it asks first: the new game's first line
   * overwrites the autosave.
   */
  requestNewGame = () => {
    if (this.saves.canContinue) {
      this.ui.confirmNewGame();
    } else {
      this.newGame();
    }
  };

  /** Starts over — the game screen first, so a story that ends at once still lands in the menu. */
  newGame = () => {
    this.ui.showGame();
    this.game.newGame();
  };

  /** "Продолжить": back to the last line or choice; the menu stays if there is none. */
  continueGame = () => {
    this.ui.showGame();
    if (!this.game.continueGame()) {
      this.ui.showMenu();
    }
  };

  /** Back to the main menu, which has no music of its own: the game's track fades out. */
  toMainMenu = () => {
    this.options.audio.playMusic(null);
    this.ui.showMenu();
  };
}

// Lower layers see the stores through `AppStores` from shared/, never through this file.
declare module '@/shared/lib/stores/AppStores' {
  interface AppStores extends RootStore {}
}
