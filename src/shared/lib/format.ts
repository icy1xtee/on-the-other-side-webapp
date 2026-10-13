const pad = (value: number) => String(value).padStart(2, '0');

/** Play time as a clock: `00:12:31`; the hours run past 99 if the player does. */
export function formatPlayTime(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds % 60)}`;
}

/** When a save was made, the way the player's language writes dates: `12.10.2026 · 18:57`. */
export function formatSavedAt(ms: number, language: string): string {
  const at = new Date(ms);
  const date = new Intl.DateTimeFormat(language, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(at);
  const time = new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(at);
  return `${date} · ${time}`;
}
