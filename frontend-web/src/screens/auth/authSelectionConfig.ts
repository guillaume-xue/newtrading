// src/screens/auth/authSelectionConfig.ts

export type AuthMode = 'login' | 'signup';

export interface AuthSelectionCopy {
  emailButtonLabel: string;
  switchPrompt: string;
  switchActionLabel: string;
  targetMode: AuthMode;
}

/**
 * Centralise les libellés de l'écran AuthSelectionScreen selon le mode actif[span_15](start_span)[span_15](end_span).
 */
export const AUTH_SELECTION_COPY: Record<AuthMode, AuthSelectionCopy> = {
  login: {
    emailButtonLabel: 'Se connecter avec e-mail',
    switchPrompt: "Vous n'avez pas encore de compte ?",
    switchActionLabel: "S'inscrire",
    targetMode: 'signup',
  },
  signup: {
    emailButtonLabel: 'Créer un compte avec e-mail',
    switchPrompt: 'Vous avez déjà un compte ?',
    switchActionLabel: 'Se connecter',
    targetMode: 'login',
  },
};
