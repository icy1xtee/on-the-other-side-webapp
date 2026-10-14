import styled, { css } from 'styled-components';
import { u } from '@/shared/lib/units';

export type MouseInput = 'click' | 'wheelUp' | 'wheelDown';

type MouseGlyphProps = {
  input: MouseInput;
  /** What it stands for, for screen readers: the glyph is the whole of it on screen. */
  label: string;
  /** The button or the wheel is in use now. */
  lit?: boolean;
};

/**
 * A mouse, drawn beside the keycaps: the left button or the wheel picked out in teal, an arrow
 * for the wheel's way. As tall as a keycap; lit, it glows like a key held down.
 */
export function MouseGlyph({ input, label, lit = false }: MouseGlyphProps) {
  const wheel = input !== 'click';
  return (
    <Glyph
      role="img"
      aria-label={label}
      viewBox={`0 0 ${wheel ? 32 : 24} 24`}
      $wheel={wheel}
      $lit={lit}
    >
      <rect className="body" x="5" y="2" width="14" height="20" rx="7" />
      {wheel ? (
        <rect className="part" x="10.5" y="5.5" width="3" height="5.5" rx="1.5" />
      ) : (
        <>
          <path className="part" d="M12 2.6a6.4 6.4 0 0 0-6.4 6.4v1h6.4z" />
          <path className="body" d="M5 10h14M12 2v8" />
        </>
      )}
      {input === 'wheelUp' && <path className="arrow" d="M27 16V8M24 11l3-3 3 3" />}
      {input === 'wheelDown' && <path className="arrow" d="M27 8v8M24 13l3 3 3-3" />}
    </Glyph>
  );
}

const Glyph = styled.svg<{ $wheel: boolean; $lit: boolean }>`
  flex: none;
  width: ${({ theme, $wheel }) => u((theme.keycap.height * ($wheel ? 32 : 24)) / 24)};
  height: ${({ theme }) => u(theme.keycap.height)};
  color: ${({ theme }) => theme.colors.keycapText};
  transition: filter 120ms;

  .body,
  .arrow {
    fill: none;
    stroke: currentColor;
    stroke-width: ${({ theme }) => theme.icons.strokeWidth};
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .arrow {
    stroke: ${({ theme }) => theme.colors.accent};
  }

  .part {
    fill: ${({ theme }) => theme.colors.accentFill};
    opacity: 0.6;
    transition: opacity 120ms;
  }

  ${({ $lit, theme }) =>
    $lit &&
    css`
      filter: ${theme.shadows.glyphLit};

      .part {
        opacity: 1;
      }
    `}
`;
