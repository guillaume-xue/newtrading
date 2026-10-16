'use client';

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/Button';
import { darkColors } from '@/theme/generated/dark';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';

interface FeatureComingSoonProps {
  title: string;
  description: string;
  targetVersion?: string;
  activeNavId: string;
}

export const FeatureComingSoon: React.FC<FeatureComingSoonProps> = ({
  title,
  description,
  targetVersion = 'V1.1',
  activeNavId,
}) => {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme['colors_bg_primary'] ?? '#F8FAFC' },
      ]}
    >
      <AppHeader activeNavId={activeNavId} />

      <View style={styles.content}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme['colors_bg_secondary'] ?? '#FFFFFF',
              borderColor: theme['colors_divider_text'] ?? '#E2E8F0',
            },
          ]}
        >
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Bientôt disponible • {targetVersion}</Text>
          </View>

          <Text
            style={[
              styles.title,
              { color: theme['colors_text_primary'] ?? '#0B0F19' },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.description,
              { color: theme['colors_text_secondary'] ?? '#64748B' },
            ]}
          >
            {description}
          </Text>

          <View style={styles.actionsRow}>
            <Button
              label="Aller sur le Trading"
              variant="primary"
              size="md"
              shape="rounded"
              onPress={() => router.push('/trade')}
            />
            <Button
              label="Retour aux Marchés"
              variant="outline"
              size="md"
              shape="rounded"
              onPress={() => router.push('/')}
            />
          </View>
        </View>
      </View>

      <AppFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 12,
    borderWidth: 1,
    padding: 36,
    alignItems: 'center',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
  },
  badge: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 16,
  },
  badgeText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 420,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
