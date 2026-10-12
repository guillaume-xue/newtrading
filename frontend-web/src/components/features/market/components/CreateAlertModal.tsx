'use client';

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import { InputField } from '@/components/ui/InputField';
import { Button } from '@/components/ui/Button';
import { SelectTrigger } from '@/components/ui/SelectTrigger';

import { alertApi, CreateAlertPayload } from '@/lib/api/alertApi';
import { lightColors } from '@/theme/generated/light';
import { darkColors } from '@/theme/generated/dark';
import { primitives } from '@/theme/generated/primitives';

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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

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
              backgroundColor: theme['colors_bg_secondary'] ?? '#1E222D',
              borderColor: theme['colors_select_border'] ?? '#2A2E39',
            },
          ]}
        >
          {/* En-tête */}
          <Text
            style={[
              styles.title,
              { color: theme['colors_input_primary-text'] ?? '#FFFFFF' },
            ]}
          >
            Nouvelle alerte — {assetCode}
          </Text>

          {errorMessage ? (
            <View
              style={[
                styles.errorBanner,
                {
                  backgroundColor: theme['colors_input_warning-border']
                    ? `${theme['colors_input_warning-border']}20`
                    : '#EF535020',
                  borderColor: theme['colors_input_warning-border'] ?? '#EF5350',
                },
              ]}
            >
              <Text
                style={[
                  styles.errorText,
                  { color: theme['colors_input_warning-text'] ?? '#EF5350' },
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
              { color: theme['colors_input_secondary-text'] ?? '#787B86' },
            ]}
          >
            Condition de déclenchement
          </Text>
          <View style={styles.conditionRow}>
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
              { color: theme['colors_input_secondary-text'] ?? '#787B86' },
            ]}
          >
            Canal de notification
          </Text>
          <SelectTrigger
            label={channelLabels[notificationChannel]}
            variant="boxed"
            direction="down"
            onPress={cycleChannel}
            style={styles.selectTrigger}
          />

          {/* Actions */}
          <View style={styles.actionsRow}>
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
    padding: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 12,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    padding: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
    zIndex: 10,
  },
  title: {
    fontSize: primitives['typography_font size_font-size-16'] ?? 18,
    lineHeight: primitives['typography_line height_line-height-24'] ?? 24,
    fontWeight: '700',
    marginBottom: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
  },
  sectionLabel: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
    fontWeight: '500',
    marginBottom: primitives['spacing & layout_padding & margin_space-2'] ?? 6,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: primitives['spacing & layout_padding & margin_space-2'] ?? 8,
    marginBottom: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
  },
  conditionButton: {
    flex: 1,
  },
  selectTrigger: {
    width: '100%',
    marginBottom: primitives['spacing & layout_padding & margin_space-6'] ?? 24,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
  },
  actionButton: {
    minWidth: 100,
  },
  errorBanner: {
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    borderWidth: primitives['border width_border-thin'] ?? 1,
    padding: primitives['spacing & layout_padding & margin_space-3'] ?? 12,
    marginBottom: primitives['spacing & layout_padding & margin_space-4'] ?? 16,
  },
  errorText: {
    fontSize: primitives['typography_font size_font-size-12'] ?? 12,
    lineHeight: primitives['typography_line height_line-height-16'] ?? 16,
    fontWeight: '500',
  },
});
