import type { SpritePosition } from '@engine';
import styled, { type DefaultTheme } from 'styled-components';
import { DESIGN_HEIGHT, DESIGN_WIDTH } from '@/shared/config/design';
import { u } from '@/shared/lib/units';

export type CharacterSprite = {
  tag: string;
  src: string | undefined;
  at: SpritePosition;
};

/** What the scene shows at one moment: a background and the characters over it. */
export type Frame = {
  background: string | undefined;
  /** In z-order: later sprites are drawn on top. */
  sprites: readonly CharacterSprite[];
};

/**
 * The frame on the stage: the scene art across the top of the window, shaded where the dialogue
 * panel lies over it, and the characters standing on its bottom edge from under the header.
 */
export function StageFrame({ frame }: { frame: Frame }) {
  return (
    <SceneBox>
      {frame.background && <Background src={frame.background} alt="" draggable={false} />}
      <Shade />
      <Sprites sprites={frame.sprites} $top={(theme) => u(theme.header.height)} />
    </SceneBox>
  );
}

/**
 * The same frame shrunk into a box of any shape — a save's thumbnail. The scene keeps its
 * proportions and is cropped to the box from the middle, like `cover`; the characters stand
 * where they stand on the stage.
 */
export function FrameThumbnail({ frame, className }: { frame: Frame; className?: string }) {
  return (
    <ThumbnailBox className={className}>
      <ThumbnailScene>
        {frame.background && <Background src={frame.background} alt="" draggable={false} />}
        <Sprites sprites={frame.sprites} $top={(theme) => `${headerShare(theme)}%`} />
      </ThumbnailScene>
    </ThumbnailBox>
  );
}

/**
 * Characters on their columns. Keyed by tag, so a new emotion swaps the image of the same
 * element — Ren'Py's replace-by-tag shows up as a change, not as a second sprite.
 */
function Sprites({
  sprites,
  $top,
}: {
  sprites: readonly CharacterSprite[];
  $top: (theme: DefaultTheme) => string;
}) {
  return (
    <>
      {sprites.map(({ tag, src, at }) =>
        src ? <Sprite key={tag} src={src} alt="" draggable={false} $at={at} $top={$top} /> : null,
      )}
    </>
  );
}

/** The scene's height on the design page, which the stage art fills. */
const sceneHeight = (theme: DefaultTheme) => (DESIGN_HEIGHT * theme.layout.scenePercent) / 100;

/** How much of the scene's height the header covers: characters start under it. */
const headerShare = (theme: DefaultTheme) => (theme.header.height / sceneHeight(theme)) * 100;

const SceneBox = styled.div`
  position: absolute;
  inset: 0 0 auto;
  height: ${({ theme }) => theme.layout.scenePercent}%;
`;

const ThumbnailBox = styled.div`
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.stageBackground};
`;

const ThumbnailScene = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  height: 100%;
  min-width: 100%;
  aspect-ratio: ${({ theme }) => `${DESIGN_WIDTH} / ${sceneHeight(theme)}`};
  transform: translateX(-50%);
`;

/** `cover` crops the art to the box's shape instead of leaving bars. */
const Background = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Shade = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.surfaces.sceneShade};
`;

// A column down to the scene's bottom edge; the art keeps its proportions and stands on it. The
// height is explicit: an absolutely positioned image with `height: auto` takes its own height
// and ignores `bottom`.
const Sprite = styled.img<{ $at: SpritePosition; $top: (theme: DefaultTheme) => string }>`
  position: absolute;
  left: ${({ theme, $at }) => theme.sprite[$at]}%;
  width: ${({ theme }) => theme.sprite.widthPercent}%;
  top: ${({ theme, $top }) => $top(theme)};
  height: ${({ theme, $top }) => `calc(100% - ${$top(theme)})`};
  object-fit: contain;
  object-position: center bottom;
`;
