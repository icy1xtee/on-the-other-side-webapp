import type { SpritePosition } from '@engine';
import styled from 'styled-components';

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

const Sprite = styled.img<{ $at: SpritePosition }>`
  position: absolute;
  left: ${({ theme, $at }) => theme.sprite[$at].left}px;
  top: ${({ theme }) => theme.sprite.top}px;
  width: ${({ theme }) => theme.sprite.width}px;
  height: ${({ theme }) => theme.sprite.bottom - theme.sprite.top}px;
  object-fit: contain;
  object-position: center bottom;
`;
