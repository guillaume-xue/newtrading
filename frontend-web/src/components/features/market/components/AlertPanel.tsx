'use client';

// components/features/market/components/AlertPanel.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { alertApi, AlertResponse } from '@/lib/api/alertApi';
import { useAppTheme } from '@/theme/ThemeContext';

interface AlertPanelProps {
  assetCode: string;
  onAddPress: () => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ assetCode, onAddPress }) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      setAlerts(await alertApi.getAlerts());
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void loadAlerts();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadAlerts]);

  const assetAlerts = alerts.filter((alert) => alert.assetCode === assetCode);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors['colors_bg_secondary'],
          borderLeftColor: colors['colors_divider_text'],
          borderLeftWidth: primitives['border width_border-thin'] ?? 1,
        },
      ]}
    >
      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors['colors_divider_text'],
            borderBottomWidth: primitives['border width_border-thin'] ?? 1,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors['colors_text_primary'] }]}>
          ALERTES
        </Text>
        <Pressable
          style={styles.addButton}
          onPress={onAddPress}
          accessibilityRole="button"
          hitSlop={8}
        >
          <Text
            style={[
              styles.addButtonText,
              { color: colors['colors_badge_primary-action-bg'] },
            ]}
          >
            + Ajouter
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator
          color={colors['colors_badge_primary-action-bg']}
          style={styles.feedback}
        />
      ) : assetAlerts.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors['colors_text_secondary'] }]}>
          Aucune alerte configurée pour le moment.
        </Text>
      ) : (
        <View style={styles.list}>
          {assetAlerts.map((alert) => {
            const isAbove = alert.triggerCondition === 'ABOVE';
            const conditionColor = isAbove
              ? colors['colors_badge_up-text']
              : colors['colors_badge_down-text'];

            return (
              <View
                key={alert.id}
                style={[
                  styles.alertRow,
                  {
                    backgroundColor: colors['colors_bg_secondary'],
                    borderColor: colors['colors_divider_text'],
                    borderWidth: primitives['border width_border-thin'] ?? 1,
                    borderRadius: primitives['spacing & layout_border radius_radius-sm'] ?? 4,
                  },
                ]}
              >
                <View>
                  <Text style={[styles.assetCode, { color: colors['colors_text_primary'] }]}>
                    {alert.assetCode}
                  </Text>
                  <Text style={[styles.condition, { color: colors['colors_text_secondary'] }]}>
                    {isAbove ? '≥ Au-dessus de' : '≤ En-dessous de'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.targetPrice,
                    { color: conditionColor },
                  ]}
                >
                  {alert.targetPrice.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  $
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  header: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  feedback: {
    marginTop: 24,
  },
  emptyText: {
    padding: 16,
    fontSize: 12,
  },
  list: {
    padding: 12,
    gap: 8,
  },
  alertRow: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assetCode: {
    fontSize: 12,
    fontWeight: '800',
  },
  condition: {
    marginTop: 4,
    fontSize: 11,
  },
  targetPrice: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});

export default AlertPanel;
