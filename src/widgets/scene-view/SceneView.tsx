import { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { BackgroundLayer } from '@/entities/background/ui/BackgroundLayer';
import { CharacterLayer, type CharacterSprite } from '@/entities/character/ui/CharacterLayer';

/** What the scene shows at one moment: a background and the characters over it. */
type Frame = {
  background: string | undefined;
  sprites: readonly CharacterSprite[];
};

type Shown = { key: string; frame: Frame };

/**
 * The scene — background and characters — with Ren'Py's `dissolve` between frames: the old
 * frame fades out over the new one. The engine already gathers every change up to the next
 * line or choice into one state (in Ren'Py, too, `show` alone draws nothing), so a new
 * background, one character gone and another come are one transition, not three. The first
 * frame fades in from black.
 */
export function SceneView({ background, sprites }: Frame) {
  const frame = { background, sprites };
  const key = frameKey(frame);
  const [shown, setShown] = useState<Shown>({ key, frame });
  const [leaving, setLeaving] = useState<Shown | 'black' | null>('black');

  // A new frame: the one on screen becomes the one dissolving away. Set during render, so the
  // new frame never shows for a moment without the old one over it.
  if (key !== shown.key) {
    setLeaving(shown);
    setShown({ key, frame });
  }

  return (
    <Scene>
      <FrameView frame={shown.frame} />
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
          {leaving !== 'black' && <FrameView frame={leaving.frame} />}
        </Leaving>
      )}
    </Scene>
  );
}

function FrameView({ frame }: { frame: Frame }) {
  return (
    <Layer>
      <BackgroundLayer src={frame.background} />
      <CharacterLayer sprites={frame.sprites} />
    </Layer>
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
