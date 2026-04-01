import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container py-5">
      <h2 class="mb-4">Admin Dashboard</h2>
      <div class="row g-4">
        <div class="col-md-4" *ngFor="let card of cards">
          <div class="card card-shadow"><div class="card-body"><div class="text-muted text-uppercase small">{{ card.label }}</div><div class="display-6">{{ card.value }}</div></div></div>
        </div>
      </div>
    </div>
  `
})
export class AdminPageComponent {
  private api = inject(ApiService);
  cards = [
    { label: 'Users', value: '—' },
    { label: 'Listings', value: '—' },
    { label: 'Orders', value: '—' }
  ];
  constructor() {
    this.api.getAdminStats().subscribe((stats) => {
      this.cards = [
        { label: 'Users', value: stats.users },
        { label: 'Listings', value: stats.listings },
        { label: 'Orders', value: stats.orders }
      ];
    });
  }
}
