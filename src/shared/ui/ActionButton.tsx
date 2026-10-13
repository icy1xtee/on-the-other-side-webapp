import styled, { css } from 'styled-components';
import { u } from '@/shared/lib/units';
import { PlainButton } from './PlainButton';

type Tone = 'secondary' | 'primary' | 'danger';

const tones = {
  secondary: css`
    color: ${({ theme }) => theme.colors.sliderValue};
    border-color: ${({ theme }) => theme.colors.buttonBorder};
    background: ${({ theme }) => theme.colors.buttonBackground};

    &:hover {
      color: ${({ theme }) => theme.colors.textStrong};
      background: ${({ theme }) => theme.colors.buttonBackgroundHover};
    }
  `,
  primary: css`
    padding: 0 ${({ theme }) => u(theme.actionButton.paddingX + 4)};
    color: ${({ theme }) => theme.colors.selectedText};
    border-color: ${({ theme }) => theme.colors.primaryBorder};
    background: ${({ theme }) => theme.colors.primaryBackground};
    font-weight: 500;

    &:hover {
      background: ${({ theme }) => theme.colors.primaryBackgroundHover};
    }
  `,
  danger: css`
    color: ${({ theme }) => theme.colors.dangerText};
    border-color: ${({ theme }) => theme.colors.dangerBorder};
    background: ${({ theme }) => theme.colors.dangerBackground};
    font-weight: 500;

    &:hover {
      background: ${({ theme }) => theme.colors.dangerBackgroundHover};
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.dangerBorder};
    }
  `,
};

/**
 * A worded button of the design's windows: "Отмена" and "Сбросить" are `secondary`, the action
 * a window is for is `primary`, one that can't be undone is `danger`.
 */
export const ActionButton = styled(PlainButton)<{ $tone?: Tone }>`
  height: ${({ theme }) => u(theme.actionButton.height)};
  padding: 0 ${({ theme }) => u(theme.actionButton.paddingX)};
  border: 1px solid;
  border-radius: ${({ theme }) => u(theme.actionButton.radius)};
  font-size: ${({ theme }) => u(theme.typography.buttonSize)};
  white-space: nowrap;
  transition:
    background 150ms,
    color 150ms;

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.focusRing};
  }

  ${({ $tone = 'secondary' }) => tones[$tone]}
`;
