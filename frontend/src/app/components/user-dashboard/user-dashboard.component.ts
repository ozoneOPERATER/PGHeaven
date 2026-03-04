import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { PgService } from '../../services/pg.service';
import { OrderService } from '../../services/order.service';
import { CustomerOrderComponent } from '../customer-order/customer-order.component';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CustomerOrderComponent]
})
export class UserDashboardComponent implements OnInit {
  bookings: any[] = [];
  filteredBookings: any[] = [];
  userRatings: any[] = [];
  selectedStatus: string = 'All';
  statuses: string[] = ['All', 'Pending', 'Approved', 'Rejected'];
  invoice: any = null; // Store invoice after checkout
  customer: any = null;
  roomNumber: string = '';
  showPaymentForm: boolean = false;
  paymentAmount: number = 0;
  paymentMethod: string = 'cash';
  activeTab!: 'bookings' | 'order';
  selectedBookingForOrder: string | null = null;
  selectedRoomDetailsBookingId: string | null = null; // Track which booking's rooms to show

  constructor(
    private bookingService: BookingService,
    private pgService: PgService,
    private orderService: OrderService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.activeTab = 'bookings';
  }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.bookingService.myBookings().subscribe(
      (res: any) => {
        this.bookings = res;
        this.filterByStatus('All');
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error loading bookings:', error);
        this.cdr.detectChanges();
      }
    );

    this.pgService.getUserRatings().subscribe(
      (res: any) => {
        this.userRatings = res;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error loading ratings:', error);
        this.cdr.detectChanges();
      }
    );
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    if (status === 'All') {
      this.filteredBookings = this.bookings;
    } else {
      this.filteredBookings = this.bookings.filter(b => b.status === status);
    }
  }

  cancelBooking(bookingId: string) {
    if (confirm('Are you sure you want to cancel this booking?')) {
      this.bookingService.cancelBooking(bookingId).subscribe(
        (res: any) => this.load(),
        (error: any) => console.error('Error canceling booking:', error)
      );
    }
  }

  checkoutBooking(bookingId: string) {
    // removed the confirmation dialog so that users can simply view the bill even if they
    // don't intend to pay immediately.  The invoice component will indicate due amount
    // and allow payment when appropriate.
    // clear notification first so it doesn't show again
    this.bookingService.clearFoodNotice(bookingId).subscribe(() => {
      // reload bookings after clearing before invoice
      this.load();
    }, () => {
      // ignore error
    });

    this.bookingService.checkoutBooking(bookingId).subscribe(
      (res: any) => {
        if (res && res.invoice) {
          this.invoice = res.invoice;
          this.customer = res.customer;
          this.roomNumber = res.roomNumber;
          this.paymentAmount = this.invoice.total - (this.invoice.paid || 0);
          this.showPaymentForm = this.invoice.status !== 'Paid';
        }
        if (res && res.invoice && res.invoice.status !== 'Paid') {
          // Don't alert, show payment form
        } else {
          // already paid or no invoice due
          alert('Checkout complete — payment recorded.');
          // navigate to thank you
          this.router.navigate(['/thankyou']);
        }
      },
      (err: any) => { console.error('Checkout error', err); alert('Checkout failed: ' + (err?.error?.message || 'Unknown')); }
    );
  }

  submitPayment() {
    if (!this.invoice) return;
    if (!this.paymentAmount || this.paymentAmount <= 0) {
      alert('Enter a valid payment amount.');
      return;
    }
    const autoAmount = this.invoice.total - (this.invoice.paid || 0);
    this.bookingService.checkoutBooking(this.invoice.booking, {
      payment: {
        amount: autoAmount,
        method: this.paymentMethod
      }
    }).subscribe(
      (res: any) => {
        if (res && res.invoice) {
          this.invoice = res.invoice;
          this.showPaymentForm = this.invoice.status !== 'Paid';
        }
        if (this.invoice.status === 'Paid') {
          // redirect to thank you page after completing payment
          this.router.navigate(['/thankyou']);
        }
      },
      (err: any) => { console.error('Payment error', err); alert('Payment failed: ' + (err?.error?.message || 'Unknown')); }
    );
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? '⭐' : '';
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return '⭐'.repeat(fullStars) + halfStar + '☆'.repeat(emptyStars);
  }

  getDurationInDays(booking: any): number {
    if (!booking.fromDate || !booking.toDate) return 0;
    const from = new Date(booking.fromDate);
    const to = new Date(booking.toDate);
    const durationMs = to.getTime() - from.getTime();
    // Match backend calculation: Math.ceil(durationMs / msPerDay)
    const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    return days;
  }

  isOrderTab(): boolean {
    return this.activeTab === 'order';
  }

  orderForBooking(booking: any) {
    // Preselect booking in order form and switch to Order tab
    this.selectedBookingForOrder = booking._id;
    this.activeTab = 'order';
    // small delay to ensure child component picks up input after view change
    setTimeout(() => {
      // nothing else needed; CustomerOrderComponent reacts to input
    }, 50);
  }

  toggleRoomDetails(bookingId: string) {
    // Toggle room details display
    this.selectedRoomDetailsBookingId = this.selectedRoomDetailsBookingId === bookingId ? null : bookingId;
  }

  isRoomDetailsVisible(bookingId: string): boolean {
    return this.selectedRoomDetailsBookingId === bookingId;
  }

  // helper to clear notification when user views it directly
  notifyFoodViewed(booking: any) {
    if (!booking || !booking._id) return;
    this.bookingService.clearFoodNotice(booking._id).subscribe(() => {
      this.load();
    }, () => {});
  }
}
