import { Injectable } from '@angular/core';

export type UserRole = 'MEDICO' | 'PACIENTE';

export interface SessionUser {
  uid: string;
  role: UserRole;
  [key: string]: unknown;
}

interface TokenPayload {
  uid?: string;
  role?: string;
  exp?: number;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly tokenKey = 'access_token';
  private readonly profileKey = 'userProfile';

  getValidUser(): SessionUser | null {
    const token = localStorage.getItem(this.tokenKey);
    const storedProfile = localStorage.getItem(this.profileKey);

    if (!token || !storedProfile) {
      if (token || storedProfile) this.clearSession();
      return null;
    }

    try {
      const profile = JSON.parse(storedProfile) as Record<string, unknown>;
      const payload = this.decodeToken(token);
      const profileRole = this.normalizeRole(profile['role']);
      const tokenRole = this.normalizeRole(payload?.role);
      const profileUid = String(profile['uid'] ?? '');
      const nowInSeconds = Math.floor(Date.now() / 1000);

      if (
        !payload ||
        !payload.exp ||
        payload.exp <= nowInSeconds ||
        !profileUid ||
        payload.uid !== profileUid ||
        !profileRole ||
        tokenRole !== profileRole
      ) {
        this.clearSession();
        return null;
      }

      return { ...profile, uid: profileUid, role: profileRole } as SessionUser;
    } catch {
      this.clearSession();
      return null;
    }
  }

  saveSession(token: string, profile: Record<string, unknown>): SessionUser | null {
    this.clearSession();
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.profileKey, JSON.stringify(profile));
    return this.getValidUser();
  }

  getValidToken(): string | null {
    return this.getValidUser() ? localStorage.getItem(this.tokenKey) : null;
  }

  getHomeRoute(role: UserRole): string {
    return role === 'MEDICO'
      ? '/tabs-medico/tab-pacientes'
      : '/tabs-paciente/tab-monitoreo';
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.profileKey);
    localStorage.removeItem('user_session');

    // Estos datos pertenecen a una cuenta concreta y no deben pasar a otra sesión.
    localStorage.removeItem('insulix_pacientes');
    localStorage.removeItem('insulix_historial_reportes');
  }

  private normalizeRole(value: unknown): UserRole | null {
    const role = typeof value === 'string' ? value.toUpperCase() : '';
    return role === 'MEDICO' || role === 'PACIENTE' ? role : null;
  }

  private decodeToken(token: string): TokenPayload | null {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as TokenPayload;
  }
}
