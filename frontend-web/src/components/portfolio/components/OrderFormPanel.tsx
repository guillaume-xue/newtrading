// components/portfolio/components/OrderFormPanel.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';

import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { WidgetHeader } from '@/components/ui/WidgetHeader';
import { LoginModal } from '@/components/auth/LoginModal';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { lightColors } from '@/theme/generated/light';
import { SimulatedTransactionResponse, tradeApi } from '@/lib/api/tradeApi';

interface OrderFormPanelProps {
  assetCode: string;
  currentPrice: number;
  availableBalance: number;
  onOrderSuccess: () => void;
  initialHistory?: SimulatedTransactionResponse[];
}

export const OrderFormPanel: React.FC<OrderFormPanelProps> = ({
  assetCode,
  currentPrice,
  availableBalance,
  onOrderSuccess,
  initialHistory,
}) => {
  const { isAuthenticated } = useAuthStore();

  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [price, setPrice] = useState<string>('0.00');
  const [size, setSize] = useState<string>('1.00');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<SimulatedTransactionResponse[]>(initialHistory ?? []);
  const [historyLoading, setHistoryLoading] = useState<boolean>(!initialHistory);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // État de la modal d'authentification forcée
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

  // Synchronisation du champ de prix avec la cotation en direct du graphique
  useEffect(() => {
    if (currentPrice > 0) {
      setPrice(
        currentPrice.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
  }, [currentPrice]);

  const loadHistory = useCallback(async () => {
    if (!isAuthenticated) {
      setHistoryLoading(false);
      return;
    }

    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const response = await tradeApi.getOrderHistory(0, 10);
      setHistory(response.content);
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      setHistoryError(message ?? 'Impossible de charger l’historique');
    } finally {
      setHistoryLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (initialHistory) return;

    const timeoutId = setTimeout(() => {
      void loadHistory();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [loadHistory, assetCode, initialHistory]);

  const handleExecuteOrder = async (targetDirection: 'BUY' | 'SELL') => {
    setDirection(targetDirection);

    // Contrôle d'authentification préalable
    if (!isAuthenticated) {
      setErrorMessage('Veuillez vous connecter pour exécuter un ordre simulé.');
      setIsAuthModalVisible(true);
      return;
    }

    const parsedQuantity = parseFloat(size.replace(',', '.')) || 0;

    if (parsedQuantity <= 0) {
      setErrorMessage('La quantité doit être strictement positive');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      await tradeApi.placeOrder({
        assetCode,
        orderDirection: targetDirection,
        quantity: parsedQuantity,
      });
      onOrderSuccess();
      if (!initialHistory) {
        await loadHistory();
      }
    } catch (error: unknown) {
      const message = isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      setErrorMessage(message ?? 'Erreur d’exécution de l’ordre');
    } finally {
      setLoading(false);
    }
  };

  const formattedLivePrice = currentPrice > 0
    ? currentPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '---';

  return (
    <>
      <View style={styles.container}>
        <WidgetHeader title="ORDRE" />

        <View style={styles.buttonSegment}>
          <Button
            label="Buy"
            subtitle={formattedLivePrice}
            variant={direction === 'BUY' ? 'buy' : 'secondary'}
            shape="rounded"
            size="md"
            roundedSide="left"
            onPress={() => handleExecuteOrder('BUY')}
            style={{
              ...styles.segmentButton,
              ...(direction !== 'BUY' ? styles.inactiveSegment : {}),
            }}
          />
          <Button
            label="Sell"
            subtitle={formattedLivePrice}
            variant={direction === 'sell' ? 'sell' : 'secondary'}
            shape="rounded"
            size="md"
            roundedSide="right"
            onPress={() => handleExecuteOrder('SELL')}
            style={{
              ...styles.segmentButton,
              ...(direction !== 'SELL' ? styles.inactiveSegment : {}),
            }}
          />
        </View>

        <View style={styles.fieldWrapper}>
          <InputField
            label="Price (USD)"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            suffix={<Text style={styles.suffixText}>Limite</Text>}
            style={styles.fieldInput}
          />
        </View>

        <View style={styles.fieldWrapper}>
          <InputField
            label={`Size (${assetCode})`}
            value={size}
            onChangeText={setSize}
            keyboardType="decimal-pad"
            suffix={
              <Text style={styles.suffixText}>
                Available: {availableBalance.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
              </Text>
            }
            style={styles.fieldInput}
          />
        </View>

        {loading && (
          <View style={styles.feedbackRow}>
            <ActivityIndicator size="small" color={lightColors['colors_button_buy']} />
            <Text style={styles.feedbackText}>Exécution en cours…</Text>
          </View>
        )}

        {errorMessage && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}

        <WidgetHeader title="HISTORIQUE" />
        <ScrollView
          style={styles.historyList}
          contentContainerStyle={styles.historyContent}
          showsVerticalScrollIndicator={false}
        >
          {historyLoading ? (
            <View style={styles.historyFeedback}>
              <ActivityIndicator size="small" color={lightColors['colors_text_secondary']} />
              <Text style={styles.historyFeedbackText}>Chargement…</Text>
            </View>
          ) : historyError ? (
            <Text style={styles.historyErrorText}>{historyError}</Text>
          ) : !isAuthenticated ? (
            <Text style={styles.emptyHistoryText}>Connectez-vous pour voir votre historique</Text>
          ) : history.length === 0 ? (
            <Text style={styles.emptyHistoryText}>Aucune transaction</Text>
          ) : (
            history.map((transaction) => (
              <View key={transaction.id} style={styles.historyRow}>
                <View style={styles.historyMain}>
                  <View style={styles.historyTitleRow}>
                    <Text style={styles.historyAsset}>{transaction.assetCode}</Text>
                    <Text
                      style={[
                        styles.historyDirection,
                        transaction.orderDirection === 'BUY'
                          ? styles.buyText
                          : styles.sellText,
                      ]}
                    >
                      {transaction.orderDirection}
                    </Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {new Date(transaction.executedAt).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <View style={styles.historyValues}>
                  <Text style={styles.historyValue}>
                    {transaction.quantity.toLocaleString('fr-FR', {
                      maximumFractionDigits: 4,
                    })}
                  </Text>
                  <Text style={styles.historyPrice}>
                    {transaction.executionPrice.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })} $
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      <LoginModal
        visible={isAuthModalVisible}
        onClose={() => setIsAuthModalVisible(false)}
        onSuccess={() => {
          setIsAuthModalVisible(false);
          setErrorMessage(null);
          void loadHistory();
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 400,
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  buttonSegment: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    height: 48,
    minHeight: 48,
    borderWidth: 0,
  },
  inactiveSegment: {
    backgroundColor: '#E5E7EB',
  },
  fieldWrapper: {
    marginBottom: 8,
  },
  fieldInput: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    color: '#0B0F19',
  },
  suffixText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  feedbackText: {
    fontSize: 11,
    color: '#6B7280',
  },
  errorText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: 2,
    marginBottom: 6,
  },
  historyList: {
    flex: 1,
    marginTop: 20,
  },
  historyContent: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  historyMain: {
    flex: 1,
    gap: 3,
  },
  historyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyAsset: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B0F19',
  },
  historyDirection: {
    fontSize: 10,
    fontWeight: '800',
  },
  buyText: {
    color: '#059669',
  },
  sellText: {
    color: '#DC2626',
  },
  historyDate: {
    fontSize: 11,
    color: '#6B7280',
  },
  historyValues: {
    alignItems: 'flex-end',
    gap: 3,
  },
  historyValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B0F19',
  },
  historyPrice: {
    fontSize: 11,
    color: '#6B7280',
  },
  historyFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  historyFeedbackText: {
    fontSize: 11,
    color: '#6B7280',
  },
  historyErrorText: {
    paddingVertical: 12,
    fontSize: 11,
    color: '#DC2626',
  },
  emptyHistoryText: {
    paddingVertical: 12,
    fontSize: 11,
    color: '#6B7280',
  },
});

export default OrderFormPanel;
