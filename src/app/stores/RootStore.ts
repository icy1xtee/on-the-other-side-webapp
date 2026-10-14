import type { SceneRegistry, VarValue } from '@engine';
import i18next from 'i18next';
import { autorun, reaction } from 'mobx';
import { GameStore } from '@/app/stores/GameStore';
import { PersistentStore } from '@/app/stores/PersistentStore';
import type { Presentation } from '@/app/stores/presentation';
import { ReadingStore } from '@/app/stores/ReadingStore';
import { SaveStore } from '@/app/stores/SaveStore';
import { SettingsStore } from '@/app/stores/SettingsStore';
import { UiStore } from '@/app/stores/UiStore';
import type { LoadSource, SaveSlot } from '@/shared/config/saveSlots';
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
  /**
   * Where each save lives — the autosave, the slots. Storage may refuse to work: the game then
   * plays on without saves.
   */
  saveStorage: (source: LoadSource) => StorageSlot;
  /** Where the settings live — apart from the save: they outlive every playthrough. */
  settingsSlot: StorageSlot;
  /** Where `persistent` lives — what the player has read, across playthroughs. */
  persistentSlot: StorageSlot;
  menuArt: MenuArt;
  /** The main menu's track, a file — Ren'Py's `config.main_menu_music`; null for silence. */
  menuMusic: string | null;
  /** The clock, in milliseconds since the epoch; tests pass their own. */
  now?: () => number;
};

/** Owns every store and the actions that span several of them. */
export class RootStore {
  readonly ui = new UiStore();
  readonly settings: SettingsStore;
  readonly persistent: PersistentStore;
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
      saveStorage,
      settingsSlot,
      persistentSlot,
      menuArt,
      now,
    } = options;
    this.options = options;
    this.menuArt = menuArt;
    this.settings = new SettingsStore(settingsSlot);
    this.persistent = new PersistentStore(persistentSlot);
    this.saves = new SaveStore({
      registry,
      variableDefaults,
      presentation,
      storage: saveStorage,
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
    this.reading = new ReadingStore(this.game, this.settings, this.persistent);

    // Auto and Skip run only while the player is in the game with no window over it: the game
    // menu, the main menu — and so the end of the game — stop them.
    reaction(
      () => this.ui.screen === 'game' && this.ui.overlay === null,
      (inGame) => {
        if (!inGame) {
          this.reading.stopModes();
        }
      },
    );

    // Settings apply at once: the volumes while a slider moves, the language on a click.
    autorun(() => audio.setVolumes(this.settings.volumes));
    autorun(() => audio.setMuted(this.settings.muted));
    reaction(
      () => this.settings.language,
      (language) => void i18next.changeLanguage(language),
    );

    // The game opens on the main menu, and so with its track.
    this.playMenuMusic();
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

  /** "Продолжить": back to the last line or choice — the autosave. */
  continueGame = () => {
    this.loadGame('auto');
  };

  /**
   * A slot picked in the Save section: an empty one takes the game at once, one with a save in
   * it asks first.
   */
  requestSave = (slot: SaveSlot) => {
    if (this.saves.game(slot)) {
      this.ui.ask({ type: 'overwrite', slot });
    } else {
      this.saveTo(slot);
    }
  };

  /**
   * A save picked in the Load section. From the main menu it loads at once; in the game it asks
   * first — the game on screen gives way to it.
   */
  requestLoad = (source: LoadSource) => {
    if (this.ui.screen === 'game') {
      this.ui.ask({ type: 'load', source });
    } else {
      this.loadGame(source);
    }
  };

  /** The bin on a slot, or Delete on it: asks first. */
  requestDelete = (slot: SaveSlot) => {
    this.ui.ask({ type: 'delete', slot });
  };

  /** "Yes" to the question over the game menu: does what it asked about. */
  confirmQuestion = () => {
    const overlay = this.ui.overlay;
    const question = overlay?.type === 'gameMenu' ? overlay.question : null;
    if (!question) {
      return;
    }
    this.ui.dismissQuestion();
    if (question.type === 'overwrite') {
      this.saveTo(question.slot);
    } else if (question.type === 'delete') {
      this.saves.deleteSlot(question.slot);
    } else {
      this.loadGame(question.source);
    }
  };

  /** Puts the game on screen into a slot and says how it went. */
  private saveTo(slot: SaveSlot) {
    const saved = this.saves.saveTo(slot);
    this.ui.showNotice(
      saved ? i18next.t('notice.savedToSlot', { slot }) : i18next.t('notice.saveFailed'),
      saved ? 'info' : 'error',
    );
  }

  /** Plays a saved game from where it was saved; nothing happens if there is none there. */
  private loadGame(source: LoadSource) {
    const saved = this.saves.game(source);
    if (!saved) {
      return;
    }
    this.ui.showGame();
    this.game.resume(saved);
  }

  /** Back to the main menu: as in Ren'Py, the sounds stop there and the menu's track plays. */
  toMainMenu = () => {
    this.options.audio.stopSounds();
    this.playMenuMusic();
    this.ui.showMenu();
  };

  /**
   * The menu's track, as Ren'Py plays it — `if_changed`: the game's track goes on if it is the
   * same one, and the menu → game → menu round has no break in the music.
   */
  private playMenuMusic() {
    this.options.audio.playMusic(this.options.menuMusic, { ifChanged: true });
  }
}

// Lower layers see the stores through `AppStores` from shared/, never through this file.
declare module '@/shared/lib/stores/AppStores' {
  interface AppStores extends RootStore {}
}
