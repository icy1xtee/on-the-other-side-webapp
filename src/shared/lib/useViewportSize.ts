import { useLayoutEffect, useRef, useState } from 'react';

export type ViewportSize = { width: number; height: number };

/**
 * Tracks the element's size. `size` is null until the first measurement; the layout effect
 * measures before the first paint, so nothing flashes at a wrong size.
 */
export function useViewportSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ViewportSize | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => {
      const { width, height } = element.getBoundingClientRect();
      setSize((current) =>
        current?.width === width && current.height === height ? current : { width, height },
      );
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}
