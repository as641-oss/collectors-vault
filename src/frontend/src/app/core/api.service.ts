import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = '/api';

  private authHeader(): HttpHeaders {
    const token = localStorage.getItem('token');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  getCategories() {
    return this.http.get<any[]>(`${this.base}/categories`);
  }

  getListings(search = '', category = '') {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (category) params = params.set('category', category);
    return this.http.get<any[]>(`${this.base}/listings`, { params });
  }

  getListingBySlug(slug: string) {
    return this.http.get<any>(`${this.base}/listings/${slug}`);
  }

  createOrder(payload: { listingId: number; quantity: number }) {
    return this.http.post('/api/orders', payload, {
      headers: this.authHeader()
    });
  }

  getMyOrders() {
    return this.http.get<any[]>(`${this.base}/orders/me`, {
      headers: this.authHeader()
    });
  }

  getOrderById(id: string | number) {
    return this.http.get<any>(`${this.base}/orders/${id}`, {
      headers: this.authHeader()
    });
  }

  login(payload: any) {
    return this.http.post<any>(`${this.base}/auth/login`, payload);
  }

  signup(payload: any) {
    return this.http.post<any>(`${this.base}/auth/signup`, payload);
  }

  me() {
    return this.http.get<any>(`${this.base}/auth/me`, {
      headers: this.authHeader()
    });
  }


  mySellerListings() {
    return this.http.get<any[]>(`${this.base}/listings/mine/list`, {
      headers: this.authHeader()
    });
  }

  getSellerOrders() {
    return this.http.get<any[]>(`${this.base}/orders/seller/list`, {
      headers: this.authHeader()
    });
  }

  createListing(payload: any) {
   return this.http.post(`${this.base}/listings`, payload, {
      headers: this.authHeader()
    });
  }

  updateListing(id: number, payload: any) {
  return this.http.put(`${this.base}/listings/${id}`, payload, {
    headers: this.authHeader()
    });
  }

  deleteListing(id: number) {
    return this.http.delete(`${this.base}/listings/${id}`, {
      headers: this.authHeader()
    });
  }

  updateOrderStatus(orderId: string | number, status: string) {
    return this.http.put(`${this.base}/orders/seller/${orderId}/status`, { status }, {
      headers: this.authHeader()
    });
  }

  getProfile() {
    return this.http.get<any>(`${this.base}/users/profile`, {
    headers: this.authHeader()
    });
  }

  updateProfile(payload: any) {
  return this.http.put<any>(`${this.base}/users/profile`, payload, {
    headers: this.authHeader()
    });
  }

  getAddresses() {
    return this.http.get<any[]>(`${this.base}/users/addresses`, {
      headers: this.authHeader()
    });
  }

  createAddress(payload: any) {
    return this.http.post<any>(`${this.base}/users/addresses`, payload, {
      headers: this.authHeader()
    });
  }

  updateAddress(id: number, payload: any) {
    return this.http.put<any>(`${this.base}/users/addresses/${id}`, payload, {
      headers: this.authHeader()
    });
  }

  deleteAddress(id: number) {
    return this.http.delete<any>(`${this.base}/users/addresses/${id}`, {
      headers: this.authHeader()
    });
  }
  getAdminStats() {
    return this.http.get<any>(`${this.base}/admin/stats`, {
      headers: this.authHeader()
    });
  }

  getAdminUsers() {
    return this.http.get<any[]>(`${this.base}/admin/users`, {
      headers: this.authHeader()
    });
  }

  getAdminListings() {
    return this.http.get<any[]>(`${this.base}/admin/listings`, {
      headers: this.authHeader()
    });
  }

  getAdminOrders() {
    return this.http.get<any[]>(`${this.base}/admin/orders`, {
      headers: this.authHeader()
    });
  }
  uploadListingImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post('/api/uploads/listing-image', formData);
  }
}
