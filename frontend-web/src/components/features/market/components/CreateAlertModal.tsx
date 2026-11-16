'use client';

// src/components/features/market/components/CreateAlertModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';

import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { SelectTrigger } from '@/components/ui/SelectTrigger';

import { alertApi, CreateAlertPayload } from '@/lib/api/alertApi';
import { useAppTheme } from '@/theme/ThemeContext';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetCode: string;
  currentPrice?: number;
  onAlertCreated?: () => void;
}

export const CreateAlertModal: React.FC<CreateAlertModalProps> = ({
  isOpen,
  onClose,
  assetCode,
  currentPrice,
  onAlertCreated,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;

  const [targetPrice, setTargetPrice] = useState<string>(
    currentPrice !== undefined ? String(currentPrice) : ''
  );
  const [triggerCondition, setTriggerCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [notificationChannel, setNotificationChannel] = useState<'EMAIL' | 'PUSH' | 'BOTH'>('EMAIL');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const channelLabels: Record<'EMAIL' | 'PUSH' | 'BOTH', string> = {
    EMAIL: 'E-mail',
    PUSH: 'Notification Push',
    BOTH: 'E-mail et Push',
  };

  const cycleChannel = () => {
    if (notificationChannel === 'EMAIL') setNotificationChannel('PUSH');
    else if (notificationChannel === 'PUSH') setNotificationChannel('BOTH');
    else setNotificationChannel('EMAIL');
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    const parsedPrice = parseFloat(targetPrice);

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('Le prix cible doit être supérieur à zéro.');
      return;
    }

    setLoading(true);
    try {
      const payload: CreateAlertPayload = {
        assetCode,
        targetPrice: parsedPrice,
        triggerCondition,
        notificationChannel,
      };

      await alertApi.createAlert(payload);
      if (onAlertCreated) onAlertCreated();
      onClose();
    } catch {
      setErrorMessage('Impossible d’enregistrer l’alerte. Réessayez plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.modalContainer,
            {
              backgroundColor: colors['colors_bg_secondary'],
              borderColor: colors['colors_divider_text'],
              borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 12,
              borderWidth: primitives['border width_border-thin'] ?? 1,
              padding: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
            },
          ]}
        >
          {/* En-tête */}
          <Text
            style={[
              styles.title,
              {
                color: colors['colors_text_primary'],
                fontSize: primitives['typography_font size_font-size-16'] ?? 18,
                lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
                marginBottom: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
              },
            ]}
          >
            Nouvelle alerte — {assetCode}
          </Text>

          {errorMessage ? (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: colors['colors_badge_down-bg'],
                  borderColor: colors['colors_badge_down-border'],
                  borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
                  borderWidth: primitives['border width_border-thin'] ?? 1,
                  padding: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
                  marginBottom: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
                },
              ]}
            >
              <Text
                style={[
                  styles.errorText,
                  {
                    color: colors['colors_badge_down-text'],
                    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
                    lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
                  },
                ]}
              >
                {errorMessage}
              </Text>
            </View>
          ) : null}

          {/* Sélection Condition */}
          <Text
            style={[
              styles.sectionLabel,
              {
                color: colors['colors_text_secondary'],
                fontSize: primitives['typography_font size_font-size-12'] ?? 12,
                lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
                marginBottom: primitives['spacing & layout_padding & margin_space-2'] ?? 6,
              },
            ]}
          >
            Condition de déclenchement
          </Text>
          <View
            style={[
              styles.conditionRow,
              {
                gap: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
                marginBottom: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
              },
            ]}
          >
            <View style={styles.conditionButton}>
              <Button
                label="Prix ≥ Seuil"
                variant={triggerCondition === 'ABOVE' ? 'buy' : 'outline'}
                size="md"
                onPress={() => setTriggerCondition('ABOVE')}
              />
            </View>
            <View style={styles.conditionButton}>
              <Button
                label="Prix ≤ Seuil"
                variant={triggerCondition === 'BELOW' ? 'sell' : 'outline'}
                size="md"
                onPress={() => setTriggerCondition('BELOW')}
              />
            </View>
          </View>

          {/* Saisie Prix cible */}
          <InputField
            label="Prix cible"
            value={targetPrice}
            onChangeText={setTargetPrice}
            keyboardType="decimal-pad"
            placeholder="0.00"
            suffix="USD"
          />

          {/* Sélection Canal via SelectTrigger */}
          <Text
            style={[
              styles.sectionLabel,
              {
                color: colors['colors_text_secondary'],
                fontSize: primitives['typography_font size_font-size-12'] ?? 12,
                lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
                marginBottom: primitives['spacing & layout_padding & margin_space-2'] ?? 6,
              },
            ]}
          >
            Canal de notification
          </Text>
          <SelectTrigger
            label={channelLabels[notificationChannel]}
            variant="boxed"
            direction="down"
            onPress={cycleChannel}
            style={[
              styles.selectTrigger,
              { marginBottom: primitives['spacing & layout_padding & margin_space-6'] ?? 24 },
            ]}
          />

          {/* Actions */}
          <View
            style={[
              styles.actionsRow,
              { gap: primitives['spacing & layout_padding & margin_space-3'] ?? 12 },
            ]}
          >
            <View style={styles.actionButton}>
              <Button
                label="Annuler"
                variant="secondary"
                size="md"
                disabled={loading}
                onPress={onClose}
              />
            </View>
            <View style={styles.actionButton}>
              <Button
                label="Confirmer"
                variant="primary"
                size="md"
                loading={loading}
                onPress={handleSubmit}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    zIndex: 10,
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
  },
  title: {
    fontWeight: '700',
  },
  sectionLabel: {
    fontWeight: '500',
  },
  conditionRow: {
    flexDirection: 'row',
  },
  conditionButton: {
    flex: 1,
  },
  selectTrigger: {
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    minWidth: 100,
  },
  errorBanner: {},
  errorText: {
    fontWeight: '500',
  },
});

export default CreateAlertModal;
