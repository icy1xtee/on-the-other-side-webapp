import type { SpritePosition } from '@engine';
import styled from 'styled-components';
import { u } from '@/shared/lib/units';

type Sprite = {
  tag: string;
  src: string | undefined;
  at: SpritePosition;
};

type CharacterLayerProps = {
  /** In z-order: later sprites are drawn on top. */
  sprites: readonly Sprite[];
};

/**
 * Characters on their columns. Keyed by tag, so a new emotion swaps the image of the same
 * element — Ren'Py's replace-by-tag shows up as a change, not as a second sprite.
 */
export function CharacterLayer({ sprites }: CharacterLayerProps) {
  return (
    <>
      {sprites.map(({ tag, src, at }) =>
        src ? <Sprite key={tag} src={src} alt="" draggable={false} $at={at} /> : null,
      )}
    </>
  );
}

// A column from under the header to the bottom of the scene; the art keeps its proportions and
// stands on the scene's bottom edge. The height is explicit: an absolutely positioned image with
// `height: auto` takes its own height and ignores `bottom`.
const Sprite = styled.img<{ $at: SpritePosition }>`
  position: absolute;
  left: ${({ theme, $at }) => theme.sprite[$at]}%;
  width: ${({ theme }) => theme.sprite.widthPercent}%;
  top: ${({ theme }) => u(theme.header.height)};
  height: ${({ theme }) => `calc(${theme.layout.scenePercent}% - ${u(theme.header.height)})`};
  object-fit: contain;
  object-position: center bottom;
`;
