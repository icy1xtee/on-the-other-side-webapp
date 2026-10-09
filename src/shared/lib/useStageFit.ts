import { useLayoutEffect, useRef, useState } from 'react';
import { fitStage, type StageFit } from '@/shared/lib/stageScale';

/**
 * Tracks the element's size and fits the stage into it. `fit` is null until the first
 * measurement; the layout effect measures before the first paint, so nothing flashes unscaled.
 */
export function useStageFit<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [fit, setFit] = useState<StageFit | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const { width, height } = element.getBoundingClientRect();
      setFit(fitStage(width, height, window.devicePixelRatio));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, fit };
}
