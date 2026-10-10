import { observer } from 'mobx-react-lite';
import { ThemeProvider } from 'styled-components';
import type { RootStore } from '@/app/stores/RootStore';
import { GlobalStyle } from '@/app/styles/global';
import { theme } from '@/app/styles/theme';
import { GamePage } from '@/pages/game/GamePage';
import { MainMenuPage } from '@/pages/main-menu/MainMenuPage';
import { StoreProvider } from '@/shared/lib/stores/StoreProvider';
import { useStores } from '@/shared/lib/stores/useStores';

type AppProps = {
  rootStore: RootStore;
};

export default function App({ rootStore }: AppProps) {
  return (
    <StoreProvider stores={rootStore}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Screens />
      </ThemeProvider>
    </StoreProvider>
  );
}

const Screens = observer(function Screens() {
  const { ui } = useStores();

  switch (ui.screen) {
    case 'menu':
      return <MainMenuPage />;
    case 'game':
      return <GamePage />;
  }
});
