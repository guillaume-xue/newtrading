// src/screens/home/components/HomePageShell.tsx
'use client';

import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { TopMarketTickerBar } from '@/components/layout/TopMarketTickerBar';
import { AppHeader, HeaderVariant } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { AuthSelectionScreen, AuthModalType } from '@/screens/AuthSelectionScreen';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useAppTheme } from '@/theme/ThemeContext';

export interface HomePageShellProps {
  activeNavId: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onLoginPress: () => void;
  onRegisterPress: () => void;
  onProfilePress: () => void;
  showAuthSelection: boolean;
  targetModal: AuthModalType;
  onModalChange: (modal: AuthModalType) => void;
  onAuthSuccess: () => void;
  onBackFromAuth: () => void;
  children: React.ReactNode;
}

/**
 * Shell principal de la page d'accueil : gère l'affichage conditionnel
 * entre le parcours d'authentification intégré et la vue Marchés complète.
 */
export const HomePageShell: React.FC<HomePageShellProps> = ({
  activeNavId,
  searchValue,
  onSearchChange,
  onLoginPress,
  onRegisterPress,
  onProfilePress,
  showAuthSelection,
  targetModal,
  onModalChange,
  onAuthSuccess,
  onBackFromAuth,
  children,
}) => {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { isAuthenticated } = useAuthStore();

  const headerVariant: HeaderVariant = useMemo(
    () => (isAuthenticated ? 'authenticated' : 'guest'),
    [isAuthenticated]
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors['colors_bg_primary'] }]}>
      {!showAuthSelection && (
        <>
          <TopMarketTickerBar />
          <AppHeader
            variant={headerVariant}
            activeNavId={activeNavId}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            onLoginPress={onLoginPress}
            onRegisterPress={onRegisterPress}
            onProfilePress={onProfilePress}
          />
        </>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {showAuthSelection ? (
            <AuthSelectionScreen
              initialModal={targetModal}
              onModalChange={onModalChange}
              onAuthSuccess={onAuthSuccess}
              onBack={onBackFromAuth}
            />
          ) : (
            children
          )}
        </View>

        {!showAuthSelection && <AppFooter />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingVertical: 4,
  },
});
