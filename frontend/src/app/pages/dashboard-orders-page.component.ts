import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1">My Orders</h2>
          <p class="text-muted mb-0">Track your Buy Now purchases.</p>
        </div>
      </div>

      <div *ngIf="loading" class="text-muted">Loading orders...</div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div *ngIf="!loading && !error && orders.length === 0" class="card">
        <div class="card-body text-muted">
          You have no orders yet.
        </div>
      </div>

      <div *ngIf="!loading && !error && orders.length > 0" class="row g-3">
        <div *ngFor="let order of orders" class="col-12">
          <div class="card shadow-sm">
            <div class="card-body d-flex flex-column flex-md-row justify-content-between gap-3">
              <div>
                <h5 class="card-title mb-2">
                  Order #{{ order.order_number }}
                </h5>

                <div class="mb-1">
                  <strong>Status:</strong>
                  <span class="badge text-bg-dark ms-1">{{ order.status }}</span>
                </div>

                <div class="mb-1">
                  <strong>Total:</strong>
                  {{ order.grand_total | currency }}
                </div>

                <div class="text-muted small">
                  Placed {{ order.created_at | date:'medium' }}
                </div>
              </div>

              <div class="d-flex align-items-center">
                <a
                  class="btn btn-outline-dark"
                  [routerLink]="['/dashboard/orders', order.id]"
                >
                  View Details
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class DashboardOrdersPageComponent implements OnInit {
  private api = inject(ApiService);

  orders: any[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.api.getMyOrders().subscribe({
      next: (rows) => {
        this.orders = rows;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load your orders.';
        this.loading = false;
      }
    });
  }
}