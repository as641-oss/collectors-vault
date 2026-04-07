import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="hero-gradient py-5">
      <div class="container">
        <h1 class="display-5 fw-bold">Marketplace</h1>
        <p>Buy and sell cards, comics, figures, vinyl toys, and sealed collectibles.</p>
      </div>
    </section>

    <section class="container py-4">
      <div class="row g-3 mb-4">
        <div class="col-md-6">
          <input data-testid="search-input" class="form-control" [(ngModel)]="search" placeholder="Search title, series, description">
        </div>
        <div class="col-md-4">
          <select class="form-select" [(ngModel)]="category">
            <option value="">All categories</option>
            <option *ngFor="let c of categories" [value]="c.slug">{{ c.name }}</option>
          </select>
        </div>
        <div class="col-md-2 d-grid">
          <button class="btn gold-btn" (click)="load()">Search</button>
        </div>
      </div>

      <div class="row g-4" *ngIf="listings.length; else empty">
        <div class="col-md-4" *ngFor="let item of listings">
          <a
            class="text-decoration-none text-reset d-block"
            [routerLink]="['/marketplace', item.slug]"
            data-testid="listing-card-link"
          >
            <div class="card h-100 card-shadow listing-card">
              <img
                [src]="item.coverImageUrl || 'https://placehold.co/600x400?text=Collectible'"
                class="card-img-top"
                alt="listing image"
              />
              <div class="card-body">
                <div class="text-muted small mb-2">{{ item.categoryName }}</div>
                <h5 class="card-title">{{ item.title }}</h5>
                <p class="card-text">{{ item.description }}</p>
              </div>
              <div class="card-footer bg-white d-flex justify-content-between align-items-center">
                <span class="fw-bold">{{ '$' + item.price }}</span>
                <span class="badge text-bg-dark">{{ item.conditionLabel }}</span>
              </div>
            </div>
          </a>
        </div>
      </div>
      <ng-template #empty>
        <div data-testid="search-empty-state" class="alert alert-light border">No listings found.</div>
      </ng-template>
    </section>
  `
})
export class MarketplacePageComponent {
  private api = inject(ApiService);
  search = '';
  category = '';
  categories: any[] = [];
  listings: any[] = [];

  constructor() {
    this.api.getCategories().subscribe((data) => (this.categories = data));
    this.load();
  }

  load() {
    this.api.getListings(this.search, this.category).subscribe((data) => (this.listings = data));
  }
}
