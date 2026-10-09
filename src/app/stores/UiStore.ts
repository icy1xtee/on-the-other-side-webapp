import { makeAutoObservable } from 'mobx';

export type Screen = 'menu' | 'game';

/** Which screen is shown. No router: a novel has a handful of screens and no URLs to share. */
export class UiStore {
  screen: Screen = 'menu';

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  showGame() {
    this.screen = 'game';
  }

  showMenu() {
    this.screen = 'menu';
  }
}
