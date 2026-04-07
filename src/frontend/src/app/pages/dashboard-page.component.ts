import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container py-5">
      <div class="row g-4">
        <div class="col-md-8">
          <div class="card card-shadow">
            <div class="card-body">
              <h2>Welcome back, {{ auth.user()?.firstName || 'Collector' }}</h2>
              <p class="text-muted">Role: {{ auth.user()?.role }}</p>
              <p>Manage your account information and shipping details.</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card p-4">
            <h3 class="h4 mb-3">Access your profile from here</h3>
            <ul class="mb-0">
              <li><a routerLink="/account">Profile/Address</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardPageComponent {
  auth = inject(AuthService);
}
