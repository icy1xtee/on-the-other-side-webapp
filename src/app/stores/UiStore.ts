import { makeAutoObservable } from 'mobx';

export type Screen = 'menu' | 'game';

export type Notice = {
  /** Grows with every notice, so repeating the same text still restarts its timer. */
  id: number;
  text: string;
};

/** Which screen is shown. No router: a novel has a handful of screens and no URLs to share. */
export class UiStore {
  screen: Screen = 'menu';
  /** A short message over the game — for now, "coming soon" from the stub buttons. */
  notice: Notice | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  showGame() {
    this.screen = 'game';
  }

  showMenu() {
    this.screen = 'menu';
  }

  showNotice(text: string) {
    this.notice = { id: (this.notice?.id ?? 0) + 1, text };
  }

  hideNotice() {
    this.notice = null;
  }
}
