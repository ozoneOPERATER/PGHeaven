import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  constructor(private api: ApiService) {}
  create(data: any) { return this.api.post('services', data); }
  my() { return this.api.get('services/my'); }
  all() { return this.api.get('services'); }
  updateStatus(id: string, status: string) { return this.api.put(`services/${id}/status`, { status }); }
}
