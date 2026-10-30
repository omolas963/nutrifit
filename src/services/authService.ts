import { UserAccount, AuthProvider } from '../types';

const STORAGE_SESSION_KEY = 'nutrifit_auth_session';
const STORAGE_TOKEN_KEY = 'nutrifit_auth_token';

export class AuthService {
  // Get active session
  public getCurrentUser(): UserAccount | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  }

  public saveSession(user: UserAccount, token?: string): void {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    if (token) {
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
    }
  }

  // 1. Iniciar sesión con Correo
  public async loginWithEmail(email: string, password: string): Promise<UserAccount> {
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión.');
      }

      this.saveSession(data.user, data.token);
      return data.user;
    } catch (e: any) {
      if (e.message && !e.message.includes('fetch')) throw e;
      throw new Error(e.message || 'No se pudo conectar con el servidor.');
    }
  }

  // 2. Registrarse con Correo
  public async registerWithEmail(email: string, password: string, name: string): Promise<UserAccount> {
    const cleanEmail = email.trim().toLowerCase();
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password, name }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrarse.');
      }

      this.saveSession(data.user, data.token);
      return data.user;
    } catch (e: any) {
      throw e;
    }
  }

  // 3. Iniciar sesión con Google Real
  public async loginWithGoogle(params: { credential?: string; email?: string; name?: string; avatarUrl?: string }): Promise<UserAccount> {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión con Google.');
      }

      this.saveSession(data.user, data.token);
      return data.user;
    } catch (e: any) {
      throw e;
    }
  }

  // 4. Iniciar sesión con Samsung Account
  public async loginWithSamsung(params: { email: string; name?: string }): Promise<UserAccount> {
    try {
      const res = await fetch('/api/auth/samsung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar sesión con Samsung.');
      }

      this.saveSession(data.user, data.token);
      return data.user;
    } catch (e: any) {
      throw e;
    }
  }

  // Marcar evaluación completada
  public markAssessmentCompleted(userId: string): void {
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      current.hasCompletedAssessment = true;
      this.saveSession(current);
    }
  }

  // Cerrar sesión
  public logout(): void {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  }
}

export const authService = new AuthService();
