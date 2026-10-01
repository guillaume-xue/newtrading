import * as DarkTokens from './generated/dark';
import * as LightTokens from './generated/light';
import * as Primitives from './generated/primitives';

export const Theme = {
  primitives: Primitives,
  dark: DarkTokens,
  light: LightTokens,
};

// Hook simple si tu utilises un state de thème ou useColorScheme() de React Native
export type ColorTheme = typeof DarkTokens;
