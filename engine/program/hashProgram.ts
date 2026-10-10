import type { Program } from './compileScene';

/**
 * A short fingerprint of a compiled scene, kept in a save to tell whether the scene changed under
 * it: a step index means something only in the program it was taken from. Any edit counts — a
 * moved line, a new one, a fixed typo. Conditions are functions and stay out of it: changing one
 * moves no steps.
 */
export function hashProgram(program: Program): string {
  return cyrb53(JSON.stringify(program)).toString(36);
}

/** cyrb53 (public domain, bryc): fast, well spread, 53 bits. Not cryptographic, nor need it be. */
function cyrb53(text: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}
