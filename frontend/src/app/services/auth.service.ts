import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000';

  constructor(private api: ApiService) {}

  register(data: any) { return this.api.post('auth/register', data); }
  login(data: any) { return this.api.post('auth/login', data); }
  forgotPassword(data: any) { return this.api.post('auth/forgot-password', data); }
  logout() { sessionStorage.removeItem('token'); sessionStorage.removeItem('user'); }
  setSession(token: string, user: any) { sessionStorage.setItem('token', token); sessionStorage.setItem('user', JSON.stringify(user)); }
  getUser() { const u = sessionStorage.getItem('user'); return u ? JSON.parse(u) : null; }
  getToken() { return sessionStorage.getItem('token') || null; }
  getUsers() { return this.api.get('auth/users'); }
  updateUser(id: string, data: any) { return this.api.put(`auth/users/${id}`, data); }
  updateProfile(data: any) { return this.api.put('auth/profile', data); }
  changePassword(data: any) { return this.api.put('auth/change-password', data); }
  deleteUser(id: string) { return this.api.delete(`auth/users/${id}`); }
  deleteAccount() { return this.api.delete('auth/profile'); }
  getImageUrl(imagePath: string): string { if (!imagePath) return ''; if (imagePath.startsWith('http')) return imagePath; return this.apiUrl + '/' + imagePath.replace(/\\/g, '/'); }

  // Upload just the avatar file (uses FormData)
  uploadAvatar(file: File) {
    const fd = new FormData();
    fd.append('avatar', file);
    return this.api.put('auth/profile', fd);
  }
}
