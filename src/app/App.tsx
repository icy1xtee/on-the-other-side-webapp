import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '@/app/styles/global';
import { theme } from '@/app/styles/theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      {/* Placeholder until step 4 brings screen switching between the menu and the game. */}
      <h1>On the Other Side</h1>
    </ThemeProvider>
  );
}
