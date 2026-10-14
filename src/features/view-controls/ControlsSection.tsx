import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { bindingOfKey, CONTROL_GROUPS, inputId, KEYMAP, type Input } from '@/shared/config/keymap';
import { u } from '@/shared/lib/units';
import { Keycap } from '@/shared/ui/Keycap';
import { MouseGlyph } from '@/shared/ui/MouseGlyph';

/** The keys the keymap binds, named as keyboards print them; a key not here shows itself. */
const KEY_NAMES = {
  ' ': 'key.space',
  Enter: 'key.enter',
  Tab: 'key.tab',
  Control: 'key.ctrl',
  PageUp: 'key.pageUp',
  PageDown: 'key.pageDown',
  Escape: 'key.esc',
  F1: 'key.f1',
} as const;

/** How long the wheel stays lit after a turn. */
const WHEEL_LIT_MS = 250;

const CLICK = inputId({ type: 'mouse', mouse: 'click' });

/**
 * The game menu's «Управление» — Ren'Py's help screen: what the keys and the mouse do, by groups,
 * drawn from the keymap the input handlers use, so it can't fall behind them. Keys are keycaps,
 * the mouse a glyph. While it is open the game takes no keys, so the player may try them here:
 * the key held down lights up.
 */
export function ControlsSection() {
  const { t } = useTranslation();
  const lit = useLitInputs();
  const ids = useId();

  return (
    <Scroller tabIndex={0}>
      <Hint>{t('controls.hint')}</Hint>
      {CONTROL_GROUPS.map((group) => (
        <Group key={group.id} aria-labelledby={`${ids}-${group.id}`}>
          <GroupName id={`${ids}-${group.id}`}>{t(`controls.group.${group.id}`)}</GroupName>
          <Rows>
            {group.actions.map((action) => (
              <Row key={action}>
                <Action>{t(`controls.${action}`)}</Action>
                <Inputs>
                  {KEYMAP[action].map((input: Input) => (
                    <InputView key={inputId(input)} input={input} lit={lit.has(inputId(input))} />
                  ))}
                </Inputs>
              </Row>
            ))}
          </Rows>
        </Group>
      ))}
    </Scroller>
  );
}

function InputView({ input, lit }: { input: Input; lit: boolean }) {
  const { t } = useTranslation();
  switch (input.type) {
    case 'key':
      return (
        <Keycap $wide={input.key === ' '} $lit={lit}>
          {input.key in KEY_NAMES ? t(KEY_NAMES[input.key as keyof typeof KEY_NAMES]) : input.key}
        </Keycap>
      );
    case 'keys':
      return (
        <Run>
          <Keycap $lit={lit}>{input.from}</Keycap>
          <Dash>–</Dash>
          <Keycap $lit={lit}>{input.to}</Keycap>
        </Run>
      );
    case 'mouse':
      return <MouseGlyph input={input.mouse} label={t(`mouse.${input.mouse}`)} lit={lit} />;
    case 'button':
      // A button of the dialogue panel, by its name there.
      return <Chip>{t(`dialogue.action.${input.button}`)}</Chip>;
  }
}

/**
 * The inputs being used now, by `inputId`: keys while held, the left button while down, the
 * wheel for a moment after each turn. The keys that do something in the open menu still do it —
 * Tab moves the focus, Esc closes the menu — but none reaches the game.
 */
function useLitInputs(): ReadonlySet<string> {
  const [lit, setLit] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    const light = (id: string, on: boolean) =>
      setLit((current) => {
        if (current.has(id) === on) {
          return current;
        }
        const next = new Set(current);
        if (on) {
          next.add(id);
        } else {
          next.delete(id);
        }
        return next;
      });
    const lightKey = (event: KeyboardEvent, on: boolean) => {
      const binding = bindingOfKey(event.key);
      if (binding) {
        light(inputId(binding.input), on);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => lightKey(event, true);
    const onKeyUp = (event: KeyboardEvent) => lightKey(event, false);
    const lightClick = (event: PointerEvent, on: boolean) => {
      if (event.button === 0) {
        light(CLICK, on);
      }
    };
    const onPointerDown = (event: PointerEvent) => lightClick(event, true);
    const onPointerUp = (event: PointerEvent) => lightClick(event, false);
    // Keys let go in another window never come back up here.
    const onBlur = () => setLit(new Set());
    const wheelTimers = new Map<string, number>();
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) {
        return;
      }
      const id = inputId({ type: 'mouse', mouse: event.deltaY < 0 ? 'wheelUp' : 'wheelDown' });
      light(id, true);
      window.clearTimeout(wheelTimers.get(id));
      wheelTimers.set(
        id,
        window.setTimeout(() => light(id, false), WHEEL_LIT_MS),
      );
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('blur', onBlur);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('wheel', onWheel);
      wheelTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return lit;
}

const Scroller = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: ${({ theme }) =>
    `${u(theme.controls.paddingTop)} ${u(theme.gameMenu.contentPaddingX)} ${u(theme.controls.paddingBottom)}`};
  outline: none;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
`;

const Hint = styled.p`
  margin-bottom: ${({ theme }) => u(theme.controls.hintGap)};
  font-size: ${({ theme }) => u(theme.typography.hintSize)};
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textHint};
`;

const Group = styled.section`
  display: grid;
  grid-template-columns: ${({ theme }) => u(theme.controls.groupWidth)} minmax(0, 1fr);
  column-gap: ${({ theme }) => u(theme.controls.groupGapX)};
  padding: ${({ theme }) => u(theme.controls.groupPaddingY)} 0;
  border-top: 1px solid ${({ theme }) => theme.colors.hairline};
`;

// As tall as a row, so the name stands level with the group's first action.
const GroupName = styled.h3`
  padding: ${({ theme }) => u(theme.controls.rowPaddingY)} 0;
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.controlsGroupSize)};
  font-weight: 400;
  line-height: ${({ theme }) => u(theme.keycap.height)};
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Rows = styled.ul`
  list-style: none;
`;

const Row = styled.li`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => u(theme.controls.rowPaddingY)} ${({ theme }) => u(theme.controls.rowGapX)};
  padding: ${({ theme }) => u(theme.controls.rowPaddingY)} 0;
`;

const Action = styled.span`
  font-size: ${({ theme }) => u(theme.typography.controlsActionSize)};
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.buttonText};
`;

const Inputs = styled.span`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => u(theme.controls.inputGap)};
`;

const Run = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${u(4)};
`;

const Dash = styled.span`
  font-family: ${({ theme }) => theme.typography.monoFamily};
  font-size: ${({ theme }) => u(theme.typography.keycapSize)};
  color: ${({ theme }) => theme.colors.textMuted};
`;

/** A button of the panel: a pill with its name, like the label it opens on the panel. */
const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  height: ${({ theme }) => u(theme.keycap.height)};
  padding: 0 ${({ theme }) => u(theme.keycap.chipPaddingX)};
  border: 1px solid ${({ theme }) => theme.colors.buttonBorder};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.buttonBackground};
  color: ${({ theme }) => theme.colors.buttonText};
  font-size: ${({ theme }) => u(theme.typography.buttonSize)};
  line-height: 1;
  white-space: nowrap;
`;
