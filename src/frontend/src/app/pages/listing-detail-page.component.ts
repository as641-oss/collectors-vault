import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute,Router, RouterModule } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
    template: `
      <section class="container py-4" *ngIf="loading">
        <div class="alert alert-light border">Loading listing...</div>
      </section>

      <section class="container py-4" *ngIf="error">
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
            <div class="mb-2"><strong>Price:</strong> {{'$' + listing.price }}</div>
            <div class="mb-3"><strong>Available:</strong> {{ listing.quantityAvailable }}</div>

            <button
              *ngIf="auth.user()?.role === 'buyer' && listing?.status === 'active' && listing?.quantityAvailable > 0"
              class="btn gold-btn"
              (click)="buyNow()">
              Buy Now
            </button>

            <span
                  *ngIf="listing?.status === 'sold' || listing?.quantity_available === 0"
                  class="badge bg-secondary">
                  Sold Out
              </span>
              <div *ngIf="error" class="alert alert-danger mt-3">
                {{ error }}
                <a routerLink="/account" *ngIf="error.includes('complete your profile')">Complete account</a>
              </div>

            <a routerLink="/marketplace" class="btn btn-outline-dark ms-2">Back</a>
          </div>
        </div>
        <section
          class="mt-5"
          *ngIf="!loadingRecommendations && recommendations.length"
          data-testid="recommendations-section">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h3 class="mb-0">Recommended for you</h3>
            </div>

            <div class="row g-3">
              <div class="col-md-6 col-lg-3" *ngFor="let item of recommendations">
                <div class="card h-100">
                  <img
                    *ngIf="item.coverImageUrl || item.imageUrl"
                    [src]="item.coverImageUrl || item.imageUrl"
                    [alt]="item.title"
                    class="card-img-top"
                    style="height: 220px; object-fit: cover;"
                  />

                  <div class="card-body d-flex flex-column">
                    <div class="text-muted small mb-1">{{ item.categoryName }}</div>
                    <h5 class="card-title">{{ item.title }}</h5>
                    <div class="text-muted mb-2">{{ item.conditionLabel }}</div>
                    <div class="fw-bold mb-3">{{ '$' + item.price }}</div>

                    <a
                      class="btn btn-outline-dark mt-auto"
                      (click)="goToListing(item.slug)">
                      View Listing
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
      </section>
    `
})
export class ListingDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private router = inject(Router);
  auth = inject(AuthService);

  listing: any = null;
  loading = true;
  error = '';
  recommendations: any[] = [];
  loadingRecommendations = false;

 ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const slug = params.get('slug');

    if (!slug) {
      this.error = 'Listing not found.';
      this.loading = false;
      return;
    }

    this.error = '';
    this.loading = true;
    this.listing = null;
    this.recommendations = [];

    this.loadListingBySlug(slug);
  });
}

loadListingBySlug(slug: string) {
  this.api.getListingBySlug(slug).subscribe({
    next: (listing) => {
      this.listing = listing;
      this.loading = false;
      this.loadRecommendations(listing.id);
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

      const slug = this.route.snapshot.paramMap.get('slug');
      if (slug) {
        this.loadListingBySlug(slug);
      }
    },
    error: (err) => {
      alert(err?.error?.message || 'Purchase failed');
    }
  });
}
    
    loadRecommendations(listingId: number) {
      this.loadingRecommendations = true;

        this.api.getRecommendations(listingId).subscribe({
          next: (rows) => {
            this.recommendations = rows;
            this.loadingRecommendations = false;
          },
          error: () => {
            this.recommendations = [];
            this.loadingRecommendations = false;
          }
        });
  }
  goToListing(slug: string) {
    if (!slug) return;
    this.router.navigate(['/marketplace', slug]);
  }
}