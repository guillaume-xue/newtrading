'use client';

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { UserScreen } from '@/screens/UserScreen';

export default function UserPage() {
  return (
    <View style={styles.container}>
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
