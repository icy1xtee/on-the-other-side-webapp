import type { ReactNode } from 'react';
import styled, { type DefaultTheme } from 'styled-components';
import { MIN_STAGE_SCALE, STAGE_HEIGHT, STAGE_WIDTH } from '@/shared/config/stage';
import { useStageFit } from '@/shared/lib/useStageFit';

type StageProps = {
  background?: ReactNode;
  sprites?: ReactNode;
  ui?: ReactNode;
  overlay?: ReactNode;
};

/**
 * The 1920×1080 frame, scaled as a whole to fit the window; the rest of the window is letterbox.
 * Layers bottom to top: background → sprites → UI → overlay (Ren'Py's master / screens / overlay).
 */
export function Stage({ background, sprites, ui, overlay }: StageProps) {
  const { ref, fit } = useStageFit<HTMLDivElement>();

  return (
    <Viewport ref={ref}>
      {fit && fit.scale < MIN_STAGE_SCALE && (
        <TooSmall>
          <p>Окно слишком маленькое</p>
          <p>
            Разверните его или увеличьте хотя бы до {STAGE_WIDTH * MIN_STAGE_SCALE} ×{' '}
            {STAGE_HEIGHT * MIN_STAGE_SCALE}
          </p>
        </TooSmall>
      )}
      {fit && fit.scale >= MIN_STAGE_SCALE && (
        // Inline style, not a styled prop: a styled prop would mint a new CSS class on every
        // resize. No will-change either: it freezes the raster and blurs text after rescaling.
        <Frame
          data-scale={fit.scale.toFixed(3)}
          style={{
            transform: `translate(${fit.offsetX}px, ${fit.offsetY}px) scale(${fit.scale})`,
          }}
        >
          <Layer $z="background">{background}</Layer>
          <Layer $z="sprites">{sprites}</Layer>
          <Layer $z="ui">{ui}</Layer>
          <Layer $z="overlay">{overlay}</Layer>
        </Frame>
      )}
    </Viewport>
  );
}

const Viewport = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.letterbox};
`;

const Frame = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${({ theme }) => theme.stage.width}px;
  height: ${({ theme }) => theme.stage.height}px;
  transform-origin: 0 0;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.stageBackground};
`;

/**
 * Layers span the whole frame, so an empty upper layer would swallow clicks meant for the ones
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

const TooSmall = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  text-align: center;
  font-size: 16px;
`;
