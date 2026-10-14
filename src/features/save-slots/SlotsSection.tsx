import { Trash2 } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { useLayoutEffect, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { FrameThumbnail, type Frame } from '@/entities/frame/ui/Frame';
import { SAVE_SLOTS, type SaveSlot } from '@/shared/config/saveSlots';
import { formatSavedAt } from '@/shared/lib/format';
import { useStores } from '@/shared/lib/stores/useStores';
import { u } from '@/shared/lib/units';
import { PlainButton } from '@/shared/ui/PlainButton';

type SlotsSectionProps = {
  /** Save puts the game on screen into a slot; Load picks a game up, the autosave included. */
  mode: 'save' | 'load';
};

/** A save as a slot shows it, in the player's language. */
type SlotText = {
  frame: Frame;
  /** When it was saved: `12.10.2026 · 18:42`. */
  savedAt: string;
  /** The scene's title; empty for a scene without one. */
  title: string;
  /** The line on screen there, with its speaker; empty at a choice without a prompt. */
  line: string;
};

/**
 * Ren'Py's file slots — the Save and Load sections of the game menu: six slots, three by two,
 * each with a thumbnail of its frame (drawn from the save, as the stage draws it), the date, the
 * scene and the line there; Load has the autosave over them. A slot in use asks before it is
 * overwritten. Its bin, out on hover and focus, deletes it after asking; so does Delete on it —
 * Ren'Py's `save_delete`. The slots are read from storage as the section opens.
 */
export const SlotsSection = observer(function SlotsSection({ mode }: SlotsSectionProps) {
  const { saves, settings, requestSave, requestLoad, requestDelete } = useStores();
  const { t } = useTranslation();
  const { t: tStory } = useTranslation('story');

  // Before the first paint, so the grid never shows what storage held before.
  useLayoutEffect(() => {
    saves.readSlots();
  }, [saves]);

  const text = (source: SaveSlot | 'auto'): SlotText | null => {
    const preview = saves.preview(source);
    if (!preview) {
      return null;
    }
    const { frame, savedAt, sceneTitle, line } = preview;
    return {
      frame,
      savedAt: formatSavedAt(savedAt, settings.language),
      title: sceneTitle && tStory(sceneTitle),
      line: line
        ? [line.speaker && tStory(line.speaker), tStory(line.text)].filter(Boolean).join(': ')
        : '',
    };
  };
  const autosave = mode === 'load' ? text('auto') : null;

  return (
    <Scroller>
      {autosave && (
        <AutosaveCard aria-label={t('slots.loadAutosave')} onClick={() => requestLoad('auto')}>
          <AutosaveThumbnail frame={autosave.frame} />
          <AutosaveBody>
            <AutosaveHead>
              <AutosaveTitle>{t('slots.autosave')}</AutosaveTitle>
              <Meta>{autosave.savedAt}</Meta>
            </AutosaveHead>
            {autosave.title && <AutosaveScene>{autosave.title}</AutosaveScene>}
            {autosave.line && <Line>{autosave.line}</Line>}
          </AutosaveBody>
        </AutosaveCard>
      )}
      <Grid aria-label={t('slots.list')}>
        {SAVE_SLOTS.map((slot) => (
          <li key={slot}>
            <Slot
              slot={slot}
              mode={mode}
              save={text(slot)}
              onPick={() => (mode === 'save' ? requestSave(slot) : requestLoad(slot))}
              onDelete={() => requestDelete(slot)}
            />
          </li>
        ))}
      </Grid>
    </Scroller>
  );
});

type SlotProps = {
  slot: SaveSlot;
  mode: SlotsSectionProps['mode'];
  /** What the slot holds; null when it is empty. */
  save: SlotText | null;
  onPick: () => void;
  onDelete: () => void;
};

function Slot({ slot, mode, save, onPick, onDelete }: SlotProps) {
  const { t } = useTranslation();

  if (!save) {
    // An empty slot takes the game in Save; in Load it has nothing to give.
    return mode === 'save' ? (
      <EmptySlot aria-label={t('slots.saveTo', { slot })} onClick={onPick}>
        {t('slots.empty')}
      </EmptySlot>
    ) : (
      <EmptySlot disabled aria-label={t('slots.emptySlot', { slot })}>
        {t('slots.empty')}
      </EmptySlot>
    );
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Delete') {
      event.preventDefault();
      onDelete();
    }
  };

  return (
    <Used>
      <Card
        aria-label={t(mode === 'save' ? 'slots.overwrite' : 'slots.load', {
          slot,
          title: save.title || save.line,
        })}
        onClick={onPick}
        onKeyDown={onKeyDown}
      >
        <Thumbnail frame={save.frame} />
        <Body>
          <Meta>{t('slots.meta', { slot, savedAt: save.savedAt })}</Meta>
          {save.title && <Title>{save.title}</Title>}
          {save.line && <Line>{save.line}</Line>}
        </Body>
      </Card>
      <Bin aria-label={t('slots.delete')} onClick={onDelete}>
        <Trash2 />
      </Bin>
    </Used>
  );
}

const Scroller = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => u(theme.slots.gap)};
  overflow-y: auto;
  padding: ${({ theme }) =>
    `${u(theme.slots.paddingTop)} ${u(theme.gameMenu.contentPaddingX)} ${u(theme.slots.paddingBottom)}`};
  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => `${theme.colors.sliderTrack} transparent`};
`;

const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${({ theme }) => u(theme.slots.gridGap)};
  margin: 0;
  padding: 0;
  list-style: none;
`;

