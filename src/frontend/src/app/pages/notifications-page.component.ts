import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="container py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1">Notifications</h2>
          <p class="text-muted mb-0">View recent updates about your orders.</p>
        </div>

        <button
          class="btn btn-dark"
          (click)="markAllRead()"
          [disabled]="loading || notifications.length === 0"
        >
          Mark all as read
        </button>
      </div>

      <div *ngIf="loading" class="text-muted">Loading notifications...</div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div *ngIf="!loading && !error && notifications.length === 0" class="card">
        <div class="card-body text-muted">
          You have no notifications yet.
        </div>
      </div>

      <div class="d-grid gap-3" *ngIf="!loading && !error && notifications.length > 0">
        <div
          *ngFor="let notification of notifications"
          class="card"
          [class.border-warning]="!notification.isRead"
        >
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <h5 class="mb-1">{{ notification.title }}</h5>
                <p class="mb-2 text-muted">{{ notification.message }}</p>
                <small class="text-secondary">{{ formatDate(notification.createdAt) }}</small>
              </div>

              <div class="d-flex gap-2 flex-shrink-0">
                <a
                  *ngIf="notification.link"
                  [routerLink]="notification.link"
                  class="btn btn-outline-dark btn-sm"
                >
                  Open
                </a>

                <button
                  *ngIf="!notification.isRead"
                  class="btn btn-dark btn-sm"
                  (click)="markRead(notification.id)"
                >
                  Mark read
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `
})
export class NotificationsPageComponent implements OnInit {
  private api = inject(ApiService);

  notifications: any[] = [];
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading = true;
    this.error = '';

    this.api.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to load notifications.';
        this.loading = false;
      }
    });
  }

  markRead(id: number) {
    this.api.markNotificationRead(id).subscribe({
      next: () => {
        this.notifications = this.notifications.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true }
            : notification
        );
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to mark notification as read.';
      }
    });
  }

  markAllRead() {
    this.api.markAllNotificationsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map(notification => ({
          ...notification,
          isRead: true
        }));
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to mark all notifications as read.';
      }
    });
  }

  formatDate(value: string) {
    return new Date(value).toLocaleString();
  }
}