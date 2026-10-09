import styled from 'styled-components';
import { Button } from '@/shared/ui/Button';
import { Stage } from '@/widgets/stage/Stage';

type MainMenuPageProps = {
  onNewGame: () => void;
};

// The menu lives inside the 16:9 stage, like Ren'Py's main_menu: one coordinate system for
// all UI, and the "window too small" stub covers the menu too.
export function MainMenuPage({ onNewGame }: MainMenuPageProps) {
  return (
    <Stage
      ui={
        <Menu>
          <Title>On the Other Side</Title>
          <Actions>
            <Button onClick={onNewGame}>Новая игра</Button>
            {/* Enabled once a save exists (stage 5) and the settings overlay lands (stage 6). */}
            <Button disabled>Продолжить</Button>
            <Button disabled>Настройки</Button>
          </Actions>
        </Menu>
      }
    />
  );
}

const Menu = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 64px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.titleSize}px;
  font-weight: 400;
`;

const Actions = styled.nav`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;
