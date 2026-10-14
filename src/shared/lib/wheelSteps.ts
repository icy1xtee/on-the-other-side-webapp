/**
 * Turns wheel events into steps: -1 (up — back), 1 (down — forward), 0 (nothing yet).
 *
 * A mouse wheel clicks: each notch comes as one large delta (Chrome: about 100 px) and is a
 * step. A trackpad glides: one swipe sends dozens of small deltas, inertia included — summed up,
 * they make one step per gesture, so a swipe doesn't roll back ten lines. A gesture ends after a
 * pause or on a turn the other way.
 */
export type WheelState = {
  /** The small deltas summed in this gesture. */
  sum: number;
  /** When the last event came, ms. */
  at: number;
  /** This gesture has made its step. */
  stepped: boolean;
};

/** A delta at least this large is a mouse wheel's notch. */
const NOTCH = 50;
/** Small deltas summing up to this make a trackpad's step. */
const GESTURE = 40;
/** A pause this long ends a gesture. */
const GESTURE_GAP_MS = 200;

export const WHEEL_START: WheelState = { sum: 0, at: Number.NEGATIVE_INFINITY, stepped: false };

export function wheelStep(
  state: WheelState,
  deltaY: number,
  now: number,
): { state: WheelState; step: -1 | 0 | 1 } {
  if (deltaY === 0) {
    return { state: { ...state, at: now }, step: 0 };
  }
  const direction = deltaY < 0 ? -1 : 1;
  if (Math.abs(deltaY) >= NOTCH) {
    return { state: { sum: 0, at: now, stepped: false }, step: direction };
  }
  const turned = state.sum !== 0 && Math.sign(state.sum) !== direction;
  const gesture = now - state.at > GESTURE_GAP_MS || turned ? { sum: 0, stepped: false } : state;
  const sum = gesture.sum + deltaY;
  if (!gesture.stepped && Math.abs(sum) >= GESTURE) {
    return { state: { sum, at: now, stepped: true }, step: direction };
  }
  return { state: { sum, at: now, stepped: gesture.stepped }, step: 0 };
}
