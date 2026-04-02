import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark" style="background:#111827">
      <div class="container">
        <a class="navbar-brand" routerLink="/marketplace">Collector's Vault</a>
        <div class="navbar-nav ms-auto gap-2 align-items-center">
          <a class="nav-link" routerLink="/marketplace" routerLinkActive="active">Marketplace</a>
          <a class="nav-link" routerLink="/dashboard" routerLinkActive="active" *ngIf="auth.isAuthenticated()">Dashboard</a>
          <a class="nav-link" routerLink="/dashboard/orders" routerLinkActive="active" *ngIf="auth.user()?.role === 'buyer'">My Orders</a>
          <a class="nav-link" routerLink="/seller/orders" routerLinkActive="active" *ngIf="auth.user()?.role === 'seller'">Sales</a>
          <a class="nav-link" routerLink="/seller/listings" routerLinkActive="active" *ngIf="auth.user()?.role === 'seller' || auth.user()?.role === 'admin'">Seller</a>
          <a class="nav-link" routerLink="/admin" routerLinkActive="active" *ngIf="auth.user()?.role === 'admin'">Admin</a>
          <a routerLink="/cart" class="nav-link"*ngIf="auth.user()?.role === 'buyer'">Cart</a>
          <a class="btn btn-outline-light btn-sm" routerLink="/login" *ngIf="!auth.isAuthenticated()">Login</a>
          <button class="btn btn-outline-light btn-sm ms-2" *ngIf="auth.isAuthenticated()" (click)="auth.logout()">Logout</button>
        </div>
      </div>
    </nav>

    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  auth = inject(AuthService);
}