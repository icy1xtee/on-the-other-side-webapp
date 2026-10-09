import styled, { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '@/app/styles/global';
import { theme } from '@/app/styles/theme';
import { Stage } from '@/widgets/stage/Stage';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Stage
        ui={
          <StageDebug>
            <DebugTitle>1920 × 1080</DebugTitle>
            <DebugParagraph>
              Съешь же ещё этих мягких французских булок, да выпей чаю. В чащах юга жил бы цитрус?
              Да, но фальшивый экземпляр! Эй, жлоб, где туз? Прячь юных съёмщиц в шкаф.
            </DebugParagraph>
          </StageDebug>
        }
      />
    </ThemeProvider>
  );
}

// Temporary, until step 4 brings the real screens: dashed edges show the frame bounds, and a
// paragraph of Russian text at dialogue size shows how sharp text stays at fractional scales.
const StageDebug = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 48px;
  border: 4px dashed ${({ theme }) => theme.colors.accent};
`;

const DebugTitle = styled.p`
  color: ${({ theme }) => theme.colors.speakerName};
  font-size: ${({ theme }) => theme.typography.speakerNameSize}px;
`;

const DebugParagraph = styled.p`
  width: ${({ theme }) => theme.dialogue.textWidth}px;
  font-size: ${({ theme }) => theme.typography.dialogueSize}px;
`;
