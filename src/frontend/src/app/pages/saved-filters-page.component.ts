import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1">Saved Filters</h2>
          <p class="text-muted mb-0">Reuse your marketplace filters anytime.</p>
        </div>
      </div>

      <div *ngIf="loading" class="text-muted">Loading saved filters...</div>

      <div *ngIf="!loading && savedFilters.length === 0" class="card">
        <div class="card-body text-muted">
          No saved filters yet.
        </div>
      </div>

      <div *ngFor="let filter of savedFilters" class="card mb-3">
        <div class="card-body d-flex justify-content-between align-items-center">
          <div>
            <div class="fw-semibold">{{ filter.name }}</div>
            <small class="text-muted">
              {{ filter.search || 'No keyword' }}
            </small>
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary" (click)="applyFilter(filter)">
              Apply
            </button>

            <button class="btn btn-sm btn-outline-danger" (click)="deleteFilter(filter.id)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class SavedFiltersPageComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);


  categories: any[] = [];
  savedFilters: any[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadCategories();
    this.loadSavedFilters();
  }

  loadCategories() {
    this.api.getCategories().subscribe({
        next: (rows) => {
        this.categories = rows;
        },
        error: () => {
        this.categories = [];
        }
    });
    }
  loadSavedFilters() {
    this.api.getSavedFilters().subscribe({
      next: (rows) => {
        this.savedFilters = rows;
        this.loading = false;
      },
      error: () => {
        this.savedFilters = [];
        this.loading = false;
      }
    });
  }

  applyFilter(filter: any) {
  const selectedCategory = this.categories.find((c: any) => c.id === filter.categoryId);

  const params: any = {};

  if (filter.search) {
    params.search = filter.search;
  }

  if (selectedCategory?.slug) {
    params.category = selectedCategory.slug;
  }

  this.router.navigate(['/marketplace'], {
    queryParams: params
  });
}

  deleteFilter(id: number) {
    this.api.deleteSavedFilter(id).subscribe({
      next: () => this.loadSavedFilters()
    });
  }
}