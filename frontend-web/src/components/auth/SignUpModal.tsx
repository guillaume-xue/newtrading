// components/auth/SignUpModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
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
import { httpClient } from '@/lib/api/httpClient';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { primitives } from '@/theme/generated/primitives';
import { lightColors } from '@/theme/generated/light';
import { darkColors } from '@/theme/generated/dark';

type SignUpStep = 'email' | 'pwd';

interface SignUpModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onNavigateToLogin?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Aligné strictement sur @Pattern de RegisterRequest.java
const SPECIAL_CHARS_REGEX = /[@#$%^&+=!._-]/;

export const SignUpModal: React.FC<SignUpModalProps> = ({
  visible,
  onClose,
  onSuccess,
  onNavigateToLogin,
}) => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkColors : lightColors;

  const [step, setStep] = useState<SignUpStep>('email');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isEmailAlreadyExists, setIsEmailAlreadyExists] = useState(false);

  // Valeurs du formulaire
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Réinitialiser les erreurs lorsque l'utilisateur modifie ses saisies
  useEffect(() => {
    if (apiError) setApiError(null);
    if (isEmailAlreadyExists) setIsEmailAlreadyExists(false);
  }, [email, password, confirmPassword]);

  // Validation Email
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email.trim()), [email]);

  // Évaluation unitaire de chaque critère de RegisterRequest.java
  const passwordRules = useMemo(() => {
    return [
      { label: '8 à 64 caractères', valid: password.length >= 8 && password.length <= 64 },
      { label: 'Une lettre minuscule', valid: /[a-z]/.test(password) },
      { label: 'Une lettre majuscule', valid: /[A-Z]/.test(password) },
      { label: 'Un chiffre', valid: /[0-9]/.test(password) },
      { label: 'Un caractère spécial (@#$%^&+=!._-)', valid: SPECIAL_CHARS_REGEX.test(password) },
    ];
  }, [password]);

  const passedRulesCount = useMemo(() => {
    return passwordRules.filter((r) => r.valid).length;
  }, [passwordRules]);

  // Toutes les contraintes Spring Boot sont remplies
  const isPasswordStrong = passedRulesCount === passwordRules.length;
  const isPasswordMatching = password.length > 0 && password === confirmPassword;
  const isPwdStepValid = isPasswordStrong && isPasswordMatching;

  const canContinue = step === 'email' ? isEmailValid : isPwdStepValid;

  const handleReset = () => {
    setStep('email');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setApiError(null);
    setIsEmailAlreadyExists(false);
    onClose();
  };

  const handleNext = async () => {
    if (!canContinue || loading) return;

    if (step === 'email') {
      setStep('pwd');
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      const response = await httpClient.post('/auth/register', {
        email: email.trim().toLowerCase(),
        password,
      });

      const jwt = response?.data?.accessToken ?? response?.data?.token;
      if (jwt) {
        tokenStorage.set(jwt);
      }

      handleReset();
      onSuccess();
    } catch (error: any) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 409) {
        setIsEmailAlreadyExists(true);
        setApiError('Cet e-mail est déjà associé à un compte.');
        setStep('email');
      } else if (status === 400) {
        const backendMsg =
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.response?.data?.errors?.[0]?.defaultMessage ||
          'Le mot de passe ne respecte pas les critères de sécurité.';
        setApiError(backendMsg);
      } else {
        setApiError('Une erreur réseau est survenue. Veuillez vérifier la connexion au serveur.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthMeta = () => {
    if (passedRulesCount <= 2) return { color: primitives.color_red_500, label: 'Faible' };
    if (passedRulesCount < 5) return { color: primitives.color_orange_500, label: 'Moyen' };
    return { color: primitives.color_green_500, label: 'Robuste' };
  };

  const strengthMeta = getStrengthMeta();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleReset}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.overlayDismiss} onPress={handleReset} />

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
              {step === 'pwd' ? (
                <Pressable
                  onPress={() => setStep('email')}
                  style={styles.backButton}
                  hitSlop={12}
                >
                  <Text style={[styles.backArrow, { color: theme['colors_text_primary'] }]}>
                    ←
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.headerLeftSpacer} />
              )}

              <View style={styles.logoWrapper}>
                <Image
                  src={Logo}
                  width={38}
                  height={24}
                  alt="NewTrading Logo"
                  style={styles.headerLogo}
                />
              </View>

              <Pressable
                onPress={handleReset}
                style={styles.closeButton}
                hitSlop={12}
              >
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
                  {step === 'email' ? 'Créer un compte' : 'Sécuriser votre compte'}
                </Text>
                <Text style={[styles.subtitle, { color: theme['colors_text_secondary'] }]}>
                  {step === 'email'
                    ? 'Saisissez votre e-mail pour commencer.'
                    : 'Définissez un mot de passe conforme aux règles de sécurité.'}
                </Text>

                {apiError && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{apiError}</Text>
                    {isEmailAlreadyExists && onNavigateToLogin && (
                      <Pressable
                        onPress={() => {
                          handleReset();
                          onNavigateToLogin();
                        }}
                      >
                        <Text style={styles.loginRedirectText}>Se connecter ?</Text>
                      </Pressable>
                    )}
                  </View>
                )}

                {step === 'email' && (
                  <InputField
                    placeholder="E-mail"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleNext}
                    error={Boolean(apiError && isEmailAlreadyExists)}
                  />
                )}

                {step === 'pwd' && (
                  <View style={styles.fieldsGap}>
                    <InputField
                      placeholder="Mot de passe"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      suffix={
                        <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                          <Text style={[styles.togglePwdText, { color: theme['colors_text_secondary'] }]}>
                            {showPassword ? 'Masquer' : 'Afficher'}
                          </Text>
                        </Pressable>
                      }
                    />

                    {/* Jauge de progression */}
                    {password.length > 0 && (
                      <View style={styles.strengthContainer}>
                        <View style={styles.strengthBarBackground}>
                          <View
                            style={[
                              styles.strengthBarFill,
                              {
                                width: `${(passedRulesCount / 5) * 100}%`,
                                backgroundColor: strengthMeta.color,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.strengthLabel, { color: strengthMeta.color }]}>
                          {strengthMeta.label}
                        </Text>
                      </View>
                    )}

                    {/* Checklist des exigences Spring Boot */}
                    <View style={styles.rulesList}>
                      {passwordRules.map((rule, index) => (
                        <View key={index} style={styles.ruleItem}>
                          <Text
                            style={[
                              styles.ruleIcon,
                              { color: rule.valid ? primitives.color_green_500 : primitives.color_neutral_400 },
                            ]}
                          >
                            {rule.valid ? '✓' : '•'}
                          </Text>
                          <Text
                            style={[
                              styles.ruleText,
                              {
                                color: rule.valid
                                  ? theme['colors_text_primary']
                                  : theme['colors_text_secondary'],
                              },
                            ]}
                          >
                            {rule.label}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <InputField
                      placeholder="Confirmer le mot de passe"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleNext}
                      error={confirmPassword.length > 0 && !isPasswordMatching}
                      errorMessage={
                        confirmPassword.length > 0 && !isPasswordMatching
                          ? 'Les mots de passe ne correspondent pas.'
                          : undefined
                      }
                    />
                  </View>
                )}
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Button
                label={step === 'email' ? 'Continuer' : "S'inscrire"}
                variant="primary"
                shape="pill"
                size="md"
                disabled={!canContinue}
                loading={loading}
                style={styles.continueButton}
                onPress={handleNext}
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
    width: 520,
    minHeight: 520,
    maxWidth: '100%',
    borderRadius: primitives['spacing & layout_border radius_radius-md'] ?? 8,
    paddingHorizontal: 40,
    paddingVertical: 32,
    flexDirection: 'column',
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
    height: 24,
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginVertical: 16,
  },
  inputWrapper: {
    width: '100%',
    maxWidth: 400,
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
    marginBottom: 16,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    textAlign: 'center',
  },
  loginRedirectText: {
    color: primitives.color_blue_600,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  fieldsGap: {
    width: '100%',
    gap: 10,
  },
  togglePwdText: {
    fontSize: 12,
    fontWeight: '500',
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -2,
    marginBottom: 4,
  },
  strengthBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: primitives.color_neutral_200,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 46,
    textAlign: 'right',
  },
  rulesList: {
    paddingHorizontal: 4,
    marginVertical: 4,
    gap: 4,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleIcon: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 14,
  },
  ruleText: {
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  continueButton: {
    width: '100%',
    maxWidth: 400,
    height: 48,
  },
});
