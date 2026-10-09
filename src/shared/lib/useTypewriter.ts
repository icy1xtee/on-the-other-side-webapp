import { useCallback, useEffect, useRef, useState } from 'react';
import { revealedChars } from '@/shared/lib/typewriter';

/**
 * Reveals `text` character by character. Driven by requestAnimationFrame and elapsed time
 * rather than a timer: an even pace at any speed, and it pauses by itself in a hidden tab.
 * A new `key` restarts the reveal, even for a line that reads the same as the last one.
 */
export function useTypewriter(text: string, charsPerSecond: number, key: string) {
  const [revealed, setRevealed] = useState({ key, count: 0 });
  const frame = useRef(0);

  const count =
    revealed.key === key ? revealed.count : revealedChars(0, charsPerSecond, text.length);

  useEffect(() => {
    const startedAt = performance.now();
    const tick = (now: number) => {
      const next = revealedChars(now - startedAt, charsPerSecond, text.length);
      // Never move backwards: `finish()` may already have shown the whole line.
      setRevealed((current) =>
        current.key === key && current.count >= next ? current : { key, count: next },
      );
      if (next < text.length) {
        frame.current = requestAnimationFrame(tick);
      }
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [key, text, charsPerSecond]);

  /** Show the rest of the line at once — what a click during the reveal does. */
  const finish = useCallback(() => {
    cancelAnimationFrame(frame.current);
    setRevealed({ key, count: text.length });
  }, [key, text]);

  return {
    visibleText: text.slice(0, count),
    isRevealing: count < text.length,
    finish,
  };
}
