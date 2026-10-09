import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body,
  #root {
    height: 100%;
    overflow: hidden;
  }

  /* The page background is the letterbox around the 16:9 stage. */
  body {
    background: ${({ theme }) => theme.colors.letterbox};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.typography.fontFamily};
    line-height: ${({ theme }) => theme.typography.lineHeight};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    cursor: default;
    /* The whole screen is a click target in a novel; selection would fight with advancing. */
    user-select: none;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
    color: inherit;
  }
`;
