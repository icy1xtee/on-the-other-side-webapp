import { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { StageFrame, type Frame } from '@/entities/frame/ui/Frame';

type Shown = { key: string; frame: Frame };

type SceneViewProps = Frame & {
  /** Skip is running: frames change at once, as Ren'Py shows no transitions while skipping. */
  instant?: boolean;
};

/**
 * The scene — background and characters — with Ren'Py's `dissolve` between frames: the old
 * frame fades out over the new one. The engine already gathers every change up to the next
 * line or choice into one state (in Ren'Py, too, `show` alone draws nothing), so a new
 * background, one character gone and another come are one transition, not three. The first
 * frame fades in from black.
 */
export function SceneView({ background, sprites, instant = false }: SceneViewProps) {
  const frame = { background, sprites };
  const key = frameKey(frame);
  const [shown, setShown] = useState<Shown>({ key, frame });
  const [leaving, setLeaving] = useState<Shown | 'black' | null>('black');

  // A new frame: the one on screen becomes the one dissolving away. Set during render, so the
  // new frame never shows for a moment without the old one over it.
  if (key !== shown.key) {
    setLeaving(instant ? null : shown);
    setShown({ key, frame });
  }

  return (
    <Scene>
      <Layer>
        <StageFrame frame={shown.frame} />
      </Layer>
      {leaving && (
        <Leaving
          key={leaving === 'black' ? 'black' : leaving.key}
          $black={leaving === 'black'}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) {
              setLeaving(null);
            }
          }}
        >
          {leaving !== 'black' && <StageFrame frame={leaving.frame} />}
        </Leaving>
      )}
    </Scene>
  );
}

/** Two frames are the same picture when the same files stand in the same places. */
function frameKey({ background, sprites }: Frame): string {
  const people = sprites.map(({ tag, src, at }) => `${tag}:${src ?? ''}:${at}`).join(',');
  return `${background ?? ''}|${people}`;
}

const dissolve = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const Scene = styled.div`
  position: absolute;
  inset: 0;
`;

const Layer = styled.div`
  position: absolute;
  inset: 0;
`;

const Leaving = styled(Layer)<{ $black: boolean }>`
  ${({ $black, theme }) =>
    $black &&
    css`
      background: ${theme.colors.stageBackground};
    `}
  pointer-events: none;
  animation: ${dissolve} ${({ theme }) => theme.timing.transitionMs}ms ease-in-out forwards;

  /* Still ends — at once — so the old frame is taken away. */
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 1ms;
  }
`;
