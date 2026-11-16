// App.tsx
'use client';

import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { HomeScreen } from '@/screens/HomeScreen';
import { useAppTheme } from '@/theme/ThemeContext';

export default function App() {
  const { theme } = useAppTheme();
  const { colors, isDark } = theme;

  return (
    <SafeAreaView
      style={[
        styles.root,
        { backgroundColor: colors['colors_bg_secondary'] },
      ]}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <HomeScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
