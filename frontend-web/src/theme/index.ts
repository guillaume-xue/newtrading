import { darkColors } from './generated/dark';
import { lightColors } from './generated/light';
import { primitives } from './generated/primitives';

// 1. Définition du contrat sémantique
export type ThemeColors = typeof darkColors | typeof lightColors;
export type PrimitivesTokens = typeof primitives;

export interface AppTheme {
  colors: ThemeColors;
  primitives: PrimitivesTokens;
  isDark: boolean;
}

// 2. Thèmes complets
export const darkTheme: AppTheme = {
  colors: darkColors,
  primitives,
  isDark: true,
};

export const lightTheme: AppTheme = {
  colors: lightColors,
  primitives,
  isDark: false,
};

// 3. Export statique pour usages hors composants (ex: configuration de Lightweight Charts)
export const themes = {
  dark: darkTheme,
  light: lightTheme,
} as const;
