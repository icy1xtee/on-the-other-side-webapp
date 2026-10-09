import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { u } from '@/shared/lib/units';

type ChoiceListProps = {
  /** Only the options the player may pick, in the story's language; `index` goes back on a pick. */
  options: ReadonlyArray<{ index: number; text: string }>;
  onChoose: (index: number) => void;
};

/**
 * The options of a choice: lines of text under the prompt, inside the dialogue panel, that light
 * up on hover or keyboard focus. Each is a button, so a click on one never advances the dialogue
 * as well, and Tab and Enter pick one from the keyboard.
 *
 * They come in one after another and can't be clicked until halfway in: the panel was being
 * clicked through a moment ago, and that click shouldn't land on an option that just appeared.
 */
export function ChoiceList({ options, onChoose }: ChoiceListProps) {
  const { t } = useTranslation('story');

  return (
    <List>
      {options.map(({ index, text }, order) => (
        <li key={index}>
          <Option
            type="button"
            style={{ '--order': order } as CSSProperties}
            onClick={() => onChoose(index)}
          >
            {t(text)}
          </Option>
        </li>
      ))}
    </List>
  );
}

const comeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(0.4em);
    pointer-events: none;
  }
`;

// Options are spaced by their line height alone, like lines of text: a prompt and two options
// take the panel's three lines exactly, and the panel doesn't twitch when they come out.
const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Option = styled.button`
  position: relative;
  max-width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.colors.choiceText};
  font-size: ${({ theme }) => u(theme.typography.dialogueSize)};
  line-height: ${({ theme }) => theme.typography.lineHeight};
  text-align: left;
  cursor: pointer;
  transition:
    color 150ms,
    text-shadow 150ms;
  animation: ${comeIn} ${({ theme }) => theme.timing.choiceRevealMs}ms ease-out both;
  animation-delay: ${({ theme }) =>
    `calc(${theme.timing.choiceRevealMs / 3}ms + var(--order) * ${theme.timing.choiceStaggerMs}ms)`};

  /* A glowing dot in the panel's padding, like the logo mark. */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: ${({ theme }) => u(-theme.choice.markerOffset)};
    width: ${({ theme }) => u(theme.choice.markerSize)};
    height: ${({ theme }) => u(theme.choice.markerSize)};
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 0 8px ${({ theme }) => theme.colors.accent};
    opacity: 0;
    transform: translate(-4px, -50%);
    transition:
      opacity 150ms,
      transform 150ms;
  }

  &:hover,
  &:focus-visible {
    outline: none;
    color: ${({ theme }) => theme.colors.choiceTextLit};
    text-shadow: ${({ theme }) => theme.shadows.choiceGlow};
  }

  &:hover::before,
  &:focus-visible::before {
    opacity: 1;
    transform: translate(0, -50%);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
