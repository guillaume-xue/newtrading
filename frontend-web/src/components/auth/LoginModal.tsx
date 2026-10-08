// components/auth/LoginModal.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Image from 'next/image';

import Logo from '@/assets/icons/Logo.svg';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { primitives } from '@/theme/generated/primitives';
import { lightColors } from '@/theme/generated/light';
import { darkColors } from '@/theme/generated/dark';

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
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (error) clearError();
  }, [email, password]);

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
      // L'erreur est stockée dans le store useAuthStore
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
              { backgroundColor: theme['colors_bg_secondary'] ?? primitives.color_neutral_0 },
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
                      { backgroundColor: theme['colors_text_primary'] ?? primitives.color_neutral_950 },
                      { transform: [{ rotate: '45deg' }] },
                    ]}
                  />
                  <View
                    style={[
                      styles.crossLine,
                      { backgroundColor: theme['colors_text_primary'] ?? primitives.color_neutral_950 },
                      { transform: [{ rotate: '-45deg' }] },
                    ]}
                  />
                </View>
              </Pressable>
            </View>

            {/* Corps */}
            <View style={styles.body}>
              <View style={styles.inputWrapper}>
                <Text style={[styles.title, { color: theme['colors_text_primary'] }]}>
                  Se connecter
                </Text>
                <Text style={[styles.subtitle, { color: theme['colors_text_secondary'] }]}>
                  Accédez à votre espace NewTrading
                </Text>

                {error && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{error}</Text>
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
                    <Text style={[styles.footerText, { color: theme['colors_text_secondary'] }]}>
                      Pas encore de compte ?
                    </Text>
                    <Pressable
                      onPress={() => {
                        handleClose();
                        onNavigateToSignUp();
                      }}
                    >
                      <Text style={[styles.linkText, { color: primitives.color_blue_600 }]}>
                        S'inscrire
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
                loading={false}
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
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: primitives['spacing & layout_padding & margin_space-4'],
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
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    paddingHorizontal: 40,
    paddingVertical: 32,
    justifyContent: 'space-between',
    alignItems: 'center',
    // @ts-ignore
    boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.15)',
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
    fontSize: primitives['typography_font size_font-size-24'],
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: primitives['typography_font size_font-size-14'],
    textAlign: 'center',
    marginBottom: 20,
  },
  fieldsGap: {
    width: '100%',
    gap: 12,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
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
  footerText: {
    fontSize: primitives['typography_font size_font-size-12'],
  },
  linkText: {
    fontSize: primitives['typography_font size_font-size-12'],
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
