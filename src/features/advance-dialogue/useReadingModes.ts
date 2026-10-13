import { useEffect } from 'react';
import { useStores } from '@/shared/lib/stores/useStores';

/**
 * Runs Auto and Skip: waits out the reading store's next step and takes it. Only while `active`
 * — the player is on the game screen, the tab is visible and no window is open; a step cut short
 * is planned again from the start when they come back. Must be called from an `observer`
 * component: it reads the store.
 */
export function useReadingModes(active: boolean) {
  const { reading } = useStores();
  const next = reading.nextStep;

  useEffect(() => {
    if (!active || !next) {
      return;
    }
    const timer = window.setTimeout(reading.step, next.delayMs);
    return () => window.clearTimeout(timer);
  }, [active, next, reading]);
}
