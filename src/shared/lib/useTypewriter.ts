import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { revealedChars } from '@/shared/lib/typewriter';

type TypewriterOptions = {
  /** Show the whole line now: it was clicked through, or the text is instant. */
  shown: boolean;
  /** Called once the line has typed out to its end by itself. */
  onTyped: () => void;
};

/**
 * Reveals `text` character by character. Driven by requestAnimationFrame and elapsed time
 * rather than a timer: an even pace at any speed, and it pauses by itself in a hidden tab.
 * A new `key` restarts the reveal, even for a line that reads the same as the last one; a new
 * speed goes on from where the line has got to. Whether the line is whole is decided outside
 * (`shown`); the typewriter only reports reaching the end.
 */
export function useTypewriter(
  text: string,
  charsPerSecond: number,
  key: string,
  { shown, onTyped }: TypewriterOptions,
) {
  const [revealed, setRevealed] = useState({ key, count: 0 });
  const frame = useRef(0);

  const typed =
    revealed.key === key ? revealed.count : revealedChars(0, charsPerSecond, text.length);
  const count = shown ? text.length : typed;

  // How far the line has got, for a speed change mid-line, and the latest callback: set before
  // the effect below runs.
  const reached = useRef(count);
  const latestOnTyped = useRef(onTyped);
  useLayoutEffect(() => {
    reached.current = count;
    latestOnTyped.current = onTyped;
  });

  useEffect(() => {
    if (shown) {
      return;
    }
    // Back-date the start, so the new speed picks up at the characters already shown.
    const head = charsPerSecond > 0 ? (reached.current / charsPerSecond) * 1000 : 0;
    const startedAt = performance.now() - head;
    const tick = (now: number) => {
      const next = revealedChars(now - startedAt, charsPerSecond, text.length);
      setRevealed({ key, count: next });
      if (next < text.length) {
        frame.current = requestAnimationFrame(tick);
      } else {
        latestOnTyped.current();
      }
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [key, text, charsPerSecond, shown]);

  return text.slice(0, count);
}
