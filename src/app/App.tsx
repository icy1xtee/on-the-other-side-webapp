import styled, { ThemeProvider } from 'styled-components';
import { theme } from '@/app/styles/theme';

// Placeholder screen until step 4 brings screen switching between the menu and the game.
const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily};
`;

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Title>On the Other Side</Title>
    </ThemeProvider>
  );
}
