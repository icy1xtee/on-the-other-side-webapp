import { describe, expect, it } from 'vitest';
import { applyInstant } from './applyInstant';
import { createInitialState, type GameState } from './state';

const initial = createInitialState('intro', { metAnna: false, trust: 0 });

function withSprites(state: GameState, sprites: GameState['stage']['sprites']): GameState {
  return { ...state, stage: { background: 'room', sprites } };
}

describe('createInitialState', () => {
  it('starts at step 0 of the scene with the defaults and an empty stage', () => {
    expect(initial).toEqual({
      position: { sceneId: 'intro', step: 0 },
      vars: { metAnna: false, trust: 0 },
      stage: { background: null, sprites: [] },
      audio: { music: null },
    });
  });
});

describe('applyInstant', () => {
  it('scene sets the background and clears all sprites', () => {
    const state = withSprites(initial, [{ tag: 'anna', emotion: 'happy', at: 'left' }]);
    const { state: next } = applyInstant(state, { type: 'scene', background: 'street' });
    expect(next.stage).toEqual({ background: 'street', sprites: [] });
  });

  it('show adds a new tag on top, at the centre by default', () => {
    const state = withSprites(initial, [{ tag: 'anna', emotion: 'happy', at: 'left' }]);
    const { state: next } = applyInstant(state, { type: 'show', tag: 'bob', emotion: 'neutral' });
    expect(next.stage.sprites).toEqual([
      { tag: 'anna', emotion: 'happy', at: 'left' },
      { tag: 'bob', emotion: 'neutral', at: 'center' },
    ]);
  });

  it('show with a tag already on screen replaces it in place instead of adding a second one', () => {
    const state = withSprites(initial, [
      { tag: 'anna', emotion: 'happy', at: 'left' },
      { tag: 'bob', emotion: 'neutral', at: 'right' },
    ]);
    const { state: next } = applyInstant(state, { type: 'show', tag: 'anna', emotion: 'sad' });
    expect(next.stage.sprites).toEqual([
      { tag: 'anna', emotion: 'sad', at: 'left' },
      { tag: 'bob', emotion: 'neutral', at: 'right' },
    ]);
  });

  it('show with a new position moves the replaced sprite', () => {
    const state = withSprites(initial, [{ tag: 'anna', emotion: 'happy', at: 'left' }]);
    const { state: next } = applyInstant(state, {
      type: 'show',
      tag: 'anna',
      emotion: 'happy',
      at: 'right',
    });
    expect(next.stage.sprites).toEqual([{ tag: 'anna', emotion: 'happy', at: 'right' }]);
  });

  it('hide removes the sprite by tag', () => {
    const state = withSprites(initial, [
      { tag: 'anna', emotion: 'happy', at: 'left' },
      { tag: 'bob', emotion: 'neutral', at: 'right' },
    ]);
    const { state: next } = applyInstant(state, { type: 'hide', tag: 'anna' });
    expect(next.stage.sprites).toEqual([{ tag: 'bob', emotion: 'neutral', at: 'right' }]);
  });

  it('hide of a tag that is not on screen changes nothing', () => {
    const state = withSprites(initial, [{ tag: 'anna', emotion: 'happy', at: 'left' }]);
    const { state: next } = applyInstant(state, { type: 'hide', tag: 'ghost' });
    expect(next.stage).toEqual(state.stage);
  });

  it('set changes one variable and keeps the rest', () => {
    const { state: next } = applyInstant(initial, { type: 'set', name: 'trust', value: 2 });
    expect(next.vars).toEqual({ metAnna: false, trust: 2 });
  });

  it('music stores the track and reports it, restarting unless ifChanged is set', () => {
    const plain = applyInstant(initial, { type: 'music', asset: 'theme' });
    expect(plain.state.audio.music).toBe('theme');
    expect(plain.effect).toEqual({ type: 'music', asset: 'theme', ifChanged: false });

    const gentle = applyInstant(initial, { type: 'music', asset: 'theme', ifChanged: true });
    expect(gentle.effect).toEqual({ type: 'music', asset: 'theme', ifChanged: true });

    const stop = applyInstant(plain.state, { type: 'music', asset: null });
    expect(stop.state.audio.music).toBeNull();
  });

  it('sfx changes nothing but reports the sound', () => {
    const { state: next, effect } = applyInstant(initial, { type: 'sfx', asset: 'door' });
    expect(next).toBe(initial);
    expect(effect).toEqual({ type: 'sfx', asset: 'door' });
  });

  it('never mutates the given state', () => {
    const state = withSprites(initial, [{ tag: 'anna', emotion: 'happy', at: 'left' }]);
    const snapshot = JSON.parse(JSON.stringify(state));
    applyInstant(state, { type: 'show', tag: 'anna', emotion: 'sad' });
    applyInstant(state, { type: 'set', name: 'trust', value: 5 });
    applyInstant(state, { type: 'scene', background: 'street' });
    expect(state).toEqual(snapshot);
  });

  it('survives a JSON round trip without losing anything', () => {
    let state = initial;
    state = applyInstant(state, { type: 'scene', background: 'room' }).state;
    state = applyInstant(state, { type: 'show', tag: 'anna', emotion: 'happy', at: 'left' }).state;
    state = applyInstant(state, { type: 'music', asset: 'theme' }).state;
    state = applyInstant(state, { type: 'set', name: 'metAnna', value: true }).state;
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });
});
