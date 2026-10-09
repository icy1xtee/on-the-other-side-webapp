/**
 * A design px value on screen: scaled by the UI scale the stage sets as `--u`. Every size in the
 * game goes through this, so the whole interface grows and shrinks together with the window.
 */
export function u(designPx: number): string {
  return `calc(${designPx}px * var(--u, 1))`;
}
