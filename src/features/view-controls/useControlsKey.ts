import { useEffect } from 'react';
import { actionOfKey } from '@/shared/config/keymap';
import { useStores } from '@/shared/lib/stores/useStores';

/**
 * Ren'Py's help key — F1 in the keymap — on every screen: the game menu on «Управление», over
 * the game or the main menu, from any part of the menu (`UiStore.openControls`).
 */
export function useControlsKey() {
  const { ui } = useStores();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (actionOfKey(event.key) === 'controls') {
        // Chrome would open its own help.
        event.preventDefault();
        ui.openControls();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [ui]);
}
