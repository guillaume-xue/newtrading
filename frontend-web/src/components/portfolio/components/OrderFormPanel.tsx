'use client';

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Image from 'next/image';

import DotsIcon from '@/assets/icons/fi-rr-menu-dots.svg';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { lightColors } from '@/theme/generated/light';
import { primitives } from '@/theme/generated/primitives';
import { tradeApi } from '@/lib/api/tradeApi';

interface OrderFormPanelProps {
  assetCode: string;
  currentPrice: number;
  availableBalance: number;
  onOrderSuccess: () => void;
}

export const OrderFormPanel: React.FC<OrderFormPanelProps> = ({
  assetCode,
  currentPrice,
  availableBalance,
  onOrderSuccess,
}) => {
  const [direction, setDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [price, setPrice] = useState<string>('63,321.50');
  const [size, setSize] = useState<string>('1.00');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExecuteOrder = async (targetDirection: 'BUY' | 'SELL') => {
    setDirection(targetDirection);
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
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message ?? 'Erreur d’exécution de l’ordre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Titre de section ORDRE & Menu Options */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ORDRE</Text>
        <TouchableOpacity style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Image src={DotsIcon} width={16} height={16} alt="Options" style={styles.dotsIcon} />
        </TouchableOpacity>
      </View>

      {/* 2. Boutons segmentés collés Buy & Sell */}
      <View style={styles.buttonSegment}>
        <Button
          label="Buy"
          subtitle="123,23"
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
          subtitle="123,23"
          variant={direction === 'SELL' ? 'sell' : 'secondary'}
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

      {/* 3. Champ Price (USD) avec label interne et suffixe Limite */}
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

      {/* 4. Champ Size (BTC) avec label interne et Available */}
      <View style={styles.fieldWrapper}>
        <InputField
          label="Size (BTC)"
          value={size}
          onChangeText={setSize}
          keyboardType="decimal-pad"
          suffix={<Text style={styles.suffixText}>Available: {availableBalance.toFixed(2)}</Text>}
          style={styles.fieldInput}
        />
      </View>

      {/* Indicateur de chargement ou d'erreur éventuel */}
      {loading && (
        <View style={styles.feedbackRow}>
          <ActivityIndicator size="small" color={lightColors['colors_button_buy']} />
          <Text style={styles.feedbackText}>Exécution en cours…</Text>
        </View>
      )}

      {errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}

      {/* 5. Titre de section HISTORIQUE & Menu Options */}
      <View style={[styles.sectionHeader, styles.historyHeader]}>
        <Text style={styles.sectionTitle}>HISTORIQUE</Text>
        <TouchableOpacity style={styles.iconBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Image src={DotsIcon} width={16} height={16} alt="Options" style={styles.dotsIcon} />
        </TouchableOpacity>
      </View>
    </View>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0B0F19',
    letterSpacing: -0.2,
  },
  iconBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsIcon: {
    filter: 'brightness(0) opacity(0.8)',
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
  historyHeader: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
});

export default OrderFormPanel;
