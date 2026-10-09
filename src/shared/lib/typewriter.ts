/**
 * How many characters of a line are visible after `elapsedMs`. Speed 0 means instant, as with
 * Ren'Py's `text_cps = 0`.
 */
export function revealedChars(elapsedMs: number, charsPerSecond: number, length: number): number {
  if (charsPerSecond <= 0) {
    return length;
  }
  return Math.min(length, Math.max(0, Math.floor((elapsedMs / 1000) * charsPerSecond)));
}
