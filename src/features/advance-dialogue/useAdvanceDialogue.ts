import { useEffect, useLayoutEffect, useRef, type MouseEvent } from 'react';
import { useTheme } from 'styled-components';
import { useStores } from '@/shared/lib/stores/useStores';
import { useTypewriter } from '@/shared/lib/useTypewriter';
import { isSystemControl } from './isSystemControl';

/**
 * The single way the story moves on. A click anywhere in the frame, Space or Enter all lead to
 * one `requestAdvance`: while the line is still typing, show it whole; once it is whole, go to
 * the next one. Clicks and keys aimed at system controls belong to those controls.
 *
 * Must be called from an `observer` component: it reads the current line from the store.
 */
export function useAdvanceDialogue() {
  const { game, ui } = useStores();
  const { timing } = useTheme();
  const line = game.line;
  const typewriter = useTypewriter(line?.text ?? '', timing.defaultTextCps, line?.key ?? '');

  const requestAdvance = () => {
    if (typewriter.isRevealing) {
      typewriter.finish();
    } else {
      game.advance();
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      ui.showMenu();
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
    requestAdvance();
  };

  // One window listener for the screen's lifetime, always calling the latest handler: the
  // handler changes with every typed character, the subscription shouldn't.
  const latestOnKeyDown = useRef(onKeyDown);
  useLayoutEffect(() => {
    latestOnKeyDown.current = onKeyDown;
  });
  useEffect(() => {
    const listener = (event: KeyboardEvent) => latestOnKeyDown.current(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  const onStageClick = (event: MouseEvent<HTMLElement>) => {
    if (!isSystemControl(event.target)) {
      requestAdvance();
    }
  };

  return { line, visibleText: typewriter.visibleText, onStageClick };
}
