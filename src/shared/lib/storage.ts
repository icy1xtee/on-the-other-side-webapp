/** One key of the browser's storage, read and written without ever throwing. */
export type StorageSlot = {
  read(): string | null;
  /** False when the storage refused. */
  write(value: string): boolean;
  clear(): void;
};

/**
 * localStorage the game can always call. Storage may be switched off, blocked in a private
 * window or full, and then every call throws: here reads come back empty and writes report
 * false, so the game plays on without saves. The first refusal goes to the log, the rest don't.
 */
export function createStorageSlot(key: string): StorageSlot {
  let warned = false;
  const refused = (error: unknown) => {
    if (!warned) {
      warned = true;
      console.warn(`Storage "${key}" is unavailable, playing on without it:`, error);
    }
  };

  return {
    read() {
      try {
        return globalThis.localStorage.getItem(key);
      } catch (error) {
        refused(error);
        return null;
      }
    },
    write(value) {
      try {
        globalThis.localStorage.setItem(key, value);
        return true;
      } catch (error) {
        refused(error);
        return false;
      }
    },
    clear() {
      try {
        globalThis.localStorage.removeItem(key);
      } catch (error) {
        refused(error);
      }
    },
  };
}
