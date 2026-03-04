import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ComplaintService {
  constructor(private api: ApiService) {}
  create(data: any) { return this.api.post('complaints', data); }
  my() { return this.api.get('complaints/my'); }
  all() { return this.api.get('complaints'); }
  updateStatus(id: string, status: string) { return this.api.put(`complaints/${id}/status`, { status }); }
}
