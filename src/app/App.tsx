import { observer } from 'mobx-react-lite';
import { ThemeProvider } from 'styled-components';
import { StoreProvider } from '@/app/providers/StoreProvider';
import { useStores } from '@/app/providers/useStores';
import type { RootStore } from '@/app/stores/RootStore';
import { GlobalStyle } from '@/app/styles/global';
import { theme } from '@/app/styles/theme';
import { GamePage } from '@/pages/game/GamePage';
import { MainMenuPage } from '@/pages/main-menu/MainMenuPage';

type AppProps = {
  rootStore: RootStore;
};

export default function App({ rootStore }: AppProps) {
  return (
    <StoreProvider store={rootStore}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Screens />
      </ThemeProvider>
    </StoreProvider>
  );
}

// Pages get callbacks instead of reading stores: app/ sits above pages/ and wires them up.
const Screens = observer(function Screens() {
  const { ui } = useStores();

  switch (ui.screen) {
    case 'menu':
      return <MainMenuPage onNewGame={ui.showGame} />;
    case 'game':
      return <GamePage />;
  }
});
