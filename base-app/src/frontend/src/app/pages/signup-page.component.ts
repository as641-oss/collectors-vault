import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container py-5" style="max-width: 640px;">
      <div class="card card-shadow">
        <div class="card-body p-4">
          <h2 class="mb-3">Sign Up</h2>
          <div class="row g-3">
            <div class="col-md-6"><input class="form-control" [(ngModel)]="firstName" placeholder="First name"></div>
            <div class="col-md-6"><input class="form-control" [(ngModel)]="lastName" placeholder="Last name"></div>
            <div class="col-12"><input class="form-control" [(ngModel)]="email" placeholder="Email"></div>
            <div class="col-md-6"><input class="form-control" [(ngModel)]="password" type="password" placeholder="Password"></div>
            <div class="col-md-6"><select class="form-select" [(ngModel)]="role"><option value="buyer">Buyer</option><option value="seller">Seller</option></select></div>
          </div>
          <button class="btn gold-btn mt-4" (click)="signup()">Create account</button>
        </div>
      </div>
    </div>
  `
})
export class SignupPageComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  role = 'buyer';

  signup() {
    this.api.signup({ firstName: this.firstName, lastName: this.lastName, email: this.email, password: this.password, role: this.role }).subscribe((data) => {
      this.auth.setSession(data);
      this.router.navigateByUrl('/dashboard');
    });
  }
}
