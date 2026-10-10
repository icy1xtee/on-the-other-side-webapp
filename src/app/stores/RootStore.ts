import i18next from 'i18next';
import { autorun, reaction } from 'mobx';
import { GameStore, type GameStoreOptions } from '@/app/stores/GameStore';
import { SettingsStore } from '@/app/stores/SettingsStore';
import { UiStore } from '@/app/stores/UiStore';
import type { StorageSlot } from '@/shared/lib/storage';

export type RootStoreOptions = Omit<GameStoreOptions, 'onEnd' | 'onSaveUnavailable'> & {
  /** Where the settings live — apart from the save: they outlive every playthrough. */
  settingsSlot: StorageSlot;
};

/** Owns every store and the actions that span several of them. */
export class RootStore {
  readonly ui = new UiStore();
  readonly settings: SettingsStore;
  readonly game: GameStore;
  private readonly options: RootStoreOptions;

  constructor(options: RootStoreOptions) {
    const { settingsSlot, ...gameOptions } = options;
    this.options = options;
    this.settings = new SettingsStore(settingsSlot);
    this.game = new GameStore({
      ...gameOptions,
      onEnd: this.toMainMenu,
      // Say it once: in a private window the player would otherwise trust a save that isn't there.
      onSaveUnavailable: () => this.ui.showNotice(i18next.t('notice.autosaveUnavailable')),
    });

    // Settings apply at once: the volumes while a slider moves, the language on a click.
    autorun(() => options.audio.setVolumes(this.settings.volumes));
    reaction(
      () => this.settings.language,
      (language) => void i18next.changeLanguage(language),
    );
  }

  /**
   * "Новая игра" from the menu. With a game to continue it asks first: there is one save slot,
   * and the new game's first line would overwrite it.
   */
  requestNewGame = () => {
    if (this.game.canContinue) {
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
