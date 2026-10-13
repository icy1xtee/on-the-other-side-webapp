import { useEffect, useState } from 'react';

/** The current time, renewed every `intervalMs`: a clock on screen re-renders just itself. */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}
