import { describe, expect, it } from 'vitest';
import { WHEEL_START, wheelStep, type WheelState } from './wheelSteps';

/** Feeds `[deltaY, ms]` events in order; the steps they make. */
function steps(events: Array<[number, number]>): number[] {
  let state: WheelState = WHEEL_START;
  const made: number[] = [];
  for (const [deltaY, at] of events) {
    const next = wheelStep(state, deltaY, at);
    state = next.state;
    if (next.step !== 0) {
      made.push(next.step);
    }
  }
  return made;
}

describe('wheelStep', () => {
  it('makes a step of every mouse-wheel notch, up back and down forward', () => {
    expect(
      steps([
        [-100, 0],
        [-100, 40],
        [100, 80],
      ]),
    ).toEqual([-1, -1, 1]);
  });

  it('makes one step of a whole trackpad swipe, inertia included', () => {
    const swipe = Array.from({ length: 40 }, (_, i): [number, number] => [-6, i * 16]);
    expect(steps(swipe)).toEqual([-1]);
  });

  it('starts a new gesture after a pause, or on a turn the other way', () => {
    expect(
      steps([
        [-30, 0],
        [-30, 16],
        [-30, 400],
        [-30, 416],
        [30, 432],
        [30, 448],
      ]),
    ).toEqual([-1, -1, 1]);
  });

  it('takes no step from a nudge too small', () => {
    expect(
      steps([
        [-10, 0],
        [-10, 16],
      ]),
    ).toEqual([]);
  });
});
