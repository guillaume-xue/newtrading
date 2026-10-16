// lib/stores/useAuthStore.ts
import { create } from 'zustand';
import { isAxiosError } from 'axios';
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
  initialize: () => void;
  clearError: () => void;
}

function parseJwt(token: string): { sub?: string; id?: string; email?: string; exp?: number } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
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

      // Sauvegarde du token
      tokenStorage.set(token);

      set({
        token,
        user: {
          id: userId ?? 'user-id',
          email: authenticatedEmail ?? email.trim().toLowerCase(),
          authProvider: 'LOCAL',
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const message =
        (isAxiosError(error) && error.response?.data?.message) ||
        (isAxiosError(error) && error.response?.status === 401
          ? 'Identifiants invalides.'
          : 'Impossible de se connecter au serveur.');

      set({
        error: message,
        isLoading: false,
        isAuthenticated: false,
        token: null,
        user: null,
      });
      throw error;
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

  initialize: () => {
    try {
      const storedToken = tokenStorage.get();
      if (!storedToken) {
        set({ isAuthenticated: false, isLoading: false, token: null, user: null });
        return;
      }

      const payload = parseJwt(storedToken);

      // Si le token est expiré (exp en secondes)
      if (payload?.exp && Date.now() >= payload.exp * 1000) {
        tokenStorage.clear();
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        return;
      }

      // Restauration de la session depuis le token
      set({
        token: storedToken,
        user: {
          id: payload?.id ?? payload?.sub ?? 'user-id',
          email: payload?.email ?? payload?.sub ?? 'utilisateur@trading.com',
          authProvider: 'LOCAL',
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({ isAuthenticated: false, isLoading: false });
    }
  },
}));
