'use client';

// src/components/layout/FeatureComingSoon.tsx
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppFooter } from '@/components/layout/AppFooter';
import { Button } from '@/components/ui/Button';
import { useAppTheme } from '@/theme/ThemeContext';

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
  const { theme } = useAppTheme();
  const { colors, primitives, isDark } = theme;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors['colors_bg_primary'] },
      ]}
    >
      <AppHeader activeNavId={activeNavId} />

      <View style={styles.content}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors['colors_bg_secondary'],
              borderColor: colors['colors_divider_text'],
              borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 12,
              borderWidth: primitives['border width_border-thin'] ?? 1,
              ...Platform.select({
                web: {
                  boxShadow: isDark
                    ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                    : '0 8px 24px rgba(0, 0, 0, 0.06)',
                } as any,
                default: {
                  elevation: 4,
                },
              }),
            },
          ]}
        >
          {/* Badge statut */}
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isDark
                  ? 'rgba(37, 99, 235, 0.2)'
                  : '#EFF6FF',
                borderColor: isDark
                  ? 'rgba(37, 99, 235, 0.4)'
                  : '#BFDBFE',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: colors['colors_badge_primary-action-bg'] },
              ]}
            >
              Bientôt disponible • {targetVersion}
            </Text>
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors['colors_text_primary'],
                fontSize: primitives['typography_font size_font-size-24'] ?? 24,
                lineHeight: primitives['typography_line height_line-height-32'] ?? 32,
              },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.description,
              {
                color: colors['colors_text_secondary'],
                fontSize: primitives['typography_font size_font-size-14'] ?? 14,
                lineHeight: primitives['typography_line height_line-height-20'] ?? 20,
              },
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
    padding: 36,
    alignItems: 'center',
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: 420,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default FeatureComingSoon;
