// Anything the player can operate on its own: buttons, links, fields, and whatever opts in.
const SYSTEM_CONTROLS = 'button, a, input, select, textarea, [data-system-control]';

/** True when the event came from a system control, which handles it itself. */
export function isSystemControl(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(SYSTEM_CONTROLS) !== null;
}
