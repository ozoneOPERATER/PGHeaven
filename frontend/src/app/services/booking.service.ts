import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private api: ApiService) {}
  
  book(data: any) { 
    return this.api.post('bookings', data); 
  }
  
  create(data: any) { 
    return this.api.post('bookings', data); 
  }
  
  myBookings() { 
    return this.api.get('bookings/my'); 
  }
  
  allBookings() { 
    return this.api.get('bookings'); 
  }
  
  updateStatus(id: string, status: string) { 
    return this.api.put(`bookings/${id}/status`, { status }); 
  }
  
  cancelBooking(id: string) { 
    return this.api.put(`bookings/${id}/cancel`, {});
  }
  
  checkAvailability(pgId: string, fromDate: string, toDate: string) {
    return this.api.get(`bookings/availability?pgId=${pgId}&fromDate=${fromDate}&toDate=${toDate}`);
  }

  checkoutBooking(id: string, body: any = {}) {
    return this.api.put(`bookings/${id}/checkout`, body);
  }

  clearFoodNotice(id: string) {
    return this.api.put(`bookings/${id}/clear-food-notice`, {});
  }

  updatePayment(id: string, paymentData: any) {
    return this.api.put(`bookings/${id}/payment`, paymentData);
  }

  /**
   * Admin only: manually add rooms back to PG availability for a booking
   */
  releaseRooms(id: string) {
    return this.api.put(`bookings/${id}/release`, {});
  }
}
