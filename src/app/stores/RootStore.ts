import { GameStore, type GameStoreOptions } from '@/app/stores/GameStore';
import { UiStore } from '@/app/stores/UiStore';

export type RootStoreOptions = Pick<GameStoreOptions, 'registry' | 'variableDefaults'>;

/** Owns every store and the actions that span several of them. */
export class RootStore {
  readonly ui = new UiStore();
  readonly game: GameStore;

  constructor({ registry, variableDefaults }: RootStoreOptions) {
    this.game = new GameStore({ registry, variableDefaults, onEnd: this.ui.showMenu });
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
