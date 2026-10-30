import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const authRouter = Router();

// Helper to decode Google JWT token if provided
function parseGoogleJwt(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
      return JSON.parse(payload);
    }
  } catch (e) {
    console.warn('[Auth] No se pudo decodificar Google JWT:', e);
  }
  return null;
}

// 1. REGISTRO CON CORREO
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Introduce un correo electrónico válido.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Ya existe una cuenta registrada con este correo. Inicia sesión.' });
    }

    const user = db.createUser({
      email,
      name: name || email.split('@')[0],
      provider: 'email',
      password,
      hasCompletedAssessment: false,
    });

    const { passwordHash, ...safeUser } = user;
    return res.json({
      success: true,
      user: safeUser,
      token: `token_${safeUser.id}_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('[Auth] Error en registro:', error);
    return res.status(500).json({ error: 'Error al registrar usuario.' });
  }
});

// 2. INICIO DE SESIÓN CON CORREO
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Introduce tu correo y contraseña.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'No existe una cuenta con este correo. Regístrate primero.' });
    }

    if (user.provider === 'email') {
      const hash = db.hashPassword(password);
      if (user.passwordHash !== hash) {
        return res.status(401).json({ error: 'Contraseña incorrecta. Inténtalo de nuevo.' });
      }
    }

    const { passwordHash, ...safeUser } = user;
    return res.json({
      success: true,
      user: safeUser,
      token: `token_${safeUser.id}_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('[Auth] Error en login:', error);
    return res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

// 3. INICIO DE SESIÓN CON GOOGLE (REAL)
authRouter.post('/google', (req: Request, res: Response) => {
  try {
    const { credential, email, name, avatarUrl } = req.body;

    let userEmail = email;
    let userName = name;
    let userAvatar = avatarUrl;

    if (credential) {
      const decoded = parseGoogleJwt(credential);
      if (decoded && decoded.email) {
        userEmail = decoded.email;
        userName = decoded.name || decoded.given_name || userEmail.split('@')[0];
        userAvatar = decoded.picture;
      }
    }

    if (!userEmail || !userEmail.includes('@')) {
      return res.status(400).json({ error: 'No se recibieron datos de cuenta de Google válidos.' });
    }

    let user = db.findUserByEmail(userEmail);

    if (!user) {
      // First time user via Google
      user = db.createUser({
        email: userEmail,
        name: userName || userEmail.split('@')[0],
        provider: 'google',
        avatarUrl: userAvatar,
        hasCompletedAssessment: false,
      });
    } else {
      // Update details
      user = db.updateUser(user.id, {
        provider: 'google',
        name: userName || user.name,
        avatarUrl: userAvatar || user.avatarUrl,
      }) || user;
    }

    const { passwordHash, ...safeUser } = user;
    return res.json({
      success: true,
      user: safeUser,
      token: `token_${safeUser.id}_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('[Auth] Error en login con Google:', error);
    return res.status(500).json({ error: 'Error al autenticar con Google.' });
  }
});

// 4. INICIO DE SESIÓN CON SAMSUNG ACCOUNT
authRouter.post('/samsung', (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Introduce una cuenta Samsung válida.' });
    }

    let user = db.findUserByEmail(email);

    if (!user) {
      user = db.createUser({
        email,
        name: name || email.split('@')[0],
        provider: 'samsung',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
        hasCompletedAssessment: false,
      });
    }

    const { passwordHash, ...safeUser } = user;
    return res.json({
      success: true,
      user: safeUser,
      token: `token_${safeUser.id}_${Date.now()}`,
    });
  } catch (error: any) {
    console.error('[Auth] Error en login con Samsung:', error);
    return res.status(500).json({ error: 'Error al autenticar con Samsung Account.' });
  }
});

// 5. PERFIL DE USUARIO ACTUAL
authRouter.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const userId = req.headers['x-user-id'] as string;

  if (userId) {
    const user = db.findUserById(userId);
    if (user) {
      const { passwordHash, ...safeUser } = user;
      return res.json({ user: safeUser });
    }
  }

  return res.status(401).json({ error: 'No autenticado.' });
});
