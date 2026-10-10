import { afterEach, describe, expect, it, vi } from 'vitest';
import { createStorageSlot } from './storage';

function memoryStorage() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('createStorageSlot', () => {
  it('reads back what it wrote, under its own key', () => {
    vi.stubGlobal('localStorage', memoryStorage());
    const slot = createStorageSlot('ots:test');

    expect(slot.read()).toBeNull();
    expect(slot.write('{"a":1}')).toBe(true);
    expect(slot.read()).toBe('{"a":1}');
    expect(globalThis.localStorage.getItem('ots:test')).toBe('{"a":1}');

    slot.clear();
    expect(slot.read()).toBeNull();
  });

  it('never throws when storage refuses: reads nothing, reports a failed write, logs once', () => {
    const denied = () => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    };
    vi.stubGlobal('localStorage', { getItem: denied, setItem: denied, removeItem: denied });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const slot = createStorageSlot('ots:test');

    expect(slot.read()).toBeNull();
    expect(slot.write('x')).toBe(false);
    expect(() => slot.clear()).not.toThrow();
    expect(warn).toHaveBeenCalledOnce();
  });

  it('copes with no storage at all', () => {
    vi.stubGlobal('localStorage', undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const slot = createStorageSlot('ots:test');

    expect(slot.read()).toBeNull();
    expect(slot.write('x')).toBe(false);
  });
});
