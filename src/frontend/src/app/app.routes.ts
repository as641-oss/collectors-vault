import { Routes } from '@angular/router';
import { MarketplacePageComponent } from './pages/marketplace-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { SignupPageComponent } from './pages/signup-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { AccountPageComponent } from './pages/account-page.component';
import { SellerListingsPageComponent } from './pages/seller-listings-page.component';
import { ListingDetailPageComponent } from './pages/listing-detail-page.component';
import { DashboardOrdersPageComponent } from './pages/dashboard-orders-page.component';
import { OrderDetailPageComponent } from './pages/order-detail-page.component';
import { SellerOrdersPageComponent } from './pages/seller-orders-page.component';
import { AdminDashboardPageComponent } from './pages/admin-dashboard-page.component';
import { AdminUsersPageComponent } from './pages/admin-users-page.component';
import { AdminListingsPageComponent } from './pages/admin-listings-page.component';
import { AdminOrdersPageComponent } from './pages/admin-orders-page.component';
import { authGuard, roleGuard } from './core/auth.guard';
import { CartPageComponent } from './pages/cart-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'marketplace' },
  { path: 'marketplace', component: MarketplacePageComponent },
  { path: 'marketplace/:slug', component: ListingDetailPageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'signup', component: SignupPageComponent },
  { path: 'dashboard', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: 'account', component: AccountPageComponent, canActivate: [authGuard] },
  { path: 'seller/listings', component: SellerListingsPageComponent, canActivate: [authGuard, roleGuard(['seller', 'admin'])] },
  { path: 'seller/orders', component: SellerOrdersPageComponent, canActivate: [authGuard, roleGuard(['seller', 'admin'])] },
  { path: 'dashboard/orders', component: DashboardOrdersPageComponent, canActivate: [authGuard, roleGuard(['buyer'])] },
  { path: 'dashboard/orders/:id', component: OrderDetailPageComponent, canActivate: [authGuard, roleGuard(['buyer', 'seller', 'admin'])] },

  { path: 'admin', component: AdminDashboardPageComponent, canActivate: [authGuard, roleGuard(['admin'])] },
  { path: 'admin/users', component: AdminUsersPageComponent, canActivate: [authGuard, roleGuard(['admin'])] },
  { path: 'admin/listings', component: AdminListingsPageComponent, canActivate: [authGuard, roleGuard(['admin'])] },
  { path: 'admin/orders', component: AdminOrdersPageComponent, canActivate: [authGuard, roleGuard(['admin'])] },

  { path: 'cart', component: CartPageComponent, canActivate: [authGuard, roleGuard(['buyer'])] }
];

