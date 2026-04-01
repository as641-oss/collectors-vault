import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="mb-1">Seller Orders</h2>
        <p class="text-muted mb-0">Manage orders for your sold listings.</p>
      </div>
    </div>

    <div *ngIf="loading" class="alert alert-info">
      Loading seller orders...
    </div>

    <div *ngIf="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div *ngIf="!loading && !error && orders.length === 0" class="alert alert-secondary">
      No orders found.
    </div>

    <div *ngIf="!loading && orders.length > 0" class="table-responsive">
      <table class="table table-striped align-middle">
        <thead class="table-light">
          <tr>
            <th>Order ID</th>
            <th>Buyer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Created</th>
            <th style="min-width: 320px;">Actions</th>
          </tr>
        </thead>

        <tbody>
          <ng-container *ngFor="let order of orders">
            <tr>
              <td>#{{ order.orderNumber || order.id }}</td>
              <td>{{ getBuyerName(order) }}</td>
              <td>\${{ formatMoney(order.grandTotal || order.totalPrice || order.subtotal) }}</td>
              <td>
                <span class="badge text-bg-secondary text-uppercase">
                  {{ order.status }}
                </span>
              </td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>
                <div class="d-flex flex-wrap gap-2">
                  <select
                    class="form-select form-select-sm"
                    style="width: 140px;"
                    [(ngModel)]="order.nextStatus">
                    <option *ngFor="let status of statuses" [value]="status">
                      {{ status }}
                    </option>
                  </select>

                  <button
                    class="btn btn-sm btn-outline-primary"
                    (click)="toggleDetails(order)">
                    {{ selectedOrderId === order.id ? 'Hide Details' : 'Details' }}
                  </button>

                  <button
                    class="btn btn-sm btn-warning"
                    (click)="saveStatus(order)"
                    [disabled]="savingOrderId === order.id">
                    {{ savingOrderId === order.id ? 'Updating...' : 'Update' }}
                  </button>
                </div>
              </td>
            </tr>

            <tr *ngIf="selectedOrderId === order.id">
              <td colspan="6" class="bg-light">
                <div class="p-3 border rounded">
                  <div *ngIf="order.detailsLoading" class="text-muted">
                    Loading order details...
                  </div>

                  <div *ngIf="!order.detailsLoading">
                    <h6 class="mb-3">Order Details</h6>

                    <div class="row g-3">
                      <div class="col-md-6">
                        <p class="mb-1"><strong>Order ID:</strong> #{{ order.orderNumber || order.id }}</p>
                        <p class="mb-1"><strong>Buyer:</strong> {{ getBuyerName(order) }}</p>
                        <p class="mb-1"><strong>Email:</strong> {{ getBuyerEmail(order) }}</p>
                        <p class="mb-1"><strong>Phone:</strong> {{ getBuyerPhone(order) }}</p>
                        <p class="mb-1"><strong>Items:</strong> {{ getListingTitle(order) }}</p>
                        <p class="mb-1"><strong>Status:</strong> {{ order.status }}</p>
                        <p class="mb-0"><strong>Total:</strong> \${{ formatMoney(order.grandTotal || order.totalPrice || order.subtotal) }}</p>
                      </div>

                      <div class="col-md-6">
                        <h6 class="mb-2">Shipping Address</h6>

                        <ng-container *ngIf="hasShippingAddress(order); else noAddress">
                          <p class="mb-1"><strong>Name:</strong> {{ getShippingName(order) }}</p>
                          <p class="mb-1"><strong>Line 1:</strong> {{ getShippingLine1(order) }}</p>
                          <p class="mb-1" *ngIf="getShippingLine2(order)">
                            <strong>Line 2:</strong> {{ getShippingLine2(order) }}
                          </p>
                          <p class="mb-1"><strong>City:</strong> {{ getShippingCity(order) }}</p>
                          <p class="mb-1"><strong>State:</strong> {{ getShippingState(order) }}</p>
                          <p class="mb-1"><strong>Postal Code:</strong> {{ getShippingPostalCode(order) }}</p>
                          <p class="mb-0"><strong>Country:</strong> {{ getShippingCountry(order) }}</p>
                        </ng-container>

                        <ng-template #noAddress>
                          <p class="text-muted mb-0">No shipping address available for this order.</p>
                        </ng-template>
                      </div>
                    </div>

                    <div *ngIf="order.items?.length" class="mt-4">
                      <h6 class="mb-2">Order Items</h6>
                      <div class="table-responsive">
                        <table class="table table-sm table-bordered mb-0">
                          <thead>
                            <tr>
                              <th>Listing ID</th>
                              <th>Quantity</th>
                              <th>Unit Price</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr *ngFor="let item of order.items">
                              <td>{{ item.listing_id || item.listingId }}</td>
                              <td>{{ item.quantity }}</td>
                              <td>\${{ formatMoney(item.unit_price || item.unitPrice) }}</td>
                              <td>\${{ formatMoney(item.line_total || item.lineTotal) }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </ng-container>
        </tbody>
      </table>
      <div class="d-flex justify-content-between align-items-center mt-3 flex-wrap">
        <button
          class="btn btn-outline-secondary"
          (click)="goToPreviousPage()"
          [disabled]="page === 1"
        >
          Previous
        </button>

        <div class="text-muted">
          Page {{ page }} of {{ totalPages }} · {{ total }} total orders
        </div>

        <button
          class="btn btn-outline-secondary"
          (click)="goToNextPage()"
          [disabled]="page === totalPages"
        >
          Next
        </button>
      </div>
    </div>
  </section>
    `
})
export class SellerOrdersPageComponent implements OnInit {
  private api = inject(ApiService);

  orders: any[] = [];
  loading = true;
  error = '';
  savingOrderId: number | string | null = null;
  selectedOrderId: number | string | null = null;
  loadingDetailsId: number | string | null = null;
  page = 1;
  limit = 5;
  total = 0;
  totalPages = 1;

  statuses = ['paid', 'shipped', 'delivered', 'completed', 'cancelled'];

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = '';

    this.api.getSellerOrders(this.page, this.limit).subscribe({
      next: (res: any) => {
        const items = res?.items || [];
        const pagination = res?.pagination || {};

        this.orders = items.map((order: any) => ({
          ...order,
          nextStatus: order.status,
          detailsLoaded: false,
          detailsLoading: false
        }));

        this.total = Number(pagination.total || 0);
        this.totalPages = Math.max(1, Number(pagination.totalPages || 1));
        this.page = Number(pagination.page || 1);

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.error || err?.error?.message || 'Could not load seller orders.';
        this.loading = false;
      }
    });
  }

  goToPreviousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.selectedOrderId = null;
      this.loadOrders();
    }
  }

  goToNextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.selectedOrderId = null;
      this.loadOrders();
    }
  }

  toggleDetails(order: any): void {
    if (!order?.id) return;

    if (this.selectedOrderId === order.id) {
      this.selectedOrderId = null;
      return;
    }

    this.selectedOrderId = order.id;

    if (order.detailsLoaded) {
      return;
    }

    order.detailsLoading = true;
    this.loadingDetailsId = order.id;
    this.error = '';

    this.api.getOrderById(order.id).subscribe({
      next: (details: any) => {
        Object.assign(order, details, {
          detailsLoaded: true,
          detailsLoading: false
        });
        this.loadingDetailsId = null;
      },
      error: (err) => {
        order.detailsLoading = false;
        this.loadingDetailsId = null;
        this.error = err?.error?.message || 'Could not load order details.';
      }
    });
  }

  saveStatus(order: any): void {
    if (!order?.id || !order?.nextStatus) return;

    this.error = '';
    this.savingOrderId = order.id;

    this.api.updateOrderStatus(order.id, order.nextStatus).subscribe({
      next: () => {
        order.status = order.nextStatus;
        this.savingOrderId = null;
      },
      error: (err) => {
        this.error = err?.error?.error || err?.error?.message || 'Could not update order status.';
        this.savingOrderId = null;
      }
    });
  }

  hasShippingAddress(order: any): boolean {
    return !!(
      order?.full_name ||
      order?.fullName ||
      order?.line1 ||
      order?.line2 ||
      order?.city ||
      order?.state ||
      order?.postal_code ||
      order?.postalCode ||
      order?.country
    );
  }

  getBuyerName(order: any): string {
    return order?.buyerName || 'Unknown buyer';
  }

  getBuyerEmail(order: any): string {
    return order?.buyerEmail || 'N/A';
  }

  getBuyerPhone(order: any): string {
    return order?.buyerPhone || order?.phone || 'N/A';
  }

  getListingTitle(order: any): string {
    if (order?.items?.length > 0) {
      return order.items.map((item: any) => item.listing_title || item.title || `Listing #${item.listing_id}`).join(', ');
    }
    return 'N/A';
  }

  getShippingName(order: any): string {
    return order?.full_name || order?.fullName || 'N/A';
  }

  getShippingLine1(order: any): string {
    return order?.line1 || 'N/A';
  }

  getShippingLine2(order: any): string {
    return order?.line2 || '';
  }

  getShippingCity(order: any): string {
    return order?.city || 'N/A';
  }

  getShippingState(order: any): string {
    return order?.state || 'N/A';
  }

  getShippingPostalCode(order: any): string {
    return order?.postal_code || order?.postalCode || 'N/A';
  }

  getShippingCountry(order: any): string {
    return order?.country || 'N/A';
  }

  formatMoney(value: any): string {
    return Number(value || 0).toFixed(2);
  }

  formatDate(value: string): string {
    if (!value) return '';
    return new Date(value).toLocaleString();
  }
}