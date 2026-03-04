import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  private authHeaders() {
    const token = sessionStorage.getItem('token');
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : {};
  }

  get(path: string, params?: any) { return this.http.get(`${this.api}/${path}`, { params, ...this.authHeaders() }); }
  post(path: string, body: any) { return this.http.post(`${this.api}/${path}`, body, this.authHeaders()); }
  put(path: string, body: any) { return this.http.put(`${this.api}/${path}`, body, this.authHeaders()); }
  delete(path: string) { return this.http.delete(`${this.api}/${path}`, this.authHeaders()); }
}
