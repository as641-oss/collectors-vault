import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1">My Cart</h2>
          <p class="text-muted mb-0">Bundle multiple listings before checkout.</p>
        </div>
      </div>

      <div *ngIf="loading" class="text-muted">
        Loading cart...
      </div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div *ngIf="success" class="alert alert-success">
        {{ success }}
      </div>

      <div *ngIf="!loading && !error && items.length === 0" class="card">
        <div class="card-body text-muted">
          Your cart is empty.
        </div>
      </div>

      <div *ngIf="!loading && items.length > 0">
        <div *ngFor="let item of items" class="card mb-3 shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <div>
              <h5 class="mb-1">{{ item.title }}</h5>
              <div class="text-muted small mb-1">
                Seller: {{ item.sellerName || 'Unknown seller' }}
              </div>
              <div class="small text-muted mb-1" *ngIf="item.quantityAvailable !== undefined">
                Available: {{ item.quantityAvailable }}
              </div>
              <div class="fw-semibold">
                \${{ item.price }} × {{ item.quantity }} = \${{ item.price * item.quantity }}
              </div>
            </div>

            <div class="d-flex align-items-center gap-2 flex-wrap">
              <button
                class="btn btn-outline-secondary btn-sm"
                (click)="changeQty(item, item.quantity - 1)"
                [disabled]="item.quantity <= 1 || updatingId === item.id"
              >
                -
              </button>

              <span class="px-2">{{ item.quantity }}</span>

              <button
                class="btn btn-outline-secondary btn-sm"
                (click)="changeQty(item, item.quantity + 1)"
                [disabled]="updatingId === item.id || item.quantity >= item.quantityAvailable"
              >
                +
              </button>

              <button
                class="btn btn-outline-danger btn-sm"
                (click)="remove(item.id)"
                [disabled]="removingId === item.id"
              >
                {{ removingId === item.id ? 'Removing...' : 'Remove' }}
              </button>
            </div>
          </div>
        </div>

        <div class="card shadow-sm">
          <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h5 class="mb-1">Bundle Summary</h5>
              <div class="text-muted small">{{ items.length }} item(s) in cart</div>
            </div>

            <div class="text-end">
              <div class="fs-5 fw-bold mb-2">Total: \${{ total }}</div>
              <button
                class="gold-btn"
                (click)="checkout()"
                [disabled]="checkingOut || items.length === 0"
              >
                {{ checkingOut ? 'Processing...' : 'Checkout Bundle' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class CartPageComponent implements OnInit {
  private api = inject(ApiService);

  items: any[] = [];
  total = 0;

  loading = true;
  checkingOut = false;
  updatingId: number | null = null;
  removingId: number | null = null;

  error = '';
  success = '';

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.api.getCart().subscribe({
      next: (res: any) => {
        this.items = (res.items || []).map((item: any) => ({
          ...item,
          price: Number(item.price),
          quantity: Number(item.quantity),
          quantityAvailable: Number(item.quantityAvailable)
        }));
        this.total = Number(res.total || 0);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load cart.';
        this.loading = false;
      }
    });
  }

  changeQty(item: any, quantity: number): void {
    if (quantity < 1 || quantity > item.quantityAvailable) {
      return;
    }

    this.error = '';
    this.success = '';
    this.updatingId = item.id;

    this.api.updateCartItem(item.id, { quantity }).subscribe({
      next: () => {
        this.updatingId = null;
        this.loadCart();
      },
      error: (err) => {
        this.updatingId = null;
        this.error = err.error?.message || 'Failed to update cart item.';
      }
    });
  }

  remove(id: number): void {
    this.error = '';
    this.success = '';
    this.removingId = id;

    this.api.removeCartItem(id).subscribe({
      next: () => {
        this.removingId = null;
        this.loadCart();
      },
      error: (err) => {
        this.removingId = null;
        this.error = err.error?.message || 'Failed to remove cart item.';
      }
    });
  }

  checkout(): void {
    this.error = '';
    this.success = '';
    this.checkingOut = true;

    this.api.checkoutCart().subscribe({
      next: () => {
        this.checkingOut = false;
        this.success = 'Checkout completed successfully.';
        this.loadCart();
      },
      error: (err) => {
        this.checkingOut = false;
        this.error = err.error?.message || 'Checkout failed.';
      }
    });
  }
}