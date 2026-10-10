import { makeAutoObservable } from 'mobx';

export type Screen = 'menu' | 'game';

/** A window over the screen: the settings, or "start a new game over the saved one?". */
export type Overlay = 'settings' | 'confirmNewGame';

export type Notice = {
  /** Grows with every notice, so repeating the same text still restarts its timer. */
  id: number;
  text: string;
};

/** Which screen is shown. No router: a novel has a handful of screens and no URLs to share. */
export class UiStore {
  screen: Screen = 'menu';
  /** What lies over the screen; while it is open, the game behind it takes no clicks or keys. */
  overlay: Overlay | null = null;
  /** A short message over the game — "coming soon" from stub buttons, "saved", and the like. */
  notice: Notice | null = null;

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  showGame() {
    this.screen = 'game';
    this.overlay = null;
  }

  showMenu() {
    this.screen = 'menu';
    this.overlay = null;
  }

  openSettings() {
    this.overlay = 'settings';
  }

  confirmNewGame() {
    this.overlay = 'confirmNewGame';
  }

  closeOverlay() {
    this.overlay = null;
  }

  showNotice(text: string) {
    this.notice = { id: (this.notice?.id ?? 0) + 1, text };
  }

  hideNotice() {
    this.notice = null;
  }
}
