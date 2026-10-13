import { useEffect, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useStores } from '@/shared/lib/stores/useStores';
import { useTypewriter } from '@/shared/lib/useTypewriter';
import { isSystemControl } from './isSystemControl';

/**
 * Turns the player's clicks and keys into the reading store's commands; how far the line is read
 * and what going on means live there (`ReadingStore`). A click anywhere on the stage, Space or
 * Enter all request the advance; keys 1–9 pick an option once the options are out. Ren'Py's
 * keys for Skip: Tab turns it on and off, Ctrl skips while held. Clicks and keys aimed at system
 * controls belong to those controls; while a window is open over the game, none reach it. Esc
 * opens the game menu, as in Ren'Py: the settings and the way to the main menu are there.
 *
 * Here too runs the typewriter, which reports to the store when the line has typed out. The line
 * comes out translated: the store holds the Russian source, which is also the key of its
 * translation. Must be called from an `observer` component: it reads the stores.
 */
export function useAdvanceDialogue() {
  const { game, reading, ui, settings } = useStores();
  const { t } = useTranslation('story');
  const source = game.line;
  const line = source && {
    ...source,
    text: t(source.text),
    speaker: source.speaker && { ...source.speaker, name: t(source.speaker.name) },
  };
  const visibleText = useTypewriter(line?.text ?? '', settings.textCps, line?.key ?? '', {
    shown: reading.lineShown,
    onTyped: () => source && reading.lineTyped(source.key),
  });

  // Window listeners for the screen's lifetime: they read everything from the stores at the
  // moment of the key, so nothing in them goes stale between renders.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // The open window handles its keys, Esc included (it closes it before this sees it).
      if (ui.overlay) {
        return;
      }
      if (event.key === 'Escape') {
        ui.openGameMenu();
        return;
      }
      if (event.key === 'Control') {
        reading.holdSkip(true);
        return;
      }
      // Tab toggles Skip, unless the focus is already on a control: there it moves the focus
      // on, and Shift+Tab always does — the panel's buttons stay reachable from the keyboard.
      if (event.key === 'Tab' && !event.shiftKey && !event.altKey && !event.metaKey) {
        if (event.ctrlKey || isSystemControl(event.target)) {
          return;
        }
        event.preventDefault();
        if (!event.repeat) {
          reading.toggleSkip();
        }
        return;
      }
      // 1–9 pick the options on screen, in the order shown.
      if (/^[1-9]$/.test(event.key)) {
        if (!event.repeat && reading.pickOption(Number(event.key))) {
          event.preventDefault();
        }
        return;
      }
      if (event.key !== ' ' && event.key !== 'Enter') {
        return;
      }
      // A focused button handles Space and Enter itself; advancing too would double the action.
      if (isSystemControl(event.target)) {
        return;
      }
      event.preventDefault();
      // A held key auto-repeats: without this, holding Space would race through the scene.
      if (event.repeat) {
        return;
      }
      reading.requestAdvance();
    };
    // Ctrl let go — or never seen let go: Ctrl+Tab and the like take the window away first.
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Control') {
        reading.holdSkip(false);
      }
    };
    const onBlur = () => reading.holdSkip(false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      reading.holdSkip(false);
    };
  }, [ui, reading]);

  const onStageClick = (event: MouseEvent<HTMLElement>) => {
    if (!ui.overlay && !isSystemControl(event.target)) {
      reading.requestAdvance();
    }
  };

  return {
    line,
    visibleText,
    /** The options to pick from, once the prompt has been read; null otherwise. */
    choiceOptions: reading.choiceOptions,
    onStageClick,
  };
}
