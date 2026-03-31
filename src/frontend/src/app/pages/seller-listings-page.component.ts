import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="container py-5">
    <h2 class="mb-4">Seller Listings</h2>

      <div class="card card-shadow mb-4">
        <div class="card-body">
          <h4 class="mb-3">{{ editingId ? 'Update Listing' : 'Create Listing' }}</h4>

          <form (ngSubmit)="submitListing()">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Title</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="form.title"
                  name="title"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Category</label>
                <select
                  class="form-select"
                  [(ngModel)]="form.categoryId"
                  name="categoryId"
                  required
                >
                  <option value="">Select category</option>
                  <option *ngFor="let category of categories" [value]="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <div class="col-md-6">
                <label class="form-label">Item Type</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="form.itemType"
                  name="itemType"
                  placeholder="card, comic, figure..."
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Brand / Series</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="form.brandOrSeries"
                  name="brandOrSeries"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Condition</label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="form.conditionLabel"
                  name="conditionLabel"
                  placeholder="Near Mint"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Listing Image</label>
                  <input
                    type="file"
                    class="form-control"
                    accept=".jpg,.jpeg,.png,.webp"
                    (change)="onImageSelected($event)"
                  />

                  <div *ngIf="imageUploading" class="form-text">
                    Uploading image...
                  </div>

                  <div *ngIf="imageError" class="text-danger mt-1">
                    {{ imageError }}
                  </div>

                  <img
                    *ngIf="form.coverImageUrl"
                    [src]="form.coverImageUrl"
                    alt="Listing preview"
                    class="img-thumbnail mt-3"
                    style="max-width: 220px;"
                  />
              </div>

              <div class="col-12">
                <label class="form-label">Description</label>
                <textarea
                  class="form-control"
                  rows="3"
                  [(ngModel)]="form.description"
                  name="description"
                  required
                ></textarea>
              </div>

              <div class="col-md-4">
                <label class="form-label">Price</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="form.price"
                  name="price"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">Shipping Fee</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="form.shippingFee"
                  name="shippingFee"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">Quantity</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="form.quantityAvailable"
                  name="quantityAvailable"
                  min="1"
                  step="1"
                  required
                />
              </div>
            </div>

            <div class="mt-3 d-flex gap-2">
              <button
                type="submit"
                class="btn btn-dark"
                [disabled]="submitting"
              >
                {{
                  submitting
                    ? (editingId ? 'Saving...' : 'Creating...')
                    : (editingId ? 'Save Changes' : 'Create Listing')
                }}
              </button>

              <button
                *ngIf="editingId"
                type="button"
                class="btn btn-outline-secondary"
                (click)="cancelEdit()"
                [disabled]="submitting"
              >
                Cancel
              </button>

              <button
                *ngIf="!editingId"
                type="button"
                class="btn btn-outline-secondary"
                (click)="resetForm()"
                [disabled]="submitting"
              >
                Reset
              </button>
            </div>

            <div *ngIf="successMessage" class="alert alert-success mt-3 mb-0">
              {{ successMessage }}
            </div>

            <div *ngIf="errorMessage" class="alert alert-danger mt-3 mb-0">
              {{ errorMessage }}
            </div>
          </form>
        </div>
      </div>

      <div class="d-flex gap-2 mb-3">
        <button
          type="button"
          class="btn"
          [ngClass]="selectedTab === 'active' ? 'btn-dark' : 'btn-outline-dark'"
          (click)="selectedTab = 'active'"
        >
          Active
        </button>

        <button
          type="button"
          class="btn"
          [ngClass]="selectedTab === 'inactive' ? 'btn-dark' : 'btn-outline-dark'"
          (click)="selectedTab = 'inactive'"
        >
          Inactive
        </button>
      </div>

      <div class="table-responsive card card-shadow">
        <table class="table table-striped mb-0">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Qty</th>
              <th>Price</th>
              <th style="width: 180px;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredListings">
              <td>
                <a
                  class="text-decoration-none text-reset d-block"
                  [routerLink]="['/marketplace', item.slug]"
                  data-testid="listing-card-link"
                >
                  {{ item.title }}
                </a>
              </td>

              <td>
                <span
                  data-testid="listing-status-badge"
                  class="badge"
                  [ngClass]="{
                    'text-bg-dark': item.status === 'active',
                    'text-bg-secondary': item.status === 'inactive',
                    'text-bg-success': item.status === 'sold'
                  }"
                >
                  {{ item.status }}
                </span>
              </td>

              <td>{{ item.quantityAvailable }}</td>
              <td>{{ '$' + item.price }}</td>

              <td>
                <div *ngIf="item.status === 'active'" class="d-flex gap-2">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    (click)="startEdit(item)"
                  >
                    Update
                  </button>

                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    (click)="deleteListing(item.id)"
                  >
                    Delete
                  </button>
                </div>

                <span *ngIf="item.status !== 'active'" class="text-muted">—</span>
              </td>
            </tr>

            <tr *ngIf="!filteredListings.length">
              <td colspan="5" class="text-center py-4">
                No {{ selectedTab }} listings.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class SellerListingsPageComponent {
  private api = inject(ApiService);

  listings: any[] = [];
  categories: any[] = [];
  submitting = false;
  successMessage = '';
  errorMessage = '';
  selectedTab: 'active' | 'inactive' = 'active';
  editingId: number | null = null;
  imageUploading = false;
  imageError = '';

  form = {
    categoryId: '',
    title: '',
    description: '',
    itemType: '',
    brandOrSeries: '',
    conditionLabel: '',
    price: 0,
    shippingFee: 0,
    quantityAvailable: 1,
    coverImageUrl: ''
  };

  constructor() {
    this.loadMyListings();
    this.loadCategories();
  }

  loadMyListings() {
  this.api.mySellerListings().subscribe({
      next: (data) => {
        this.listings = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  loadCategories() {
    this.api.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  submitListing() {
  this.successMessage = '';
  this.errorMessage = '';

  console.log('FORM BEFORE SUBMIT', this.form);

  if (!this.form.categoryId) {
    this.errorMessage = 'Please select a category.';
    return;
  }

  if (!this.form.conditionLabel?.trim()) {
    this.errorMessage = 'Please enter a condition.';
    return;
  }

  const payload = {
    categoryId: Number(this.form.categoryId),
    title: this.form.title.trim(),
    slug: this.slugify(this.form.title),
    description: this.form.description.trim(),
    itemType: this.form.itemType.trim(),
    brandOrSeries: this.form.brandOrSeries.trim(),
    conditionLabel: this.form.conditionLabel.trim(),
    price: Number(this.form.price),
    shippingFee: Number(this.form.shippingFee),
    quantityAvailable: Number(this.form.quantityAvailable),
    coverImageUrl: this.form.coverImageUrl.trim(),
    status: 'active'
  };

  console.log('PAYLOAD', payload);

  this.submitting = true;

  const request = this.editingId
    ? this.api.updateListing(this.editingId, payload)
    : this.api.createListing(payload);

  request.subscribe({
    next: () => {
      this.successMessage = this.editingId
        ? 'Listing updated successfully.'
        : 'Listing created successfully.';

      this.editingId = null;
      this.resetForm();
      this.loadMyListings();
      this.submitting = false;
    },
    error: (err) => {
      console.error(err);
      this.errorMessage = err?.error?.message || 'Could not save listing.';
      this.submitting = false;
    }
  });
}

  get filteredListings() {
    return this.listings.filter((item) => item.status === this.selectedTab);
  }

  startEdit(item: any) {
    this.editingId = item.id;
    this.selectedTab = 'active';
    this.successMessage = '';
    this.errorMessage = '';

    this.form = {
      categoryId: item.categoryId ?? '',
      title: item.title || '',
      description: item.description || '',
      itemType: item.itemType || '',
      brandOrSeries: item.brandOrSeries || '',
      conditionLabel: item.conditionLabel || '',
      price: item.price || 0,
      shippingFee: item.shippingFee || 0,
      quantityAvailable: item.quantityAvailable || 1,
      coverImageUrl: item.coverImageUrl || ''
    };

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingId = null;
    this.successMessage = '';
    this.errorMessage = '';
    this.resetForm();
  }

  deleteListing(id: number) {
    const confirmed = window.confirm('Delete this listing?');
    if (!confirmed) return;

    this.api.deleteListing(id).subscribe({
      next: () => {
        if (this.editingId === id) {
          this.cancelEdit();
        }
        this.loadMyListings();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
 resetForm() {
    this.form = {
      categoryId: '',
      title: '',
      description: '',
      itemType: '',
      brandOrSeries: '',
      conditionLabel: '',
      price: 0,
      shippingFee: 0,
      quantityAvailable: 1,
      coverImageUrl: ''
    };
  }

  onImageSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  this.imageUploading = true;
  this.imageError = '';

  this.api.uploadListingImage(file).subscribe({
    next: (res: any) => {
      this.form.coverImageUrl = res.imageUrl;
      this.imageUploading = false;
    },
    error: (err) => {
      this.imageUploading = false;
      this.imageError = err?.error?.message || 'Image upload failed.';
    }
    });
  }
}