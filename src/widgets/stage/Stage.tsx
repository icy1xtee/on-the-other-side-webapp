import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { type DefaultTheme } from 'styled-components';
import { getUiScale, needsLandscape } from '@/shared/lib/uiScale';
import { useViewportSize } from '@/shared/lib/useViewportSize';
import { u } from '@/shared/lib/units';

type StageProps = {
  background?: ReactNode;
  sprites?: ReactNode;
  ui?: ReactNode;
  overlay?: ReactNode;
  /**
   * A window is open in the overlay: the layers under it are `inert` — Tab can't reach their
   * buttons, nor a click their content, until it closes.
   */
  modal?: boolean;
  /** A click anywhere on the stage; clicks on empty layers fall through to it. */
  onClick?: MouseEventHandler<HTMLDivElement>;
};

/**
 * The game fills the whole window — no bars. Sizes follow one UI scale, set here as the CSS
 * variable `--u` and read through `u()`; positions are percentages, so the layout reflows on
 * any aspect ratio. Layers bottom to top: background → sprites → UI → overlay (Ren'Py's master /
 * screens / overlay). A phone held upright is asked to turn: the game is made for landscape.
 */
export function Stage({ background, sprites, ui, overlay, modal = false, onClick }: StageProps) {
  const { ref, size } = useViewportSize<HTMLDivElement>();
  const { t } = useTranslation();

  const style = size
    ? ({ '--u': getUiScale(size.width, size.height) } as CSSProperties)
    : undefined;

  return (
    <Viewport ref={ref} style={style} onClick={onClick}>
      {size && needsLandscape(size.width, size.height) && (
        <RotateHint>
          <p>{t('stage.rotateTitle')}</p>
          <p>{t('stage.rotateHint')}</p>
        </RotateHint>
      )}
      {size && !needsLandscape(size.width, size.height) && (
        <>
          <Layer $z="background" inert={modal}>
            {background}
          </Layer>
          <Layer $z="sprites" inert={modal}>
            {sprites}
          </Layer>
          <Layer $z="ui" inert={modal}>
            {ui}
          </Layer>
          <Layer $z="overlay">{overlay}</Layer>
        </>
      )}
    </Viewport>
  );
}

const Viewport = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.surfaces.stage};
  background-color: ${({ theme }) => theme.colors.stageBackground};
`;

/**
 * Layers span the whole stage, so an empty upper layer would swallow clicks meant for the ones
 * below. Layers themselves ignore the pointer; their content takes it back.
 */
const Layer = styled.div<{ $z: keyof DefaultTheme['zIndex'] }>`
  position: absolute;
  inset: 0;
  z-index: ${({ theme, $z }) => theme.zIndex[$z]};
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

const RotateHint = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${u(10)};
  padding: 24px;
  text-align: center;
  font-size: ${u(18)};
  color: ${({ theme }) => theme.colors.text};

  & > p:last-child {
    font-size: ${u(14)};
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;
