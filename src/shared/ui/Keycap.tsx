import styled, { css } from 'styled-components';
import { u } from '@/shared/lib/units';

/**
 * A key drawn as a key: a small cap in Geist Mono with a lower edge for depth. `$wide` — a long
 * key, Space; `$lit` — the key is down: it sinks a little and takes the teal of a lit option.
 */
export const Keycap = styled.kbd<{ $wide?: boolean; $lit?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  min-width: ${({ theme, $wide }) => u($wide ? theme.keycap.wideWidth : theme.keycap.minWidth)};
  height: ${({ theme }) => u(theme.keycap.height)};
  padding: 0 ${({ theme }) => u(theme.keycap.paddingX)} ${({ theme }) => u(theme.keycap.edge)};
  border: 1px solid ${({ theme }) => theme.colors.keycapBorder};
  border-radius: ${({ theme }) => u(theme.keycap.radius)};
  background: ${({ theme }) => theme.colors.keycapBackground};
  box-shadow: inset 0 ${({ theme }) => u(-theme.keycap.edge)} 0
    ${({ theme }) => theme.colors.keycapEdge};
  color: ${({ theme }) => theme.colors.keycapText};
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.keycapSize)};
  line-height: 1;
  letter-spacing: 0.04em;
  white-space: nowrap;
  transition:
    color 120ms,
    background 120ms,
    border-color 120ms,
    box-shadow 120ms,
    transform 120ms;

  ${({ $lit, theme }) =>
    $lit &&
    css`
      transform: translateY(${u(theme.keycap.edge / 2)});
      border-color: ${theme.colors.selectedBorder};
      background: ${theme.colors.selectedBackground};
      box-shadow:
        inset 0 ${u(-theme.keycap.edge / 2)} 0 ${theme.colors.keycapEdge},
        ${theme.shadows.keycapLit};
      color: ${theme.colors.choiceTextLit};
    `}
`;
