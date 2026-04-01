import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="container py-4">
      <div class="mb-4">
        <h2 class="mb-1">Admin Users</h2>
        <p class="text-muted mb-0">All registered marketplace users.</p>
      </div>

      <div *ngIf="loading" class="text-muted">
        Loading users...
      </div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>
     
      <div *ngIf="message" class="alert alert-success">
        {{ message }}
      </div>

      <div class="card" *ngIf="!loading && !error">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              <tr *ngFor="let user of users">
                <td>{{ user.id }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.firstName }} {{ user.lastName }}</td>

                <td>
                  <select
                    class="form-select form-select-sm"
                    [(ngModel)]="user.role"
                    (change)="updateRole(user)"
                  >
                    <option value="buyer">buyer</option>
                    <option value="seller">seller</option>
                    <option value="admin">admin</option>
                  </select>
                </td>

                <td>
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </td>

                <td>
                  <button
                    class="btn btn-sm btn-outline-dark"
                    (click)="toggleStatus(user)"
                  >
                    {{ user.isActive ? 'Deactivate' : 'Activate' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `
})
export class AdminUsersPageComponent implements OnInit {
  private api = inject(ApiService);

  users: any[] = [];
  loading = true;
  error = '';
  message = '';

  ngOnInit(): void {
    this.api.getAdminUsers().subscribe({
      next: (res) => {
        this.users = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load admin users.';
        this.loading = false;
      }
    });
  }

  updateRole(user: any) {
    this.message = '';
    this.error = '';

    this.api.updateAdminUserRole(user.id, user.role).subscribe({
      next: () => {
        this.message = 'User role updated successfully.';
      },
      error: () => {
        this.error = 'Could not update role.';
      }
    });
  }

  toggleStatus(user: any) {
    this.message = '';
    this.error = '';

    this.api.updateAdminUserStatus(user.id, !user.isActive).subscribe({
      next: () => {
        user.isActive = !user.isActive;
        this.message = 'User status updated successfully.';
      },
      error: () => {
        this.error = 'Could not update status.';
      }
    });
  }
}
