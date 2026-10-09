import type { ComponentProps } from 'react';
import styled from 'styled-components';
import { u } from '@/shared/lib/units';

/**
 * The design's small rounded control button. Defaults to `type="button"`.
 *
 * A mouse click doesn't move focus onto it: otherwise the next Space would press this button
 * again instead of advancing the story. Tab still focuses it for keyboard players.
 */
export function PillButton({ onMouseDown, ...props }: ComponentProps<'button'>) {
  return (
    <StyledPillButton
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      {...props}
    />
  );
}

const StyledPillButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45em;
  height: ${({ theme }) => u(theme.button.height)};
  padding: 0 ${({ theme }) => u(theme.button.paddingX)};
  border-radius: ${({ theme }) => u(theme.button.radius)};
  border: 1px solid ${({ theme }) => theme.colors.buttonBorder};
  background: ${({ theme }) => theme.colors.buttonBackground};
  color: ${({ theme }) => theme.colors.buttonText};
  font-size: ${({ theme }) => u(theme.typography.buttonSize)};
  line-height: 1;
  white-space: nowrap;
  transition: background 150ms;

  /* Lucide icons: sized from the button's font, so they scale with the UI; thinner than
     Lucide's default 2 to match the design's hairlines. */
  & > svg {
    flex: none;
    width: 1.15em;
    height: 1.15em;
    stroke-width: ${({ theme }) => theme.icons.strokeWidth};
  }

  &:enabled:hover,
  &[aria-pressed='true'] {
    background: ${({ theme }) => theme.colors.buttonBackgroundHover};
  }

  &[aria-pressed='true'] {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: default;
  }
`;
