import 'styled-components';
import type { AppTheme } from '@/app/styles/theme';

// `props.theme` and `useTheme()` get the shape of the theme object, so a missing token is a
// compile error.
declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}
