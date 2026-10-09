import { describe, expect, it } from 'vitest';
import { resolveText } from './text';

describe('resolveText', () => {
  it('returns inline text as is', () => {
    expect(resolveText('Привет')).toBe('Привет');
  });

  it('shows a localisation key as a visible placeholder', () => {
    expect(resolveText({ $key: 'intro.greeting' })).toBe('intro.greeting');
  });
});
