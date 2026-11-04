import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '@/lib/auth/tokenStorage';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';

/**
 * Structure standard d'erreur RFC 7807 retournée par Spring Boot
 */
export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  code?: string;
  timestamp?: string;
  errors?: Record<string, string>; // Validation des champs DTO
}

export class ApiProblemError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly detail: string;
  public readonly validationErrors?: Record<string, string>;

  constructor(problem: ProblemDetail) {
    super(problem.detail || problem.title || 'Une erreur est survenue');
    this.name = 'ApiProblemError';
    this.status = problem.status;
    this.code = problem.code;
    this.detail = problem.detail;
    this.validationErrors = problem.errors;
  }
}

export const httpClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Intercepteur de requête : Injection du JWT Bearer
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Intercepteur de réponse : Capture du 401 et normalisation RFC 7807
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ProblemDetail>) => {
    if (error.response?.status === 401) {
      tokenStorage.clear();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }

    // Si le serveur a renvoyé un ProblemDetail Spring Boot, on le transforme en ApiProblemError
    if (error.response?.data && error.response.data.title) {
      return Promise.reject(new ApiProblemError(error.response.data));
    }

    return Promise.reject(error);
  }
);
