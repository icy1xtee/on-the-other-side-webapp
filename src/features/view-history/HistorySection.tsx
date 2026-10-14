import { observer } from 'mobx-react-lite';
import { useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useStores } from '@/shared/lib/stores/useStores';
import { u } from '@/shared/lib/units';

/**
 * The game menu's History — Ren'Py's history screen: the lines read in this game and the choices
 * made, oldest at the top, opened at the newest. The line on screen is there too, as in Ren'Py.
 * Kept as keys, so it reads in the player's language of the moment. An entry leads nowhere:
 * going back is rollback's job.
 */
export const HistorySection = observer(function HistorySection() {
  const { game } = useStores();
  const { t } = useTranslation();
  const { t: tStory } = useTranslation('story');
  const scroller = useRef<HTMLDivElement>(null);
  const entries = game.history;

  // Opens at the bottom, where the story is now.
  useLayoutEffect(() => {
    const element = scroller.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [entries.length]);

  if (entries.length === 0) {
    return <Empty>{t('history.empty')}</Empty>;
  }

  return (
    <Scroller ref={scroller} tabIndex={0}>
      <List>
        {entries.map((entry, index) => (
          // The history only grows and shrinks at its end: the place is a stable key.
          <li key={index}>
            {entry.kind === 'choice' ? (
              <Choice>
                <Mark>{t('history.choice')}</Mark>
                <ChoiceText>→ {tStory(entry.text)}</ChoiceText>
              </Choice>
            ) : (
              <>
                {entry.kind === 'line' && <Name>{tStory(entry.speaker)}</Name>}
                <Text>{tStory(entry.text)}</Text>
              </>
            )}
          </li>
        ))}
      </List>
    </Scroller>
  );
});

const Scroller = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme }) =>
    `${u(theme.history.paddingTop)} ${u(theme.gameMenu.contentPaddingX)} ${u(theme.history.paddingBottom)}`};
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => `${theme.colors.sliderTrack} transparent`};

  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.colors.focusRing};
  }
`;

const List = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => u(theme.history.gap)};
  max-width: ${({ theme }) => u(theme.history.maxWidth)};
`;

const Name = styled.div`
  margin-bottom: ${({ theme }) => u(theme.history.nameGap)};
  color: ${({ theme }) => theme.colors.textStrong};
  font-size: ${({ theme }) => u(theme.typography.historyNameSize)};
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
`;

const Text = styled.div`
  color: ${({ theme }) => theme.colors.dialogueText};
  font-size: ${({ theme }) => u(theme.typography.historyTextSize)};
  line-height: ${({ theme }) => theme.typography.lineHeight};
  text-wrap: pretty;
`;

const Choice = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => u(theme.history.markGap)};
`;

const Mark = styled.span`
  flex: none;
  padding: ${({ theme }) => `${u(theme.history.markPaddingY)} ${u(theme.history.markPaddingX)}`};
  border: 1px solid ${({ theme }) => theme.colors.accentBorderQuiet};
  border-radius: ${({ theme }) => u(theme.history.markRadius)};
  color: ${({ theme }) => theme.colors.accentTextQuiet};
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.historyMarkSize)};
  line-height: 1;
  letter-spacing: 0.2em;
  text-transform: uppercase;
`;

const ChoiceText = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  font-size: ${({ theme }) => u(theme.typography.historyChoiceSize)};
  line-height: 1.4;
`;

const Empty = styled.div`
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: ${({ theme }) => u(theme.typography.bodySize)};
`;
