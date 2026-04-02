import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container py-5" style="max-width: 560px;">
      <div class="card card-shadow">
        <div class="card-body p-4">
          <h2 class="mb-3">Login</h2>
          <div class="mb-3"><input class="form-control" [(ngModel)]="email" placeholder="Email"></div>
          <div class="mb-3"><input class="form-control" [(ngModel)]="password" type="password" placeholder="Password"></div>
          <button class="btn gold-btn w-100" (click)="login()">Login</button>
          <div class="text-danger mt-3" *ngIf="error">{{ error }}</div>
          <div class="mt-3">Need an account? <a routerLink="/signup">Sign up</a></div>
        </div>
      </div>
    </div>
  `
})
export class LoginPageComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  email = 'buyer1@collectorsvault.dev';
  password = 'Password123!';
  error = '';

  login() {
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (data) => {
        this.auth.setSession(data);
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => (this.error = err?.error?.message || 'Login failed')
    });
  }
}
