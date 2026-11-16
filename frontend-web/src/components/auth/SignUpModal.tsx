// src/components/auth/SignUpModal.tsx
'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { isAxiosError } from 'axios';

import { AuthModalShell } from './AuthModalShell';
import { PasswordStrengthChecklist } from './PasswordStrengthChecklist';
import { evaluatePasswordRules } from './passwordRules';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/InputField';
import { httpClient } from '@/lib/api/httpClient';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { useAppTheme } from '@/theme/ThemeContext';

type SignUpStep = 'email' | 'pwd';

interface SignUpModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onNavigateToLogin?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SignUpModal: React.FC<SignUpModalProps> = ({
  visible,
  onClose,
  onSuccess,
  onNavigateToLogin,
}) => {
  const { theme } = useAppTheme();
  const { colors } = theme;

  const [step, setStep] = useState<SignUpStep>('email');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isEmailAlreadyExists, setIsEmailAlreadyExists] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleFieldChange = useCallback(
    (setter: (value: string) => void) => (value: string) => {
      setter(value);
      setApiError(null);
      setIsEmailAlreadyExists(false);
    },
    []
  );

  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email.trim()), [email]);

  const passwordRules = useMemo(() => evaluatePasswordRules(password), [password]);
  const isPasswordStrong = useMemo(
    () => passwordRules.every((rule) => rule.valid),
    [passwordRules]
  );
  const isPasswordMatching = password.length > 0 && password === confirmPassword;
  const isPwdStepValid = isPasswordStrong && isPasswordMatching;
  const canContinue = step === 'email' ? isEmailValid : isPwdStepValid;

  const resetForm = useCallback(() => {
    setStep('email');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setApiError(null);
    setIsEmailAlreadyExists(false);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleNavigateToLogin = useCallback(() => {
    if (!onNavigateToLogin) return;
    resetForm();
    onNavigateToLogin();
  }, [onNavigateToLogin, resetForm]);

  const handleNext = useCallback(async () => {
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

      resetForm();
      onClose();
      onSuccess();
    } catch (error: unknown) {
      const status = isAxiosError(error) ? error.response?.status : undefined;
      const data = isAxiosError(error) ? error.response?.data : undefined;

      if (status === 409) {
        setIsEmailAlreadyExists(true);
        setApiError('Cet e-mail est déjà associé à un compte.');
        setStep('email');
      } else if (status === 400) {
        const backendMsg =
          data?.detail ||
          data?.message ||
          data?.errors?.[0]?.defaultMessage ||
          'Le mot de passe ne respecte pas les critères de sécurité.';
        setApiError(backendMsg);
      } else {
        setApiError('Une erreur réseau est survenue. Veuillez vérifier la connexion au serveur.');
      }
    } finally {
      setLoading(false);
    }
  }, [canContinue, loading, step, email, password, resetForm, onClose, onSuccess]);

  const leftHeaderSlot =
    step === 'pwd' ? (
      <Pressable
        onPress={() => setStep('email')}
        style={styles.backButton}
        hitSlop={12}
        accessibilityLabel="Retour à l'étape e-mail"
      >
        <Text style={[styles.backArrow, { color: colors['colors_text_primary'] }]}>
          ←
        </Text>
      </Pressable>
    ) : undefined;

  return (
    <AuthModalShell
      visible={visible}
      onClose={handleClose}
      title={step === 'email' ? 'Créer un compte' : 'Sécuriser votre compte'}
      subtitle={
        step === 'email'
          ? 'Saisissez votre e-mail pour commencer.'
          : 'Définissez un mot de passe conforme aux règles de sécurité.'
      }
      error={apiError}
      errorActionLabel={isEmailAlreadyExists ? 'Se connecter ?' : undefined}
      onErrorAction={isEmailAlreadyExists ? handleNavigateToLogin : undefined}
      leftHeaderSlot={leftHeaderSlot}
      footer={
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
      }
    >
      {step === 'email' ? (
        <InputField
          placeholder="E-mail"
          value={email}
          onChangeText={handleFieldChange(setEmail)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleNext}
          error={Boolean(apiError && isEmailAlreadyExists)}
        />
      ) : (
        <View style={styles.fieldsGap}>
          <InputField
            placeholder="Mot de passe"
            value={password}
            onChangeText={handleFieldChange(setPassword)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            suffix={
              <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
                <Text
                  style={[
                    styles.togglePwdText,
                    { color: colors['colors_text_secondary'] },
                  ]}
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </Text>
              </Pressable>
            }
          />

          <PasswordStrengthChecklist password={password} rules={passwordRules} />

          <InputField
            placeholder="Confirmer le mot de passe"
            value={confirmPassword}
            onChangeText={handleFieldChange(setConfirmPassword)}
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
    </AuthModalShell>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  fieldsGap: {
    width: '100%',
    gap: 10,
  },
  togglePwdText: {
    fontSize: 12,
    fontWeight: '500',
  },
  continueButton: {
    width: '100%',
    maxWidth: 400,
    height: 48,
  },
});

export default SignUpModal;
