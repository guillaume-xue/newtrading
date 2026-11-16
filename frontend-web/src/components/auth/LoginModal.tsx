// src/components/auth/LoginModal.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { AuthModalShell } from './AuthModalShell';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useAppTheme } from '@/theme/ThemeContext';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onNavigateToSignUp?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginModal: React.FC<LoginModalProps> = ({
  visible,
  onClose,
  onSuccess,
  onNavigateToSignUp,
}) => {
  const { theme } = useAppTheme();
  const { colors, primitives } = theme;
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Efface l'erreur serveur dès que l'utilisateur modifie ses identifiants[span_58](start_span)[span_58](end_span)
  useEffect(() => {
    if (error) {
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, password]);

  const isValid = useMemo(
    () => EMAIL_REGEX.test(email.trim()) && password.length >= 1,
    [email, password]
  );

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    clearError();
  }, [clearError]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!isValid || isLoading) return;
    try {
      await login({ email: email.trim(), password });
      resetForm();
      onClose();
      onSuccess();
    } catch {
      // Erreur exposée par useAuthStore[span_59](start_span)[span_59](end_span)
    }
  }, [isValid, isLoading, login, email, password, resetForm, onClose, onSuccess]);

  const handleSwitchToSignUp = useCallback(() => {
    if (!onNavigateToSignUp) return;
    resetForm();
    onNavigateToSignUp();
  }, [onNavigateToSignUp, resetForm]);

  return (
    <AuthModalShell
      visible={visible}
      onClose={handleClose}
      title="Se connecter"
      subtitle="Accédez à votre espace NewTrading"
      error={error}
      cardStyle={{ width: 480, minHeight: 400 }}
      footer={
        <Button
          label="Se connecter"
          variant="primary"
          shape="pill"
          size="md"
          disabled={!isValid}
          loading={isLoading}
          style={styles.submitButton}
          onPress={handleSubmit}
        />
      }
    >
      <View style={styles.fieldsGap}>
        <InputField
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        <InputField
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
      </View>

      {onNavigateToSignUp ? (
        <View style={styles.footerLinkRow}>
          <Text
            style={{
              color: colors['colors_text_secondary'],
              fontSize: primitives['typography_font size_font-size-12'] ?? 12,
            }}
          >
            Pas encore de compte ?
          </Text>
          <Pressable onPress={handleSwitchToSignUp}>
            <Text
              style={[
                styles.linkText,
                {
                  color: colors['colors_badge_primary-action-bg'],
                  fontSize: primitives['typography_font size_font-size-12'] ?? 12,
                },
              ]}
            >
              S&apos;inscrire
            </Text>
          </Pressable>
        </View>
      ) : null}
    </AuthModalShell>
  );
};

const styles = StyleSheet.create({
  fieldsGap: {
    width: '100%',
    gap: 12,
  },
  footerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  linkText: {
    fontWeight: '600',
  },
  submitButton: {
    width: '100%',
    maxWidth: 380,
    height: 48,
  },
});

export default LoginModal;
