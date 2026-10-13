'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { alertApi, AlertResponse } from '@/lib/api/alertApi';

interface AlertPanelProps {
  assetCode: string;
  onAddPress: () => void;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ assetCode, onAddPress }) => {
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ALERTES</Text>
        <Pressable style={styles.addButton} onPress={onAddPress} accessibilityRole="button">
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator color="#009F6B" style={styles.feedback} />
      ) : assetAlerts.length === 0 ? (
        <Text style={styles.emptyText}>Aucune alerte configurée pour le moment.</Text>
      ) : (
        <View style={styles.list}>
          {assetAlerts.map((alert) => (
            <View key={alert.id} style={styles.alertRow}>
              <View>
                <Text style={styles.assetCode}>{alert.assetCode}</Text>
                <Text style={styles.condition}>
                  {alert.triggerCondition === 'ABOVE' ? 'Au-dessus de' : 'En-dessous de'}
                </Text>
              </View>
              <Text style={styles.targetPrice}>
                {alert.targetPrice.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })} USD
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 48,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B0F19',
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#009F6B',
  },
  feedback: {
    marginTop: 24,
  },
  emptyText: {
    padding: 16,
    fontSize: 12,
    color: '#6B7280',
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 6,
  },
  assetCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B0F19',
  },
  condition: {
    marginTop: 4,
    fontSize: 11,
    color: '#6B7280',
  },
  targetPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#009F6B',
  },
});

export default AlertPanel;
