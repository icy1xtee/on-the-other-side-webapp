import { hashText } from '@engine';
import { makeAutoObservable, observable } from 'mobx';
import * as z from 'zod/mini';
import type { StorageSlot } from '@/shared/lib/storage';

const readLines = z.array(z.string());

/**
 * Ren'Py's `persistent`: what outlives every playthrough and isn't a setting — so far, which
 * lines the player has read, for Skip. Under a key of its own: a new game, a save or the
 * settings never touch it. Data that can't be read counts as nothing read; storage that refuses
 * keeps the marks for this session only.
 *
 * A line is known by its scene and its Russian text, hashed: editing a line makes it unread,
 * adding lines around it doesn't.
 */
export class PersistentStore {
  private readonly read = observable.set<string>();
  private readonly slot: StorageSlot;

  constructor(slot: StorageSlot) {
    this.slot = slot;
    for (const key of parseReadLines(slot.read())) {
      this.read.add(key);
    }
    makeAutoObservable<this, 'read' | 'slot'>(
      this,
      { read: false, slot: false },
      { autoBind: true },
    );
  }

  /** Whether the player has gone past this line before, in this playthrough or any other. */
  isRead(sceneId: string, text: string): boolean {
    return this.read.has(readKey(sceneId, text));
  }

  /** The player has gone past this line: it is read from now on, across playthroughs. */
  markRead(sceneId: string, text: string) {
    const key = readKey(sceneId, text);
    if (this.read.has(key)) {
      return;
    }
    this.read.add(key);
    this.slot.write(JSON.stringify({ readLines: [...this.read] }));
  }
}

function readKey(sceneId: string, text: string): string {
  return `${sceneId}:${hashText(text)}`;
}

function parseReadLines(text: string | null): string[] {
  if (text === null) {
    return [];
  }
  try {
    const raw: unknown = JSON.parse(text);
    const stored = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
    const parsed = readLines.safeParse(stored.readLines);
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}
