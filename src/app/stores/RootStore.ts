import { GameStore, type GameStoreOptions } from '@/app/stores/GameStore';
import { UiStore } from '@/app/stores/UiStore';

export type RootStoreOptions = Omit<GameStoreOptions, 'onEnd'>;

/** Owns every store and the actions that span several of them. */
export class RootStore {
  readonly ui = new UiStore();
  readonly game: GameStore;

  constructor(options: RootStoreOptions) {
    this.game = new GameStore({ ...options, onEnd: this.ui.showMenu });
  }

  /** "Новая игра": the game screen first, so a story that ends at once still lands in the menu. */
  newGame = () => {
    this.ui.showGame();
    this.game.newGame();
  };
}

// Lower layers see the stores through `AppStores` from shared/, never through this file.
declare module '@/shared/lib/stores/AppStores' {
  interface AppStores extends RootStore {}
}
