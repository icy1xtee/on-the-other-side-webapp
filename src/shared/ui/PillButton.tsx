import type { ComponentProps } from 'react';
import styled from 'styled-components';

/** The design's small rounded control button. Defaults to `type="button"`. */
export function PillButton(props: ComponentProps<'button'>) {
  return <StyledPillButton type="button" {...props} />;
}

const StyledPillButton = styled.button`
  height: ${({ theme }) => theme.button.height}px;
  padding: 0 ${({ theme }) => theme.button.paddingX}px;
  border-radius: ${({ theme }) => theme.button.radius}px;
  border: 1.5px solid ${({ theme }) => theme.colors.buttonBorder};
  background: ${({ theme }) => theme.colors.buttonBackground};
  color: ${({ theme }) => theme.colors.buttonText};
  font-size: ${({ theme }) => theme.typography.buttonSize}px;
  line-height: 1;
  transition: background 150ms;

  &:enabled:hover {
    background: ${({ theme }) => theme.colors.buttonBackgroundHover};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 3px;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: default;
  }
`;
