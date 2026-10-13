import styled from 'styled-components';
import { u } from '@/shared/lib/units';
import { PlainButton } from './PlainButton';

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Names it for screen readers: the row's label. */
  label: string;
  disabled?: boolean;
};

/** An on / off toggle from the design's settings: a knob that slides right and lights up. */
export function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  return (
    <Track
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <Knob />
    </Track>
  );
}

const Knob = styled.span`
  width: ${({ theme }) => u(theme.switch.knobSize)};
  height: ${({ theme }) => u(theme.switch.knobSize)};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.switchOffKnob};
  transition:
    transform 150ms ease-out,
    background 150ms;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Track = styled(PlainButton)`
  flex: none;
  width: ${({ theme }) => u(theme.switch.width)};
  height: ${({ theme }) => u(theme.switch.height)};
  padding: ${({ theme }) => u(theme.switch.padding)};
  display: flex;
  align-items: center;
  border: 1px solid ${({ theme }) => theme.colors.switchOffBorder};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.switchOffBackground};
  transition:
    background 150ms,
    border-color 150ms;

  &:enabled:hover {
    background: ${({ theme }) => theme.colors.buttonBackgroundHover};
  }

  &[aria-checked='true'] {
    border-color: ${({ theme }) => theme.colors.switchOnBorder};
    background: ${({ theme }) => theme.colors.switchOnBackground};
  }

  &[aria-checked='true'] > ${Knob} {
    /* Across the track: its inner width less the knob. */
    transform: translateX(
      ${({ theme }) => u(theme.switch.width - 2 - 2 * theme.switch.padding - theme.switch.knobSize)}
    );
    background: ${({ theme }) => theme.colors.switchOnKnob};
    box-shadow: ${({ theme }) => theme.shadows.switchKnob};
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.focusRing};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;
