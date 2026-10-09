import type { ComponentProps } from 'react';
import styled from 'styled-components';
import { u } from '@/shared/lib/units';

/** Text button for game menus. Defaults to `type="button"` so it never submits a form. */
export function Button(props: ComponentProps<'button'>) {
  return <StyledButton type="button" {...props} />;
}

const StyledButton = styled.button`
  padding: ${u(5)} ${u(16)};
  font-size: ${({ theme }) => u(theme.typography.interfaceSize)};
  color: ${({ theme }) => theme.colors.text};
  transition: color 150ms;

  &:enabled:hover {
    color: ${({ theme }) => theme.colors.accent};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 4px;
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: default;
  }
`;
