import type { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { u } from '@/shared/lib/units';

type Placement = 'top' | 'bottom';
/**
 * `center` — over or under the anchor's middle, in one line; `start` — from the anchor's left
 * edge, as wide as the text and wrapping at the anchor's width.
 */
type Align = 'center' | 'start';

type TooltipProps = {
  /** What the tooltip says; null shows none — say, when a line already fits. */
  text: string | null;
  placement?: Placement;
  align?: Align;
  className?: string;
  children: ReactNode;
};

/**
 * A small dark tooltip next to its anchor, shown after a short hover or on keyboard focus.
 * Pure CSS — nothing is measured or portalled. It repeats what the anchor already says to
 * screen readers (an icon button's label, a cut line's full text), so it is hidden from them.
 */
export function Tooltip({
  text,
  placement = 'top',
  align = 'center',
  className,
  children,
}: TooltipProps) {
  return (
    <Anchor className={className}>
      {children}
      {text && (
        <Bubble aria-hidden $placement={placement} $align={align}>
          {text}
        </Bubble>
      )}
    </Anchor>
  );
}

const Anchor = styled.span`
  position: relative;
  display: inline-flex;
  min-width: 0;
`;

const centered = css`
  --shift-x: -50%;
  left: 50%;
  width: max-content;
  white-space: nowrap;
`;

const fromStart = css`
  --shift-x: 0;
  left: 0;
  width: max-content;
  max-width: 100%;
  white-space: normal;
`;

const Bubble = styled.span<{ $placement: Placement; $align: Align }>`
  --shift-y: ${({ $placement }) => ($placement === 'top' ? u(3) : u(-3))};
  ${({ $align }) => ($align === 'center' ? centered : fromStart)}

  position: absolute;
  z-index: 1;
  ${({ $placement, theme }) =>
    `${$placement === 'top' ? 'bottom' : 'top'}: calc(100% + ${u(theme.tooltip.offset)});`}
  padding: ${({ theme }) => `${u(theme.tooltip.paddingY)} ${u(theme.tooltip.paddingX)}`};
  border-radius: ${({ theme }) => u(theme.tooltip.radius)};
  border: 1px solid ${({ theme }) => theme.colors.tooltipBorder};
  background: ${({ theme }) => theme.colors.tooltipBackground};
  box-shadow: ${({ theme }) => theme.shadows.tooltip};
  color: ${({ theme }) => theme.colors.tooltipText};
  font-size: ${({ theme }) => u(theme.typography.tooltipSize)};
  font-weight: 400;
  line-height: 1.4;
  letter-spacing: normal;
  text-align: left;
  pointer-events: none;

  opacity: 0;
  visibility: hidden;
  transform: translate(var(--shift-x), var(--shift-y));
  transition: ${({ theme }) => {
    const ms = theme.timing.tooltipMs;
    return `opacity ${ms}ms, transform ${ms}ms, visibility 0s linear ${ms}ms`;
  }};

  ${Anchor}:hover > &,
  ${Anchor}:focus-within > & {
    opacity: 1;
    visibility: visible;
    transform: translate(var(--shift-x), 0);
    transition-delay: ${({ theme }) => theme.timing.tooltipDelayMs}ms;
  }
`;
