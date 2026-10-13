import styled from 'styled-components';
import { u } from '@/shared/lib/units';
import { PlainButton } from './PlainButton';

type SegmentedProps<T extends string> = {
  value: T;
  options: ReadonlyArray<{ value: T; label: string; lang?: string }>;
  onChange: (value: T) => void;
  /** Names the group for screen readers: the row's label. */
  label: string;
};

/** One of a few, side by side: the chosen one lit in teal. Language, text size. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: SegmentedProps<T>) {
  return (
    <Group role="group" aria-label={label}>
      {options.map((option) => (
        <Option
          key={option.value}
          lang={option.lang}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Option>
      ))}
    </Group>
  );
}

const Group = styled.div`
  display: flex;
  gap: ${({ theme }) => u(theme.segmented.gap)};
  padding: ${({ theme }) => u(theme.segmented.padding)};
  border: 1px solid ${({ theme }) => theme.colors.controlBorder};
  border-radius: ${({ theme }) => u(theme.segmented.radius)};
  background: ${({ theme }) => theme.colors.controlBackground};
`;

const Option = styled(PlainButton)`
  height: ${({ theme }) => u(theme.segmented.height)};
  min-width: ${({ theme }) => u(theme.segmented.minWidth)};
  padding: 0 ${({ theme }) => u(theme.segmented.paddingX)};
  border: 1px solid transparent;
  border-radius: ${({ theme }) => u(theme.segmented.optionRadius)};
  color: ${({ theme }) => theme.colors.textNav};
  font-size: ${({ theme }) => u(theme.typography.buttonSize)};
  white-space: nowrap;
  transition: color 150ms;

  &:hover {
    color: ${({ theme }) => theme.colors.textStrong};
  }

  &[aria-pressed='true'] {
    border-color: ${({ theme }) => theme.colors.selectedBorder};
    background: ${({ theme }) => theme.colors.selectedBackground};
    color: ${({ theme }) => theme.colors.selectedText};
    cursor: default;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.focusRing};
  }
`;
