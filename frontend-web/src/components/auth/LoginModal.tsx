// components/auth/LoginModal.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Image from 'next/image';

import Logo from '@/assets/icons/Logo.svg';
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

  useEffect(() => {
    if (error) clearError();
  }, [email, password, error, clearError]);

  const isValid = useMemo(() => {
    return EMAIL_REGEX.test(email.trim()) && password.length >= 1;
  }, [email, password]);

  const handleClose = () => {
    setEmail('');
    setPassword('');
    clearError();
    onClose();
  };

  const handleSubmit = async () => {
    if (!isValid || isLoading) return;
    try {
      await login({ email, password });
      handleClose();
      onSuccess();
    } catch {
      // Géré via useAuthStore
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.overlayDismiss} onPress={handleClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors['colors_bg_secondary'],
                borderColor: colors['colors_divider_text'],
                borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeftSpacer} />
              <View style={styles.logoWrapper}>
                <Image
                  src={Logo}
                  width={38}
                  height={24}
                  alt="NewTrading Logo"
                  style={styles.headerLogo}
                />
              </View>
              <Pressable onPress={handleClose} style={styles.closeButton} hitSlop={12}>
                <View style={styles.crossIcon}>
                  <View
                    style={[
                      styles.crossLine,
                      { backgroundColor: colors['colors_text_primary'] },
                      { transform: [{ rotate: '45deg' }] },
                    ]}
                  />
                  <View
                    style={[
                      styles.crossLine,
                      { backgroundColor: colors['colors_text_primary'] },
                      { transform: [{ rotate: '-45deg' }] },
                    ]}
                  />
                </View>
              </Pressable>
            </View>

            {/* Corps */}
            <View style={styles.body}>
              <View style={styles.inputWrapper}>
                <Text
                  style={[
                    styles.title,
                    {
                      color: colors['colors_text_primary'],
                      fontSize: primitives['typography_font size_font-size-24'] ?? 24,
                    },
                  ]}
                >
                  Se connecter
                </Text>
                <Text
                  style={[
                    styles.subtitle,
                    {
                      color: colors['colors_text_secondary'],
                      fontSize: primitives['typography_font size_font-size-14'] ?? 14,
                    },
                  ]}
                >
                  Accédez à votre espace NewTrading
                </Text>

                {error && (
                  <View
                    style={[
                      styles.errorBanner,
                      {
                        backgroundColor: colors['colors_badge_down-bg'],
                        borderColor: colors['colors_badge_down-border'],
                      },
                    ]}
                  >
                    <Text style={[styles.errorText, { color: colors['colors_badge_down-text'] }]}>
                      {error}
                    </Text>
                  </View>
                )}

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

                {onNavigateToSignUp && (
                  <View style={styles.footerLinkRow}>
                    <Text
                      style={[
                        styles.footerText,
                        {
                          color: colors['colors_text_secondary'],
                          fontSize: primitives['typography_font size_font-size-12'] ?? 12,
                        },
                      ]}
                    >
                      Pas encore de compte ?
                    </Text>
                    <Pressable
                      onPress={() => {
                        handleClose();
                        onNavigateToSignUp();
                      }}
                    >
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
                )}
              </View>
            </View>

            <View style={styles.footer}>
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
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  overlayDismiss: {
    ...StyleSheet.absoluteFill,
  },
  keyboardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalCard: {
    width: 480,
    minHeight: 400,
    maxWidth: '100%',
    paddingHorizontal: 40,
    paddingVertical: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.25)',
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerLeftSpacer: {
    width: 24,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    objectFit: 'contain',
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  crossIcon: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  crossLine: {
    position: 'absolute',
    width: 18,
    height: 1.5,
    borderRadius: 1,
  },
  body: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginVertical: 20,
  },
  inputWrapper: {
    width: '100%',
    maxWidth: 380,
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldsGap: {
    width: '100%',
    gap: 12,
  },
  errorBanner: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
  footerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  footerText: {},
  linkText: {
    fontWeight: '600',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    width: '100%',
    maxWidth: 380,
    height: 48,
  },
});

export default LoginModal;
