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
 * work as they do for any slider. The part up to the thumb is filled with the accent.
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
      `linear-gradient(to right, ${theme.colors.accent} var(--fill), ${theme.colors.sliderTrack} var(--fill))`};
  }

  &::-webkit-slider-thumb {
    appearance: none;
    width: ${({ theme }) => u(theme.slider.thumbSize)};
    height: ${({ theme }) => u(theme.slider.thumbSize)};
    margin-top: ${({ theme }) =>
      `calc((${u(theme.slider.trackHeight)} - ${u(theme.slider.thumbSize)}) / 2)`};
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.sliderThumb};
    transition: box-shadow 150ms;
  }

  &:hover::-webkit-slider-thumb,
  &:focus-visible::-webkit-slider-thumb {
    box-shadow: 0 0 0 ${u(4)} ${({ theme }) => theme.colors.sliderRing};
  }

  &::-moz-range-track {
    height: ${({ theme }) => u(theme.slider.trackHeight)};
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.sliderTrack};
  }

  &::-moz-range-progress {
    height: ${({ theme }) => u(theme.slider.trackHeight)};
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.accent};
  }

  &::-moz-range-thumb {
    width: ${({ theme }) => u(theme.slider.thumbSize)};
    height: ${({ theme }) => u(theme.slider.thumbSize)};
    border: 0;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.sliderThumb};
  }

  &:hover::-moz-range-thumb,
  &:focus-visible::-moz-range-thumb {
    box-shadow: 0 0 0 ${u(4)} ${({ theme }) => theme.colors.sliderRing};
  }

  &:focus-visible {
    outline: none;
  }
`;
