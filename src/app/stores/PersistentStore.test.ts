import { describe, expect, it } from 'vitest';
import { PersistentStore } from './PersistentStore';
import { memorySlot } from './testDoubles';

describe('PersistentStore', () => {
  it('remembers what was read across a reload', () => {
    const slot = memorySlot();
    new PersistentStore(slot).markRead('intro', 'Первая');

    const reloaded = new PersistentStore(memorySlot(slot.value));
    expect(reloaded.isRead('intro', 'Первая')).toBe(true);
    expect(reloaded.isRead('intro', 'Вторая')).toBe(false);
  });

  it('knows a line by its scene and its exact text: an edited line is unread', () => {
    const persistent = new PersistentStore(memorySlot());
    persistent.markRead('intro', 'Первая');

    expect(persistent.isRead('walk', 'Первая')).toBe(false);
    expect(persistent.isRead('intro', 'Первая!')).toBe(false);
  });

  it("keeps the story's text out of storage", () => {
    const slot = memorySlot();
    new PersistentStore(slot).markRead('intro', 'Первая');

    expect(slot.value).not.toContain('Первая');
  });

  it('writes only what is new', () => {
    const slot = memorySlot();
    const persistent = new PersistentStore(slot);
    persistent.markRead('intro', 'Первая');
    persistent.markRead('intro', 'Первая');

    expect(slot.writes).toBe(1);
  });

  it('counts unreadable data as nothing read', () => {
    for (const stored of ['{oops', '[1, 2]', '{"readLines": "intro"}', '{"readLines": [1]}']) {
      expect(new PersistentStore(memorySlot(stored)).isRead('intro', 'Первая')).toBe(false);
    }
  });

  it('keeps the marks for the session when storage refuses', () => {
    const persistent = new PersistentStore(memorySlot(null, { refusing: true }));
    persistent.markRead('intro', 'Первая');

    expect(persistent.isRead('intro', 'Первая')).toBe(true);
  });
});
