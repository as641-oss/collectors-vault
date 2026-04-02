import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
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

      <div class="card" *ngIf="!loading && !error">
        <div class="table-responsive">
          <table class="table mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Active</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>{{ user.id }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.firstName }} {{ user.lastName }}</td>
                <td>{{ user.role }}</td>
                <td>{{ user.isActive ? 'Yes' : 'No' }}</td>
                <td>{{ user.createdAt | date:'medium' }}</td>
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
}

