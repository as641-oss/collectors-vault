import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="container py-4">
      <div class="row g-4">

        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <h2 class="mb-4">Account</h2>

              <div *ngIf="profileMessage" class="alert alert-success">
                {{ profileMessage }}
              </div>

              <div *ngIf="profileError" class="alert alert-danger">
                {{ profileError }}
              </div>

              <form (ngSubmit)="saveProfile()">
                <div class="row g-3">
                  <div class="col-md-4">
                    <label class="form-label">First Name</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="profile.firstName"
                      name="firstName"
                    />
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Last Name</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="profile.lastName"
                      name="lastName"
                    />
                  </div>

                  <div class="col-md-4">
                    <label class="form-label">Phone</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="profile.phone"
                      name="phone"
                    />
                  </div>
                </div>

                <div class="mt-4">
                  <button class="btn btn-dark" type="submit" [disabled]="savingProfile">
                    {{ savingProfile ? 'Saving...' : 'Save Profile' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="mb-0">Addresses</h3>
                <button class="btn btn-outline-dark" type="button" (click)="startCreateAddress()">
                  Add Address
                </button>
              </div>

              <div *ngIf="addressMessage" class="alert alert-success">
                {{ addressMessage }}
              </div>

              <div *ngIf="addressError" class="alert alert-danger">
                {{ addressError }}
              </div>

              <div *ngIf="showAddressForm" class="border rounded p-3 mb-4">
                <h5 class="mb-3">{{ editingAddressId ? 'Edit Address' : 'New Address' }}</h5>

                <form (ngSubmit)="saveAddress()">
                  <div class="row g-3">
                    <div class="col-md-6">
                      <label class="form-label">Full Name</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="addressForm.fullName"
                        name="fullName"
                        required
                      />
                    </div>

                    <div class="col-md-6">
                      <label class="form-label">Country</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="addressForm.country"
                        name="country"
                        required
                      />
                    </div>

                    <div class="col-12">
                      <label class="form-label">Address Line 1</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="addressForm.line1"
                        name="line1"
                        required
                      />
                    </div>

                    <div class="col-12">
                      <label class="form-label">Address Line 2</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="addressForm.line2"
                        name="line2"
                      />
                    </div>

                    <div class="col-md-4">
                      <label class="form-label">City</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="addressForm.city"
                        name="city"
                        required
                      />
                    </div>

                    <div class="col-md-4">
                      <label class="form-label">State</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="addressForm.state"
                        name="state"
                        required
                      />
                    </div>

                    <div class="col-md-4">
                      <label class="form-label">Postal Code</label>
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="addressForm.postalCode"
                        name="postalCode"
                        required
                      />
                    </div>
                  </div>

                  <div class="form-check mt-3">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      [(ngModel)]="addressForm.isDefault"
                      name="isDefault"
                      id="isDefault"
                    />
                    <label class="form-check-label" for="isDefault">
                      Set as default
                    </label>
                  </div>

                  <div class="mt-4 d-flex gap-2">
                    <button class="btn btn-dark" type="submit" [disabled]="savingAddress">
                      {{ savingAddress ? 'Saving...' : (editingAddressId ? 'Update Address' : 'Save Address') }}
                    </button>

                    <button class="btn btn-outline-secondary" type="button" (click)="cancelAddressForm()">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              <div *ngIf="!loadingAddresses && addresses.length === 0" class="text-muted">
                No addresses added yet.
              </div>

              <div *ngIf="loadingAddresses" class="text-muted">
                Loading addresses...
              </div>

              <div class="row g-3" *ngIf="addresses.length">
                <div class="col-md-6" *ngFor="let address of addresses">
                  <div class="border rounded p-3 h-100">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <strong>{{ address.fullName }}</strong>
                      <span *ngIf="address.isDefault" class="badge bg-dark">Default</span>
                    </div>

                    <div>{{ address.line1 }}</div>
                    <div *ngIf="address.line2">{{ address.line2 }}</div>
                    <div>{{ address.city }}, {{ address.state }} {{ address.postalCode }}</div>
                    <div>{{ address.country }}</div>

                    <div class="mt-3 d-flex gap-2">
                      <button class="btn btn-sm btn-outline-dark" type="button" (click)="editAddress(address)">
                        Edit
                      </button>
                      <button class="btn btn-sm btn-outline-danger" type="button" (click)="deleteAddress(address.id)">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  `
})
export class AccountPageComponent implements OnInit {
  private api = inject(ApiService);

  profile = {
    firstName: '',
    lastName: '',
    phone: ''
  };

  addresses: any[] = [];

  loadingAddresses = false;
  savingProfile = false;
  savingAddress = false;

  profileMessage = '';
  profileError = '';
  addressMessage = '';
  addressError = '';

  showAddressForm = false;
  editingAddressId: number | null = null;

  addressForm = this.getEmptyAddressForm();

  ngOnInit(): void {
    this.loadProfile();
    this.loadAddresses();
  }

  getEmptyAddressForm() {
    return {
      fullName: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      isDefault: false
    };
  }

  loadProfile() {
    this.profileError = '';

    this.api.getProfile().subscribe({
      next: (res) => {
        this.profile.firstName = res?.firstName || '';
        this.profile.lastName = res?.lastName || '';
        this.profile.phone = res?.phone || '';
      },
      error: (err) => {
        this.profileError = err?.error?.message || 'Could not load profile.';
      }
    });
  }

  saveProfile() {
    this.profileMessage = '';
    this.profileError = '';
    this.savingProfile = true;

    this.api.updateProfile(this.profile).subscribe({
      next: () => {
        this.profileMessage = 'Profile updated successfully.';
        this.savingProfile = false;
      },
      error: (err) => {
        this.profileError = err?.error?.message || 'Could not update profile.';
        this.savingProfile = false;
      }
    });
  }

  loadAddresses() {
    this.loadingAddresses = true;
    this.addressError = '';

    this.api.getAddresses().subscribe({
      next: (res) => {
        this.addresses = res || [];
        this.loadingAddresses = false;
      },
      error: (err) => {
        this.addressError = err?.error?.message || 'Could not load addresses.';
        this.loadingAddresses = false;
      }
    });
  }

  startCreateAddress() {
    this.addressMessage = '';
    this.addressError = '';
    this.editingAddressId = null;
    this.addressForm = this.getEmptyAddressForm();
    this.showAddressForm = true;
  }

  editAddress(address: any) {
    this.addressMessage = '';
    this.addressError = '';
    this.editingAddressId = address.id;
    this.addressForm = {
      fullName: address.fullName || '',
      line1: address.line1 || '',
      line2: address.line2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || 'US',
      isDefault: !!address.isDefault
    };
    this.showAddressForm = true;
  }

  cancelAddressForm() {
    this.showAddressForm = false;
    this.editingAddressId = null;
    this.addressForm = this.getEmptyAddressForm();
  }

  saveAddress() {
    this.addressMessage = '';
    this.addressError = '';
    this.savingAddress = true;

    const request = this.editingAddressId
      ? this.api.updateAddress(this.editingAddressId, this.addressForm)
      : this.api.createAddress(this.addressForm);

    request.subscribe({
      next: () => {
        this.addressMessage = this.editingAddressId
          ? 'Address updated successfully.'
          : 'Address added successfully.';
        this.savingAddress = false;
        this.cancelAddressForm();
        this.loadAddresses();
      },
      error: (err) => {
        this.addressError = err?.error?.message || 'Could not save address.';
        this.savingAddress = false;
      }
    });
  }

  deleteAddress(id: number) {
    if (!confirm('Delete this address?')) return;

    this.addressMessage = '';
    this.addressError = '';

    this.api.deleteAddress(id).subscribe({
      next: () => {
        this.addressMessage = 'Address deleted successfully.';
        this.loadAddresses();
      },
      error: (err) => {
        this.addressError = err?.error?.message || 'Could not delete address.';
      }
    });
  }
}