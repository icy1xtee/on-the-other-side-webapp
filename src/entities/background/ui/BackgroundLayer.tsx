import styled from 'styled-components';

type BackgroundLayerProps = {
  /** Image URL; nothing is drawn without one, leaving the stage's own backdrop. */
  src: string | undefined;
};

/** The scene art across the top of the frame, shaded where the dialogue panel lies over it. */
export function BackgroundLayer({ src }: BackgroundLayerProps) {
  return (
    <Scene>
      {src && <Image src={src} alt="" draggable={false} />}
      <Shade />
    </Scene>
  );
}

const Scene = styled.div`
  position: absolute;
  inset: 0 0 auto;
  height: ${({ theme }) => theme.stage.sceneHeight}px;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Shade = styled.div`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.surfaces.sceneShade};
`;
