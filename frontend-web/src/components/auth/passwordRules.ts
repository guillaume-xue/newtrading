// src/components/auth/passwordRules.ts
export interface PasswordRuleStatus {
  id: string;
  label: string;
  valid: boolean;
}

const SPECIAL_CHARS_REGEX = /[@#$%^&+=!._-]/;

export function evaluatePasswordRules(password: string): PasswordRuleStatus[] {
  return [
    {
      id: 'length',
      label: '8 à 64 caractères',
      valid: password.length >= 8 && password.length <= 64,
    },
    {
      id: 'lower',
      label: 'Une lettre minuscule',
      valid: /[a-z]/.test(password),
    },
    {
      id: 'upper',
      label: 'Une lettre majuscule',
      valid: /[A-Z]/.test(password),
    },
    {
      id: 'digit',
      label: 'Un chiffre',
      valid: /[0-9]/.test(password),
    },
    {
      id: 'special',
      label: 'Un caractère spécial (@#$%^&+=!._-)',
      valid: SPECIAL_CHARS_REGEX.test(password),
    },
  ];
}
