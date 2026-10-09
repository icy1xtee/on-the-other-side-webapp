import type { ComponentProps } from 'react';
import styled from 'styled-components';
import { u } from '@/shared/lib/units';
import { PillButton } from './PillButton';
import { Tooltip } from './Tooltip';

type IconButtonProps = ComponentProps<typeof PillButton> & {
  /** Names the button for screen readers and shows as its tooltip. */
  label: string;
  tooltipPlacement?: 'top' | 'bottom';
};

/** A square PillButton holding just a Lucide icon; its name shows as a tooltip on hover. */
export function IconButton({ label, tooltipPlacement = 'top', ...props }: IconButtonProps) {
  return (
    <Tooltip text={label} placement={tooltipPlacement}>
      <Square aria-label={label} {...props} />
    </Tooltip>
  );
}

const Square = styled(PillButton)`
  width: ${({ theme }) => u(theme.button.height)};
  padding: 0;
`;
