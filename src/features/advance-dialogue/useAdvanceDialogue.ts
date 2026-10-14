import { useEffect, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useStores } from '@/shared/lib/stores/useStores';
import { useTypewriter } from '@/shared/lib/useTypewriter';
import { WHEEL_START, wheelStep } from '@/shared/lib/wheelSteps';
import { isSystemControl } from './isSystemControl';

/**
 * Turns the player's clicks and keys into the reading store's commands; how far the line is read
 * and what going on means live there (`ReadingStore`). A click anywhere on the stage, Space or
 * Enter all request the advance; keys 1–9 pick an option once the options are out. Ren'Py's
 * keys for Skip: Tab turns it on and off, Ctrl skips while held; for rollback: PageUp and the
 * wheel up go back, PageDown and the wheel down forward. Clicks and keys aimed at system
 * controls belong to those controls; while a window is open over the game, none reach it. Esc
 * opens the game menu on Save, as in Ren'Py.
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
  // The story's transition plays first: the line waits for the frame, then types out.
  const waiting = reading.transition !== null;
  const visibleText = useTypewriter(line?.text ?? '', settings.textCps, line?.key ?? '', {
    shown: reading.lineShown,
    held: waiting,
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
        ui.openGameMenu('save');
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
      // Ren'Py's rollback keys; held, they keep going.
      if (event.key === 'PageUp' || event.key === 'PageDown') {
        event.preventDefault();
        if (event.key === 'PageUp') {
          reading.rollBack();
        } else {
          reading.rollForward();
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
    // The wheel rolls back (up) and forward (down), a notch or a swipe a step. Over an open
    // window it scrolls the window instead.
    let wheel = WHEEL_START;
    const onWheel = (event: WheelEvent) => {
      if (ui.overlay) {
        return;
      }
      const next = wheelStep(wheel, wheelPixels(event), event.timeStamp);
      wheel = next.state;
      if (next.step < 0) {
        reading.rollBack();
      } else if (next.step > 0) {
        reading.rollForward();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('wheel', onWheel);
      reading.holdSkip(false);
    };
  }, [ui, reading]);

  const onStageClick = (event: MouseEvent<HTMLElement>) => {
    if (!ui.overlay && !isSystemControl(event.target)) {
      reading.requestAdvance();
    }
  };

  return {
    /** The line on screen; null while the frame's transition plays, the panel empty. */
    line: waiting ? null : line,
    /** The story's transition plays: the panel stays, the line comes after. */
    waiting,
    visibleText,
    /** The options to pick from, once the prompt has been read; null otherwise. */
    choiceOptions: reading.choiceOptions,
    onStageClick,
  };
}

/** The wheel's delta in pixels, whatever unit the browser counts it in. */
function wheelPixels(event: WheelEvent): number {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return event.deltaY * 33;
  }
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return event.deltaY * window.innerHeight;
  }
  return event.deltaY;
}
