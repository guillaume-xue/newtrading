import { http, HttpResponse } from 'msw';

// Base de données mémoire pour simuler les conflits et tests
const existingUsers = new Set<string>(['trader@newtrading.com', 'alice@newtrading.com']);

// Regex mot de passe alignée avec RegisterRequest.java
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!._-]).{8,64}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authHandlers = [
  // POST /auth/login (compatible /api/v1/auth/login et /api/auth/login)
  http.post('*/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body?.email || !body?.password) {
      return HttpResponse.json(
        {
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message: "L'email et le mot de passe sont obligatoires",
        },
        { status: 400 }
      );
    }

    if (body.password === 'WrongPassword!') {
      return HttpResponse.json(
        {
          timestamp: new Date().toISOString(),
          status: 401,
          error: 'Unauthorized',
          message: 'Identifiants invalides',
        },
        { status: 401 }
      );
    }

    // Réponse alignée avec AuthResponse.java
    return HttpResponse.json({
      accessToken: 'mocked-jwt-token-' + btoa(body.email) + '-newtrading-signature',
      tokenType: 'Bearer',
      userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      email: body.email,
    });
  }),

  // POST /auth/register (simule 201, 400 et 409)
  http.post('*/auth/register', async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string };

    // Validation 400 : format et contraintes RegisterRequest.java
    if (!body?.email || !EMAIL_REGEX.test(body.email)) {
      return HttpResponse.json(
        {
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message: "Format d'email invalide",
        },
        { status: 400 }
      );
    }

    if (!body?.password || !PASSWORD_REGEX.test(body.password)) {
      return HttpResponse.json(
        {
          timestamp: new Date().toISOString(),
          status: 400,
          error: 'Bad Request',
          message:
            'Le mot de passe doit comporter entre 8 et 64 caractères et contenir au moins un chiffre, une minuscule, une majuscule et un caractère spécial',
        },
        { status: 400 }
      );
    }

    // Validation 409 : conflit utilisateur existant
    if (existingUsers.has(body.email)) {
      return HttpResponse.json(
        {
          timestamp: new Date().toISOString(),
          status: 409,
          error: 'Conflict',
          message: 'Un compte existe déjà avec cette adresse email',
        },
        { status: 409 }
      );
    }

    existingUsers.add(body.email);

    return HttpResponse.json(
      {
        accessToken: 'mocked-jwt-token-' + btoa(body.email) + '-newtrading-signature',
        tokenType: 'Bearer',
        userId: crypto.randomUUID(),
        email: body.email,
      },
      { status: 201 }
    );
  }),
];
