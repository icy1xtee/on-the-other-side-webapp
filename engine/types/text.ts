/** A piece of game text: written inline for now, or a key once localisation arrives. */
export type LocalizedText = string | { $key: string };

/** There is no localisation in 0.1: a key is shown as is, a visible placeholder rather than a gap. */
export function resolveText(text: LocalizedText): string {
  return typeof text === 'string' ? text : text.$key;
}