/** A card that lights up under the pointer and the focus: a used slot, the autosave. */
const card = css`
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.panelBorder};
  border-radius: ${({ theme }) => u(theme.slots.radius)};
  background: ${({ theme }) => theme.colors.slotBackground};
  text-align: left;
  transition:
    border-color 150ms,
    background 150ms;

  &:hover {
    border-color: ${({ theme }) => theme.colors.slotBorderHover};
    background: ${({ theme }) => theme.colors.slotBackgroundHover};
  }

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.slotBorderFocus};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.focusRing};
  }
`;

const ellipsis = css`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const AutosaveCard = styled(PlainButton)`
  ${card}
  flex: none;
  display: flex;
  align-items: stretch;
`;

const AutosaveThumbnail = styled(FrameThumbnail)`
  flex: none;
  width: ${({ theme }) => u(theme.slots.autosaveThumbWidth)};
  height: ${({ theme }) => u(theme.slots.autosaveThumbHeight)};
`;

const AutosaveBody = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => u(theme.slots.autosaveGap)};
  padding: ${({ theme }) => `${u(theme.slots.autosavePaddingY)} ${u(theme.slots.autosavePaddingX)}`};
`;

const AutosaveHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${u(12)};
`;

const AutosaveTitle = styled.div`
  font-size: ${({ theme }) => u(theme.typography.autosaveTitleSize)};
  font-weight: 500;
  letter-spacing: -0.01em;
  color: ${({ theme }) => theme.colors.textStrong};
`;

const AutosaveScene = styled.div`
  ${ellipsis}
  font-size: ${({ theme }) => u(theme.typography.slotTitleSize)};
  color: ${({ theme }) => theme.colors.text};
`;

/** Holds a used slot and its bin, side by side: a button can't hold another. */
const Used = styled.div`
  position: relative;
  height: 100%;

  &:hover > button:last-child,
  &:focus-within > button:last-child {
    opacity: 1;
    pointer-events: auto;
  }
`;

const Card = styled(PlainButton)`
  ${card}
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Thumbnail = styled(FrameThumbnail)`
  flex: none;
  width: 100%;
  aspect-ratio: 16 / 9;
`;

const Body = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => u(theme.slots.bodyGap)};
  padding: ${({ theme }) =>
    `${u(theme.slots.bodyPaddingTop)} ${u(theme.slots.bodyPaddingX)} ${u(theme.slots.bodyPaddingBottom)}`};
`;

// Spaced out less than the design's 0.18em, which leaves no room in a slot for the time.
const Meta = styled.div`
  ${ellipsis}
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.slotMetaSize)};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Title = styled.div`
  ${ellipsis}
  font-size: ${({ theme }) => u(theme.typography.slotTitleSize)};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textStrong};
`;

const Line = styled.div`
  ${ellipsis}
  font-size: ${({ theme }) => u(theme.typography.slotLineSize)};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// Out of sight until the pointer or the focus is on its slot, yet in the Tab order: tabbing onto
// it brings it out.
const Bin = styled(PlainButton)`
  position: absolute;
  top: ${({ theme }) => u(theme.slots.binInset)};
  right: ${({ theme }) => u(theme.slots.binInset)};
  width: ${({ theme }) => u(theme.slots.binSize)};
  height: ${({ theme }) => u(theme.slots.binSize)};
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.binBorder};
  border-radius: ${({ theme }) => u(theme.slots.binRadius)};
  background: ${({ theme }) => theme.colors.binBackground};
  backdrop-filter: blur(6px);
  color: ${({ theme }) => theme.colors.sliderValue};
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 150ms,
    color 150ms,
    border-color 150ms;

  & > svg {
    width: ${({ theme }) => u(theme.slots.binIconSize)};
    height: ${({ theme }) => u(theme.slots.binIconSize)};
    stroke-width: ${({ theme }) => theme.icons.strokeWidth};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.dangerText};
    border-color: ${({ theme }) => theme.colors.dangerBorder};
  }

  &:focus-visible {
    outline: none;
    color: ${({ theme }) => theme.colors.dangerText};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.binFocusRing};
  }
`;

const EmptySlot = styled(PlainButton)`
  width: 100%;
  height: 100%;
  min-height: ${({ theme }) => u(theme.slots.emptyMinHeight)};
  display: grid;
  place-items: center;
  border: 1px dashed ${({ theme }) => theme.colors.buttonBorder};
  border-radius: ${({ theme }) => u(theme.slots.radius)};
  background: ${({ theme }) => theme.colors.emptySlotBackground};
  color: ${({ theme }) => theme.colors.emptySlotText};
  font-size: ${({ theme }) => u(theme.typography.emptySlotSize)};
  transition:
    color 150ms,
    border-color 150ms,
    background 150ms;

  &:enabled:hover {
    border-color: ${({ theme }) => theme.colors.emptySlotBorderHover};
    background: ${({ theme }) => theme.colors.emptySlotBackgroundHover};
    color: ${({ theme }) => theme.colors.selectedText};
  }

  &:focus-visible {
    outline: none;
    border-color: ${({ theme }) => theme.colors.emptySlotBorderHover};
    color: ${({ theme }) => theme.colors.selectedText};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.focusRing};
  }

  &:disabled {
    border-color: ${({ theme }) => theme.colors.panelBorder};
    background: ${({ theme }) => theme.colors.emptySlotBackgroundOff};
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: default;
  }
`;
