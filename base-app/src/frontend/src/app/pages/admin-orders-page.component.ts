import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="container py-4">
      <div class="mb-4">
        <h2 class="mb-1">Admin Orders</h2>
        <p class="text-muted mb-0">All marketplace orders.</p>
      </div>

      <div *ngIf="loading" class="text-muted">
        Loading orders...
      </div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div class="card" *ngIf="!loading && !error">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Order #</th>
                <th>Status</th>
                <th>Total</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of orders">
                <td>{{ order.id }}</td>
                <td>{{ order.orderNumber }}</td>
                <td>{{ order.status }}</td>
                <td>\${{ order.grandTotal }}</td>
                <td>{{ order.createdAt | date:'medium' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `
})
export class AdminOrdersPageComponent implements OnInit {
  private api = inject(ApiService);

  orders: any[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.api.getAdminOrders().subscribe({
      next: (res) => {
        this.orders = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load admin orders.';
        this.loading = false;
      }
    });
  }
}
