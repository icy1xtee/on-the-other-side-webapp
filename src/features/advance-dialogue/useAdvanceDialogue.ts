import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useStores } from '@/shared/lib/stores/useStores';
import { useTypewriter } from '@/shared/lib/useTypewriter';
import { isSystemControl } from './isSystemControl';

/**
 * The single way the story moves on. A click anywhere on the stage, Space or Enter all lead to
 * one `requestAdvance`: while the line is still typing, show it whole; once it is whole, go on.
 * At a choice, going on means the player has read the prompt: only then do the options come out
 * (`choiceOptions`), so a prompt is never cut short. Clicks and keys aimed at system controls
 * belong to those controls; while a window is open over the game, none reach it. Esc opens the
 * settings — Ren'Py's game menu — and the way to the main menu is there.
 *
 * The line comes out translated: the store holds the Russian source, which is also the key of
 * its translation. Must be called from an `observer` component: it reads the line from the store.
 */
export function useAdvanceDialogue() {
  const { game, ui, settings } = useStores();
  const { t } = useTranslation('story');
  const source = game.line;
  const line = source && {
    ...source,
    text: t(source.text),
    speaker: source.speaker && { ...source.speaker, name: t(source.speaker.name) },
  };
  const typewriter = useTypewriter(line?.text ?? '', settings.textCps, line?.key ?? '');

  // The key of the prompt the player has clicked past. A choice without a prompt has nothing to
  // read: its options are out at once.
  const [readPrompt, setReadPrompt] = useState<string | null>(null);
  const options = game.choiceOptions;
  const promptPending = options !== null && source !== null && readPrompt !== source.key;

  const requestAdvance = () => {
    if (typewriter.isRevealing) {
      typewriter.finish();
    } else if (promptPending) {
      setReadPrompt(source.key);
    } else {
      game.advance();
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    // The open window handles its keys, Esc included (it closes it before this sees it).
    if (ui.overlay) {
      return;
    }
    if (event.key === 'Escape') {
      ui.openSettings();
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
    if (!ui.overlay && !isSystemControl(event.target)) {
      requestAdvance();
    }
  };

  return {
    line,
    visibleText: typewriter.visibleText,
    /** The options to pick from, once the prompt has been read; null otherwise. */
    choiceOptions: promptPending ? null : options,
    onStageClick,
  };
}
