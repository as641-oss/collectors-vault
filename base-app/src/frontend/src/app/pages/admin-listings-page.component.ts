import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="container py-4">
      <div class="mb-4">
        <h2 class="mb-1">Admin Listings</h2>
        <p class="text-muted mb-0">All marketplace listings.</p>
      </div>

      <div *ngIf="loading" class="text-muted">
        Loading listings...
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
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let listing of listings">
                <td>{{ listing.id }}</td>
                <td>{{ listing.title }}</td>
                <td>{{ listing.slug }}</td>
                <td>{{ listing.status }}</td>
                <td>\${{ listing.price }}</td>
                <td>{{ listing.quantityAvailable }}</td>
                <td>{{ listing.createdAt | date:'medium' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `
})
export class AdminListingsPageComponent implements OnInit {
  private api = inject(ApiService);

  listings: any[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.api.getAdminListings().subscribe({
      next: (res) => {
        this.listings = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load admin listings.';
        this.loading = false;
      }
    });
  }
}

