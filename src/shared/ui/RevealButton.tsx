import {
  createContext,
  useContext,
  useId,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from 'react';
import styled, { css } from 'styled-components';
import { u } from '@/shared/lib/units';
import { PlainButton } from './PlainButton';

type Variant = 'panel' | 'header';

/** Which button of a group has its label open: the last one the pointer came onto. */
const GroupContext = createContext<{
  open: string | null;
  setOpen: (id: string | null) => void;
} | null>(null);

/**
 * A row of reveal buttons. The opened label takes room and pushes the buttons beside it; to keep
 * them from slipping out from under the pointer, a label stays open while the pointer is anywhere
 * in the row — over the gaps, or over a button that has just moved — until it comes onto another
 * button or leaves the row. Laid out by the caller: anchor the row on the side its labels grow
 * away from.
 */
export function RevealGroup({ onPointerLeave, children, ...props }: ComponentProps<'div'>) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <GroupContext.Provider value={{ open, setOpen }}>
      <div
        onPointerLeave={(event) => {
          setOpen(null);
          onPointerLeave?.(event);
        }}
        {...props}
      >
        {children}
      </div>
    </GroupContext.Provider>
  );
}

type RevealButtonProps = Omit<ComponentProps<'button'>, 'children' | 'disabled'> & {
  /** Names the button for screen readers and opens beside the icon on hover and focus. */
  label: string;
  /** A Lucide icon. */
  icon: ReactNode;
  /** `panel`: the dialogue panel's 30px buttons; `header`: the top bar's 34px controls. */
  variant?: Variant;
  round?: boolean;
  /**
   * Can't be used: its feature isn't there yet, or it has nothing to do now. Greyed out and inert,
   * but still focusable, and its label still opens — the player can read what it is.
   */
  unavailable?: boolean;
};

/**
 * An icon button whose label opens on its left on hover or keyboard focus: the button widens,
 * the icon stays where it was, and the buttons on the left move over. In a `RevealGroup`, one
 * label is open at a time and stays open while the pointer is in the row.
 */
export function RevealButton({
  label,
  icon,
  variant = 'panel',
  round = false,
  unavailable = false,
  onClick,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: RevealButtonProps) {
  const id = useId();
  const group = useContext(GroupContext);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const open = focused || (group ? group.open === id : hovered);

  return (
    <Pill
      aria-label={label}
      aria-disabled={unavailable || undefined}
      data-open={open || undefined}
      $variant={variant}
      $round={round}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        if (!unavailable) {
          onClick?.(event);
        }
      }}
      onPointerEnter={(event) => {
        if (group) {
          group.setOpen(id);
        } else {
          setHovered(true);
        }
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovered(false);
        onPointerLeave?.(event);
      }}
      // From the keyboard only: a click doesn't take focus (PlainButton), and a tap shouldn't
      // leave the label open.
      onFocus={(event) => {
        setFocused(event.currentTarget.matches(':focus-visible'));
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      {...props}
    >
      <Label aria-hidden>
        <LabelText>{label}</LabelText>
      </Label>
      <Icon>{icon}</Icon>
    </Pill>
  );
}

const sizes = {
  panel: css`
    --size: ${({ theme }) => u(theme.button.height)};
    --radius: ${({ theme }) => u(theme.button.radius)};
    --icon: ${({ theme }) => u(theme.button.iconSize)};
    --text: ${({ theme }) => theme.colors.buttonText};
    --background: ${({ theme }) => theme.colors.buttonBackground};
    --border: ${({ theme }) => theme.colors.buttonBorder};
  `,
  header: css`
    --size: ${({ theme }) => u(theme.header.buttonSize)};
    --radius: ${({ theme }) => u(theme.header.buttonRadius)};
    --icon: ${({ theme }) => u(theme.header.iconSize)};
    --text: ${({ theme }) => theme.colors.controlText};
    --background: ${({ theme }) => theme.colors.controlBackground};
    --border: ${({ theme }) => theme.colors.controlBorder};
  `,
};

const Label = styled.span`
  min-width: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
`;

const LabelText = styled.span`
  padding-left: ${({ theme }) => u(theme.button.paddingX)};
  font-size: ${({ theme }) => u(theme.typography.buttonSize)};
  line-height: 1;
  white-space: nowrap;
`;

const Icon = styled.span`
  display: grid;
  place-items: center;

  /* Lucide icons, thinner than Lucide's default 2 to match the design's hairlines. */
  & > svg {
    width: var(--icon);
    height: var(--icon);
    stroke-width: ${({ theme }) => theme.icons.strokeWidth};
  }
`;

// The label's column opens from nothing to its width; the icon keeps a square of its own.
const Pill = styled(PlainButton)<{ $variant: Variant; $round: boolean }>`
  ${({ $variant }) => sizes[$variant]}
  ${({ $round }) =>
    $round &&
    css`
      --radius: 999px;
    `}

  flex: none;
  display: grid;
  grid-template-columns: 0fr var(--size);
  height: var(--size);
  padding: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--background);
  color: var(--text);
  transition:
    grid-template-columns ${({ theme }) => theme.timing.revealMs}ms ease-out,
    background ${({ theme }) => theme.timing.revealMs}ms,
    color ${({ theme }) => theme.timing.revealMs}ms;

  &[data-open] {
    grid-template-columns: 1fr var(--size);
    background: ${({ theme }) => theme.colors.buttonBackgroundHover};
    color: ${({ theme }) => theme.colors.buttonText};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.focusRing};
  }

  &[aria-pressed='true'] {
    color: ${({ theme }) => theme.colors.selectedText};
    border-color: ${({ theme }) => theme.colors.selectedBorder};
    background: ${({ theme }) => theme.colors.selectedBackground};
  }

  &[aria-disabled='true'] {
    color: ${({ theme }) => theme.colors.textDisabled};
    border-color: ${({ theme }) => theme.colors.buttonBorderDisabled};
    background: transparent;
    cursor: not-allowed;
  }

  &[aria-disabled='true'][data-open] {
    color: ${({ theme }) => theme.colors.textNav};
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
