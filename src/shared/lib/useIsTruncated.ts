import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Whether an element's one-line text runs past its box and is cut by `text-overflow: ellipsis`.
 * Checked when the text changes and whenever the box resizes.
 */
export function useIsTruncated<T extends HTMLElement>(text: string) {
  const ref = useRef<T>(null);
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const check = () => setTruncated(element.scrollWidth > element.clientWidth);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, [text]);

  return { ref, truncated };
}
