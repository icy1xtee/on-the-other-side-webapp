import { useId, type ComponentProps, type ReactNode } from 'react';
import styled from 'styled-components';
import { u } from '@/shared/lib/units';
import { Slider } from '@/shared/ui/Slider';

/** A titled group of settings: "Звук", "Текст", "Язык". */
export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Section>
      <GroupTitle>{title}</GroupTitle>
      {children}
    </Section>
  );
}

type SliderRowProps = ComponentProps<typeof Slider> & {
  label: string;
  /** What the value means to the player — also read out by screen readers. */
  valueText: string;
};

/** Label, slider, value — one line of a settings group. */
export function SliderRow({ label, valueText, ...slider }: SliderRowProps) {
  const id = useId();
  return (
    <Row>
      <Label htmlFor={id}>{label}</Label>
      <Slider id={id} aria-valuetext={valueText} {...slider} />
      <Value aria-hidden>{valueText}</Value>
    </Row>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => u(theme.modal.rowGap)};
`;

const GroupTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.logoSize)};
  font-weight: 400;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Row = styled.div`
  align-self: stretch;
  display: grid;
  grid-template-columns: ${({ theme }) =>
    `${u(theme.modal.labelWidth)} minmax(0, 1fr) ${u(theme.modal.valueWidth)}`};
  align-items: center;
  gap: ${({ theme }) => u(theme.modal.rowGap)};
`;

const Label = styled.label`
  font-size: ${({ theme }) => u(theme.typography.labelSize)};
  color: ${({ theme }) => theme.colors.dialogueText};
`;

const Value = styled.span`
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.buttonSize)};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: right;
  white-space: nowrap;
`;
