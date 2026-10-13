import { makeAutoObservable } from 'mobx';
import type { MenuSection } from '@/shared/config/gameMenu';

export type Screen = 'menu' | 'game';

/** A window over the screen: the game menu on one of its parts, or "start over the saved game?". */
export type Overlay = { type: 'gameMenu'; section: MenuSection } | { type: 'confirmNewGame' };

/** `error` when something the player asked for failed — the toast then says so in red. */
export type NoticeTone = 'info' | 'error';

export type Notice = {
  /** Grows with every notice, so repeating the same text still restarts its timer. */
  id: number;
  text: string;
  tone: NoticeTone;
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

  /** Ren'Py's game menu, opened on one of its parts; from the main menu it is the same window. */
  openGameMenu(section: MenuSection = 'settings') {
    this.overlay = { type: 'gameMenu', section };
  }

  /** Another part of the open game menu. */
  showMenuSection(section: MenuSection) {
    if (this.overlay?.type === 'gameMenu') {
      this.overlay = { type: 'gameMenu', section };
    }
  }

  confirmNewGame() {
    this.overlay = { type: 'confirmNewGame' };
  }

  closeOverlay() {
    this.overlay = null;
  }

  showNotice(text: string, tone: NoticeTone = 'info') {
    this.notice = { id: (this.notice?.id ?? 0) + 1, text, tone };
  }

  hideNotice() {
    this.notice = null;
  }
}
