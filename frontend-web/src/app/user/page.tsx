'use client';

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/layout/AppHeader';
import { TopMarketTickerBar } from '@/components/layout/TopMarketTickerBar';
import { AppFooter } from '@/components/layout/AppFooter';
import { UserScreen } from '@/screens/UserScreen';

export default function UserPage() {
  return (
    <View style={styles.container}>
      <TopMarketTickerBar isMarketOpen={true} statusLabel="Marchés ouverts" timezone="UTC+2" />
      <AppHeader />
      <UserScreen />
      <AppFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
});
