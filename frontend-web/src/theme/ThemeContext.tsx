'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, AppTheme } from './index';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();

  // Dark mode par défaut selon les spécifications
  const [mode, setMode] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedIsDark = useMemo(() => {
    if (!mounted) return true; // Évite les soucis de réhydratation SSR
    if (mode === 'system') return systemScheme === 'dark';
    return mode === 'dark';
  }, [mode, systemScheme, mounted]);

  const theme = useMemo(() => (resolvedIsDark ? darkTheme : lightTheme), [resolvedIsDark]);

  const toggleTheme = () => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme doit être encapsulé dans un <ThemeProvider>');
  }
  return context;
};
