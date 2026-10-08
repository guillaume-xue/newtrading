// components/auth/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'next/navigation'; // ou react-navigation selon la cible
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { primitives } from '@/theme/generated/primitives';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackRoute?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallbackRoute = '/login',
}) => {
  const router = useRouter();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(fallbackRoute);
    }
  }, [isLoading, isAuthenticated, router, fallbackRoute]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={primitives.color_blue_600} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
