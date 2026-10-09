// screens/HomeScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, useColorScheme } from 'react-native';

import { AppHeader, HeaderVariant } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { AuthSelectionScreen, AuthModalType } from '@/screens/AuthSelectionScreen';
import { TradeScreen } from '@/screens/TradeScreen';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';

export const HomeScreen: React.FC = () => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const [activeTab, setActiveTab] = useState<string>('markets');
  const [search, setSearch] = useState<string>('');
  const [headerVariant, setHeaderVariant] = useState<HeaderVariant>('guest');

  const [showAuthSelection, setShowAuthSelection] = useState<boolean>(false);
  const [targetModal, setTargetModal] = useState<AuthModalType>(null);

  const handleLoginPress = () => {
    setTargetModal('login');
    setShowAuthSelection(true);
  };

  const handleRegisterPress = () => {
    setTargetModal('signup');
    setShowAuthSelection(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthSelection(false);
    setTargetModal(null);
    setHeaderVariant('authenticated');
  };

  const handleBackToHome = () => {
    setShowAuthSelection(false);
    setTargetModal(null);
  };

  // Bascule immédiate vers la vue Trading
  if (activeTab === 'trade') {
    return <TradeScreen onBackToHome={() => setActiveTab('markets')} />;
  }

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: theme['colors_bg_primary'] ?? '#F3F4F6' },
      ]}
    >
      {!showAuthSelection && (
        <AppHeader
          variant={headerVariant}
          activeNavId={activeTab}
          onSelectNav={setActiveTab}
          searchValue={search}
          onSearchChange={setSearch}
          onLoginPress={handleLoginPress}
          onRegisterPress={handleRegisterPress}
        />
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          {showAuthSelection ? (
            <AuthSelectionScreen
              initialModal={targetModal}
              onModalChange={setTargetModal}
              onAuthSuccess={handleAuthSuccess}
              onBack={handleBackToHome}
            />
          ) : (
            <View style={styles.emptyContainer} />
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
    // @ts-ignore
    minHeight: '100vh',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  mainContent: {
    flex: 1,
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
  },
});

export default HomeScreen;
