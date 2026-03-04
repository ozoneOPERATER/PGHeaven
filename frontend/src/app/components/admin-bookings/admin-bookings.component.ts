import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from 'src/app/services/booking.service';
import { PgService } from 'src/app/services/pg.service';
import { AuthService } from 'src/app/services/auth.service';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './admin-bookings.component.html',
  styleUrls: ['./admin-bookings.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminBookingsComponent implements OnInit {
  bookings: any[] = [];
  filteredBookings: any[] = [];
  selectedStatus: string = 'All';
  statuses: string[] = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];
  searchQuery: string = '';
  loading: boolean = true;
  errorMessage: string = '';

  // sort order: show newest bookings at top when true
  sortDesc: boolean = true;

  // Payment recording state
  paymentModal: { show: boolean; bookingId: string; amountPaid: number; paymentMethod: string } = {
    show: false,
    bookingId: '',
    amountPaid: 0,
    paymentMethod: 'card'
  };

  constructor(
    private bookingService: BookingService,
    private pgService: PgService,
    private authService: AuthService,
    private searchService: SearchService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (!user || user.role !== 'admin') {
      this.router.navigate(['/auth']);
      return;
    }
    this.loadBookings();
  }

  loadBookings() {
    this.loading = true;
    this.errorMessage = '';
    this.bookingService.allBookings().subscribe(
      (res: any) => {
        this.bookings = res || [];
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error('Error loading bookings:', error);
        this.errorMessage = error.error?.message || 'Failed to load bookings. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    );
  }

  applyFilters() {
    let filtered = this.bookings;

    // Apply status filter
    if (this.selectedStatus !== 'All') {
      filtered = filtered.filter(b => b.status === this.selectedStatus);
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(b => {
        const userName = b.user?.name || '';
        const pgName = b.pg?.name || '';
        const bookingId = b._id || '';
        const roomNumbers = this.formatAssignedRooms(b);

        return (
          userName.toLowerCase().includes(query) ||
          pgName.toLowerCase().includes(query) ||
          bookingId.toLowerCase().includes(query) ||
          roomNumbers.toLowerCase().includes(query)
        );
      });
    }

    // sort by createdAt according to toggle
    filtered.sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return this.sortDesc ? db - da : da - db;
    });

    this.filteredBookings = filtered;
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.applyFilters();
  }

  toggleSort() {
    this.sortDesc = !this.sortDesc;
    this.applyFilters();
  }

  updateStatus(bookingId: string, newStatus: string) {
    this.bookingService.updateStatus(bookingId, newStatus).subscribe(
      (res: any) => {
        this.loadBookings();
      },
      (error: any) => {
        console.error('Error updating booking status:', error);
        this.cdr.detectChanges();
      }
    );
  }

  releaseBookingRooms(bookingId: string) {
    if (!confirm('Are you sure you want to return the rooms for this booking?')) return;
    this.bookingService.releaseRooms(bookingId).subscribe(
      (res: any) => {
        alert(res.message || 'Rooms returned to availability');
        this.loadBookings();
      },
      (error: any) => {
        console.error('Error releasing rooms:', error);
        alert(error.error?.message || 'Failed to release rooms');
      }
    );
  }

  onStatusChange(event: any, bookingId: string) {
    const newStatus = event.target.value;
    this.updateStatus(bookingId, newStatus);
  }

  getStatusStats() {
    return {
      total: this.bookings.length,
      pending: this.bookings.filter(b => b.status === 'Pending').length,
      approved: this.bookings.filter(b => b.status === 'Approved').length,
      rejected: this.bookings.filter(b => b.status === 'Rejected').length
    };
  }

  formatAssignedRooms(booking: any): string {
    const sel = booking?.selectedRooms || booking?.assignedRooms || [];
    if (!sel || sel.length === 0) return '—';
    const parts = sel.map((r: any) => {
      if (typeof r === 'string' || typeof r === 'number') return r;
      if (r == null) return '';
      if (r.roomNumber !== undefined) return r.roomNumber;
      if (r.roomNo !== undefined) return r.roomNo;
      return String(r);
    }).filter(Boolean);
    return parts.join(', ');
  }

  openPaymentModal(bookingId: string, amountDue: number) {
    this.paymentModal = {
      show: true,
      bookingId: bookingId,
      amountPaid: amountDue,
      paymentMethod: 'card'
    };
  }

  closePaymentModal() {
    this.paymentModal.show = false;
  }

  recordPayment() {
    if (!this.paymentModal.bookingId) return;

    const booking = this.bookings.find(b => b._id === this.paymentModal.bookingId);
    if (!booking) return;

    // Determine payment status based on amount paid vs due
    let paymentStatus = 'Pending';
    if (this.paymentModal.amountPaid >= booking.amountDue) {
      paymentStatus = 'Paid';
    } else if (this.paymentModal.amountPaid > 0) {
      paymentStatus = 'Partial';
    }

    const paymentData = {
      amountPaid: this.paymentModal.amountPaid,
      paymentStatus: paymentStatus,
      paymentMethod: this.paymentModal.paymentMethod
    };

    this.bookingService.updatePayment(this.paymentModal.bookingId, paymentData).subscribe(
      (res: any) => {
        alert(`✓ Payment recorded: ₹${this.paymentModal.amountPaid} (${paymentStatus})`);
        this.loadBookings();
        this.closePaymentModal();
      },
      (error: any) => {
        console.error('Error recording payment:', error);
        alert('Failed to record payment');
      }
    );
  }
}
