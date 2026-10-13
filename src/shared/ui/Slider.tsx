import type { ComponentProps, CSSProperties } from 'react';
import styled from 'styled-components';
import { u } from '@/shared/lib/units';

type SliderProps = Omit<ComponentProps<'input'>, 'type' | 'value' | 'onChange'> & {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
};

/**
 * A native range input in the design's colours: the arrow keys, Home / End and screen readers
 * work as they do for any slider. The part up to the thumb is filled with the accent; the thumb
 * glows.
 */
export function Slider({ value, min, max, step, onChange, style, ...props }: SliderProps) {
  const fill = ((value - min) / (max - min)) * 100;

  return (
    <Range
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
      {...props}
      style={{ ...style, '--fill': `${fill}%` } as CSSProperties}
    />
  );
}

const Range = styled.input`
  appearance: none;
  width: 100%;
  height: ${({ theme }) => u(theme.slider.height)};
  margin: 0;
  background: transparent;
  cursor: pointer;

  &::-webkit-slider-runnable-track {
    height: ${({ theme }) => u(theme.slider.trackHeight)};
    border-radius: 999px;
    background: ${({ theme }) =>
      `linear-gradient(to right, ${theme.colors.accentFill} var(--fill), ${theme.colors.sliderTrack} var(--fill))`};
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: ${({ theme }) => u(theme.slider.thumbSize)};
    height: ${({ theme }) => u(theme.slider.thumbSize)};
    margin-top: ${({ theme }) =>
      `calc((${u(theme.slider.trackHeight)} - ${u(theme.slider.thumbSize)}) / 2)`};
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.sliderThumb};
    box-shadow: ${({ theme }) => theme.shadows.sliderThumb};
  }

  &::-moz-range-track {
    height: ${({ theme }) => u(theme.slider.trackHeight)};
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.sliderTrack};
  }

  &::-moz-range-progress {
    height: ${({ theme }) => u(theme.slider.trackHeight)};
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.accentFill};
  }

  &::-moz-range-thumb {
    width: ${({ theme }) => u(theme.slider.thumbSize)};
    height: ${({ theme }) => u(theme.slider.thumbSize)};
    border: 0;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.sliderThumb};
    box-shadow: ${({ theme }) => theme.shadows.sliderThumb};
  }

  &:focus-visible {
    outline: none;
  }

  &:focus-visible::-webkit-slider-thumb {
    outline: 2px solid ${({ theme }) => theme.colors.focusRing};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;
