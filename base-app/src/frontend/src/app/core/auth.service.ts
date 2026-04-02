import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenSignal = signal<string | null>(localStorage.getItem('cv_token'));
  private userSignal = signal<any>(this.readUser());

  token = computed(() => this.tokenSignal());
  user = computed(() => this.userSignal());
  isAuthenticated = computed(() => !!this.tokenSignal());

  setSession(payload: { token: string; user: any }) {
    localStorage.setItem('cv_token', payload.token);
    localStorage.setItem('cv_user', JSON.stringify(payload.user));
    this.tokenSignal.set(payload.token);
    this.userSignal.set(payload.user);
  }

  logout() {
    localStorage.removeItem('cv_token');
    localStorage.removeItem('cv_user');
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  private readUser() {
    const raw = localStorage.getItem('cv_user');
    return raw ? JSON.parse(raw) : null;
  }
}
