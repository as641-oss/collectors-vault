import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="container py-4">
      <div class="mb-4">
        <h2 class="mb-1">Admin Dashboard</h2>
        <p class="text-muted mb-0">Marketplace overview and management.</p>
      </div>

      <div *ngIf="loading" class="text-muted">
        Loading admin stats...
      </div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div class="row g-3 mb-4" *ngIf="!loading && !error">
        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="text-muted small">Users</div>
              <div class="fs-3 fw-bold">{{ stats.users }}</div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="text-muted small">Listings</div>
              <div class="fs-3 fw-bold">{{ stats.listings }}</div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="text-muted small">Orders</div>
              <div class="fs-3 fw-bold">{{ stats.orders }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="d-flex flex-wrap gap-2">
        <a routerLink="/admin/users" class="btn btn-dark">Users</a>
        <a routerLink="/admin/listings" class="btn btn-outline-dark">Listings</a>
        <a routerLink="/admin/orders" class="btn btn-outline-dark">Orders</a>
      </div>
    </section>
  `
})
export class AdminDashboardPageComponent implements OnInit {
  private api = inject(ApiService);

  stats = {
    users: 0,
    listings: 0,
    orders: 0
  };

  loading = true;
  error = '';

  ngOnInit(): void {
    this.api.getAdminStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load admin stats.';
        this.loading = false;
      }
    });
  }
}
