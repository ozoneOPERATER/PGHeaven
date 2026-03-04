import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PgService } from '../../services/pg.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { PaymentFormComponent } from '../payment-form/payment-form.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-pg-detail',
  templateUrl: './pg-detail.component.html',
  styleUrls: ['./pg-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, PaymentFormComponent, RouterModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class PgDetailComponent implements OnInit {
  pg: any = null;
  selectedImage: string = '';
  roomsToBook: number = 1;
  fromDate: string = '';
  toDate: string = '';
  duration: number = 1;
  days: number = 1;
  includeFood: boolean = false;
  foodPerRoom: number = 0; // per day per room
  availableCount: number = 0;
  selectedRooms: string[] = []; // List of available room numbers user can select from
  chosenRooms: string[] = []; // Rooms user has selected

  // Payment state
  bookingCreated: any = null;
  bookingAmount: number = 0;
  assignedRooms: string[] = [];

  // Rating state
  userRating: number = 5;
  userReview: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pgService: PgService,
    private bookingService: BookingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  errorMessage: string | null = null;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.pgService.get(id).subscribe(
      (res: any) => {
        this.pg = { ...res, images: (res.images || []).map((img: string) => this.pgService.getImageUrl(img)) };
        if (this.pg.images && this.pg.images.length > 0) {
          this.selectedImage = this.pg.images[0];
        }
        // Set default dates (use UTC to avoid timezone issues)
        const today = new Date();
        const todayUTC = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
        this.fromDate = todayUTC.toISOString().split('T')[0];
        
        const nextMonth = new Date(todayUTC);
        nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
        this.toDate = nextMonth.toISOString().split('T')[0];
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error loading property:', error);
        this.errorMessage = error.message || JSON.stringify(error);
        this.cdr.detectChanges();
      }
    );
  }

  onDateChange() {
    // Calculate available rooms for selected date range
    if (!this.fromDate || !this.toDate || !this.pg) return;
    
    // Parse dates correctly in UTC timezone
    const [fromYear, fromMonth, fromDay] = this.fromDate.split('-').map(Number);
    const from = new Date(Date.UTC(fromYear, fromMonth - 1, fromDay));
    
    const [toYear, toMonth, toDay] = this.toDate.split('-').map(Number);
    const to = new Date(Date.UTC(toYear, toMonth - 1, toDay));
    
    if (from >= to) {
      alert('Check-out date must be after check-in date');
      return;
    }

    // Calculate duration in days (match backend calculation)
    const durationMs = to.getTime() - from.getTime();
    const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
    this.duration = days;

    // Calculate days for billing (matching backend)
    this.days = days;

    // Check actual availability from backend
    this.bookingService.checkAvailability(this.pg._id, from.toISOString(), to.toISOString()).subscribe(
      (res: any) => {
        this.availableCount = res.availableCount;
        this.selectedRooms = res.availableRooms;
        this.chosenRooms = []; // Reset selected rooms when dates change
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error('Error checking availability:', error);
        // Fallback to assuming all rooms available if API fails
        const totalRooms = this.pg.totalRooms || 1;
        this.availableCount = totalRooms;
        this.selectedRooms = Array.from({ length: totalRooms }, (_, i) => `Room ${i + 1}`);
        this.chosenRooms = [];
        this.cdr.detectChanges();
      }
    );
  }

  toggleRoomSelection(room: string) {
    if (this.chosenRooms.includes(room)) {
      this.chosenRooms = this.chosenRooms.filter(r => r !== room);
    } else {
      if (this.chosenRooms.length < this.roomsToBook) {
        this.chosenRooms.push(room);
      } else {
        alert(`You can only select ${this.roomsToBook} room(s)`);
      }
    }
  }

  selectImage(image: string) {
    this.selectedImage = image;
  }

  isLoggedIn(): boolean {
    return !!this.authService.getUser();
  }

  bookNow() {
    if (!this.isLoggedIn()) {
      this.router.navigate(['/auth']);
      return;
    }

    if (this.roomsToBook < 1 || this.roomsToBook > this.availableCount) {
      alert('Please select valid number of rooms');
      return;
    }

    if (this.chosenRooms.length !== this.roomsToBook) {
      alert(`Please select ${this.roomsToBook} specific room(s)`);
      return;
    }

    if (this.duration < 1 || this.duration > 365) {
      alert('Please select valid duration (1-365 days)');
      return;
    }

    // Parse dates correctly in UTC timezone
    const [fromYear, fromMonth, fromDay] = this.fromDate.split('-').map(Number);
    const from = new Date(Date.UTC(fromYear, fromMonth - 1, fromDay));
    
    const [toYear, toMonth, toDay] = this.toDate.split('-').map(Number);
    const to = new Date(Date.UTC(toYear, toMonth - 1, toDay));

    if (from >= to) {
      alert('Check-out date must be after check-in date');
      return;
    }

    // Room charge is per night per room
    const roomCharge = (this.pg.price || 0) * this.roomsToBook * this.days;
    // Food will be billed only via explicit menu orders (per-order). Do not auto-multiply here.
    const foodChargePerDay = 0;
    const totalPrice = roomCharge;
    
    const bookingData = {
      pgId: this.pg._id,
      roomsBooked: this.roomsToBook,
      fromDate: from.toISOString(),
      toDate: to.toISOString(),
      duration: this.duration,
      includeFood: this.includeFood, // informational only
      roomCharge: roomCharge,
      totalPrice: totalPrice,
      amountDue: totalPrice,
      selectedRooms: this.chosenRooms
    };

    this.bookingService.create(bookingData).subscribe(
      (res: any) => {
        // backend returns { booking, assignedRooms, roomCharge, message }
        this.bookingCreated = res.booking || res;
        this.assignedRooms = res.assignedRooms || this.bookingCreated.selectedRooms || [];
        this.bookingAmount = res.roomCharge || totalPrice || 0;
        this.cdr.detectChanges();
        alert(res.message || '✓ Booking request submitted! Proceed to payment.');
      },
      (error: any) => {
        console.error('Error creating booking:', error);
        const errorMsg = error.error?.message || 'Failed to create booking. Please try again.';
        alert(errorMsg);
        this.cdr.detectChanges();
      }
    );
  }

  onPaymentComplete(event: any) {
    if (event.success) {
      alert(`✓ Payment of ₹${event.amount} successful!\nBooking confirmed.`);
      this.bookingCreated = null;
      this.router.navigate(['/dashboard']);
    }
  }

  shareProperty() {
    const url = window.location.href;
    const text = `Check out this amazing property: ${this.pg.name} in ${this.pg.location}`;

    if (navigator.share) {
      navigator.share({
        title: this.pg.name,
        text: text,
        url: url
      }).catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback: copy to clipboard
      const fullText = `${text}\n${url}`;
      navigator.clipboard.writeText(fullText).then(() => {
        alert('Property link copied to clipboard!');
      });
    }
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? '⭐' : '';
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return '⭐'.repeat(fullStars) + halfStar + '☆'.repeat(emptyStars);
  }

  submitRating() {
    if (!this.isLoggedIn()) {
      alert('Please login to submit a rating.');
      this.router.navigate(['/auth']);
      return;
    }
    this.pgService.rate(this.pg._id, this.userRating, this.userReview).subscribe(
      (res: any) => {
        this.pg = res;
        this.userRating = 5;
        this.userReview = '';
        this.cdr.detectChanges();
        alert('Thank you for your rating!');
      },
      (error) => {
        console.error('Error submitting rating:', error);
        const errorMsg = error.error?.message || 'Failed to submit rating. Please try again.';
        alert(errorMsg);
        this.cdr.detectChanges();
      }
    );
  }
}
