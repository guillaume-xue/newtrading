// lib/stores/useAuthStore.ts
import { create } from 'zustand';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { httpClient } from '@/lib/api/httpClient';

export interface User {
  id: string;
  email: string;
  authProvider?: 'LOCAL' | 'GOOGLE';
  createdAt?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async ({ email, password }: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await httpClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { accessToken, userId, email: authenticatedEmail } = response.data;
      const token = accessToken;

      if (!token) {
        throw new Error('Jeton JWT manquant dans la réponse API.');
      }

      // 1. Sauvegarde sécurisée du token (Keychain sur iOS / localStorage ou Secure Cookie sur Web)
      tokenStorage.set(token);

      // 2. Mise à jour de l'état Zustand
      set({
        token,
        user: {
          id: userId,
          email: authenticatedEmail ?? email.trim().toLowerCase(),
          authProvider: 'LOCAL',
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (err?.response?.status === 401
          ? 'Identifiants invalides.'
          : 'Impossible de se connecter au serveur.');

      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
        token: null,
        user: null,
      });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      tokenStorage.clear();
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  initialize: async () => {
    try {
      const storedToken = tokenStorage.get();
      if (!storedToken) {
        set({ isAuthenticated: false, isLoading: false, token: null, user: null });
        return;
      }

      // Optionnel en production : vérification auprès du backend (/api/auth/me)
      try {
        const response = await httpClient.get('/api/auth/me');
        set({
          token: storedToken,
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        // Token expiré ou invalide
        tokenStorage.clear();
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
