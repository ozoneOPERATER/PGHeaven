import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private api: ApiService) {}
  create(data: any) { return this.api.post('orders', data); }
  createForBooking(bookingId: string, data: any) { return this.api.post(`orders/booking/${bookingId}`, data); }
  my() { return this.api.get('orders/my'); }
  all() { return this.api.get('orders'); }
  getByRoom(bookingId: string, roomNumber: string) { return this.api.get(`orders/room?bookingId=${bookingId}&roomNumber=${encodeURIComponent(roomNumber)}`); }
  updateStatus(id: string, status: string) { return this.api.put(`orders/${id}/status`, { status }); }
}
