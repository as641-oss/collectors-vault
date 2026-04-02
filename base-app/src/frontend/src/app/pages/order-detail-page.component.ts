import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="container py-4">
      <div class="mb-3">
        <a routerLink="/dashboard/orders" class="btn btn-link ps-0 text-decoration-none">
          ← Back to My Orders
        </a>
      </div>

      <div *ngIf="loading" class="text-muted">Loading order...</div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div *ngIf="!loading && order">
        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <div class="d-flex flex-column flex-md-row justify-content-between gap-3">
              <div>
                <h2 class="mb-2">Order #{{ order.order_number }}</h2>
                <div class="mb-2">
                  <span class="badge text-bg-dark">{{ order.status }}</span>
                </div>
                <div class="text-muted">
                  Placed {{ order.created_at | date:'medium' }}
                </div>
              </div>

              <div class="text-md-end">
                <div><strong>Subtotal:</strong> {{ order.subtotal | currency }}</div>
                <div><strong>Shipping:</strong> {{ order.shipping_total | currency }}</div>
                <div class="fs-5 mt-1">
                  <strong>Total:</strong> {{ order.grand_total | currency }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm mb-4">
          <div class="card-body">
            <h4 class="mb-3">Items</h4>

            <div *ngIf="!order.items || order.items.length === 0" class="text-muted">
              No items found for this order.
            </div>

            <div *ngIf="order.items?.length">
              <div
                *ngFor="let item of order.items"
                class="border rounded p-3 mb-3"
              >
                <div class="d-flex flex-column flex-md-row justify-content-between gap-2">
                  <div>
                    <h5 class="mb-1">{{ item.listing_title_snapshot }}</h5>
                    <div class="text-muted mb-1">
                      Condition: {{ item.condition_snapshot || 'N/A' }}
                    </div>
                    <div>
                      Qty: {{ item.quantity }}
                    </div>
                  </div>

                  <div class="text-md-end">
                    <div>Unit Price: {{ item.unit_price | currency }}</div>
                    <div><strong>Line Total: {{ item.line_total | currency }}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body">
            <h4 class="mb-3">Shipping</h4>

            <p class="mb-1"><strong>Name:</strong> {{ order.shipping_name }}</p>
            <p class="mb-1"><strong>Address 1:</strong> {{ order.shipping_line1 }}</p>

            <p class="mb-1" *ngIf="order.shipping_line2">
              <strong>Address 2:</strong> {{ order.shipping_line2 }}
            </p>

            <p class="mb-1">
              <strong>City:</strong> {{ order.shipping_city }}
            </p>

            <p class="mb-1">
              <strong>State:</strong> {{ order.shipping_state }}
            </p>

            <p class="mb-1">
              <strong>Postal Code:</strong> {{ order.shipping_postal_code }}
            </p>

            <p class="mb-0">
              <strong>Country:</strong> {{ order.shipping_country }}
            </p>

            <div *ngIf="order.tracking_number" class="mt-3">
              <strong>Tracking Number:</strong> {{ order.tracking_number }}
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class OrderDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  order: any = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Order not found.';
      this.loading = false;
      return;
    }

    this.api.getOrderById(id).subscribe({
      next: (row) => {
        this.order = row;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load order details.';
        this.loading = false;
      }
    });
  }
}