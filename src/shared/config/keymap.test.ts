import { describe, expect, it } from 'vitest';
import { actionOfKey, bindingOfKey, CONTROL_GROUPS, inputId, KEYMAP } from './keymap';

describe('keymap', () => {
  it('knows the action of every key the game uses', () => {
    expect(actionOfKey(' ')).toBe('advance');
    expect(actionOfKey('Enter')).toBe('advance');
    expect(actionOfKey('1')).toBe('pick');
    expect(actionOfKey('9')).toBe('pick');
    expect(actionOfKey('Tab')).toBe('toggleSkip');
    expect(actionOfKey('Control')).toBe('holdSkip');
    expect(actionOfKey('PageUp')).toBe('rollBack');
    expect(actionOfKey('PageDown')).toBe('rollForward');
    expect(actionOfKey('Escape')).toBe('gameMenu');
    expect(actionOfKey('F1')).toBe('controls');
  });

  it('leaves the other keys alone: 0, letters, a run that only looks like one', () => {
    expect(actionOfKey('0')).toBeNull();
    expect(actionOfKey('a')).toBeNull();
    expect(actionOfKey('10')).toBeNull();
    expect(actionOfKey('Shift')).toBeNull();
  });

  it('tells which input a key matched, the run of digits as one', () => {
    const five = bindingOfKey('5');
    const seven = bindingOfKey('7');
    expect(five).toEqual({ action: 'pick', input: { type: 'keys', from: '1', to: '9' } });
    expect(five && inputId(five.input)).toBe(seven && inputId(seven.input));
  });

  it('binds no input twice', () => {
    const ids = Object.values(KEYMAP).flatMap((inputs) => inputs.map(inputId));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('shows every action in «Управление», once', () => {
    const shown = CONTROL_GROUPS.flatMap((group) => group.actions);
    expect([...shown].sort()).toEqual(Object.keys(KEYMAP).sort());
  });
});
