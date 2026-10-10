import i18next from 'i18next';
import { GameStore, type GameStoreOptions } from '@/app/stores/GameStore';
import { UiStore } from '@/app/stores/UiStore';

export type RootStoreOptions = Omit<GameStoreOptions, 'onEnd' | 'onSaveUnavailable'>;

/** Owns every store and the actions that span several of them. */
export class RootStore {
  readonly ui = new UiStore();
  readonly game: GameStore;

  constructor(options: RootStoreOptions) {
    this.game = new GameStore({
      ...options,
      onEnd: this.ui.showMenu,
      // Say it once: in a private window the player would otherwise trust a save that isn't there.
      onSaveUnavailable: () => this.ui.showNotice(i18next.t('notice.autosaveUnavailable')),
    });
  }

  /** "Новая игра": the game screen first, so a story that ends at once still lands in the menu. */
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
}

// Lower layers see the stores through `AppStores` from shared/, never through this file.
declare module '@/shared/lib/stores/AppStores' {
  interface AppStores extends RootStore {}
}
