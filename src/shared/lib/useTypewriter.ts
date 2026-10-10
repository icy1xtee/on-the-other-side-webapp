import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { revealedChars } from '@/shared/lib/typewriter';

/**
 * Reveals `text` character by character. Driven by requestAnimationFrame and elapsed time
 * rather than a timer: an even pace at any speed, and it pauses by itself in a hidden tab.
 * A new `key` restarts the reveal, even for a line that reads the same as the last one; a new
 * speed goes on from where the line has got to.
 */
export function useTypewriter(text: string, charsPerSecond: number, key: string) {
  const [revealed, setRevealed] = useState({ key, count: 0 });
  const frame = useRef(0);

  const count =
    revealed.key === key ? revealed.count : revealedChars(0, charsPerSecond, text.length);

  // How far the line has got, for a speed change mid-line: set before the effect below runs.
  const reached = useRef(count);
  useLayoutEffect(() => {
    reached.current = count;
  });

  useEffect(() => {
    // Back-date the start, so the new speed picks up at the characters already shown.
    const head = charsPerSecond > 0 ? (reached.current / charsPerSecond) * 1000 : 0;
    const startedAt = performance.now() - head;
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
