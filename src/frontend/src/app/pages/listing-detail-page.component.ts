import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="container py-4" *ngIf="loading">
      <div class="alert alert-light border">Loading listing...</div>
    </section>

    <section class="container py-4" *ngIf="error && !loading && !listing">
      <div class="alert alert-danger">{{ error }}</div>
      <a routerLink="/marketplace" class="btn btn-outline-dark">Back to Marketplace</a>
    </section>

    <section class="container py-4" *ngIf="listing && !loading">
      <div class="row g-4">
        <div class="col-md-6">
          <img
            [src]="listing.coverImageUrl || 'https://placehold.co/800x600?text=Collectible'"
            class="img-fluid rounded border"
            [alt]="listing.title"
          />
        </div>

        <div class="col-md-6">
          <div class="text-muted small mb-2">{{ listing.categoryName }}</div>
          <h1 class="mb-3">{{ listing.title }}</h1>
          <p class="mb-3">{{ listing.description }}</p>

          <div class="mb-2"><strong>Condition:</strong> {{ listing.conditionLabel }}</div>
          <div class="mb-2"><strong>Price:</strong> {{ '$' + listing.price }}</div>
          <div class="mb-3"><strong>Available:</strong> {{ listing.quantityAvailable }}</div>

          <button
            *ngIf="auth.user()?.role === 'buyer' && listing?.status === 'active' && listing?.quantityAvailable > 0"
            class="btn gold-btn"
            (click)="buyNow()">
            Buy Now
          </button>

          <button
            *ngIf="auth.user()?.role === 'buyer' && listing?.status === 'active' && listing?.quantityAvailable > 0"
            class="btn btn-outline-dark ms-2"
            (click)="showOfferForm = !showOfferForm">
            Make Offer
          </button>

          <span
            *ngIf="listing?.status === 'sold' || listing?.quantityAvailable === 0"
            class="badge bg-secondary">
            Sold Out
          </span>

          <a routerLink="/marketplace" class="btn btn-outline-dark ms-2">Back</a>

          <div *ngIf="showOfferForm" class="card mt-3">
            <div class="card-body">
              <label class="form-label fw-semibold">Your Offer Amount</label>
              <input
                type="number"
                class="form-control mb-2"
                [(ngModel)]="offerAmount"
                min="1"
                step="0.01"
                placeholder="Enter your offer" />

              <button class="btn gold-btn" (click)="submitOffer()">
                Submit Offer
              </button>
            </div>
          </div>

          <div *ngIf="offerMessage" class="alert alert-info mt-3">
            {{ offerMessage }}
          </div>

          <div *ngIf="error && listing" class="alert alert-danger mt-3">
            {{ error }}
            <a routerLink="/account" *ngIf="error.includes('complete your profile')">Complete account</a>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ListingDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  auth = inject(AuthService);

  listing: any = null;
  loading = true;
  error = '';

  showOfferForm = false;
  offerAmount: number | null = null;
  offerMessage = '';

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.error = 'Listing not found.';
      this.loading = false;
      return;
    }

    this.loadListing();
  }

  loadListing() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;

    this.api.getListingBySlug(slug).subscribe({
      next: (listing) => {
        this.listing = listing;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load listing.';
        this.loading = false;
      }
    });
  }

  buyNow() {
    if (!this.listing) return;

    this.api.createOrder({
      listingId: this.listing.id,
      quantity: 1
    }).subscribe({
      next: () => {
        alert('Purchase successful');
        this.loadListing();
      },
      error: (err) => {
        alert(err?.error?.message || 'Purchase failed');
      }
    });
  }

  submitOffer() {
    if (!this.listing || !this.offerAmount || this.offerAmount <= 0) {
      this.offerMessage = 'Please enter a valid offer amount.';
      return;
    }

    this.api.createOffer({
      listingId: this.listing.id,
      amount: this.offerAmount
    }).subscribe({
      next: (res) => {
        this.offerMessage = res?.message || 'Offer submitted successfully.';
        this.offerAmount = null;
        this.showOfferForm = false;
      },
      error: (err) => {
        this.offerMessage = err?.error?.message || 'Could not submit offer.';
      }
    });
  }
}