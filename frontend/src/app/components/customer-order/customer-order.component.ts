import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { ApiService } from '../../services/api.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-customer-order',
  templateUrl: './customer-order.component.html',
  styleUrls: ['./customer-order.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CustomerOrderComponent implements OnInit {
  @Input() bookingId?: string | null;

  categories = ['breakfast', 'lunch', 'dinner'];
  activeCategory = 'breakfast';
  menu: any = {};
  selectedItems: any[] = [];
  bookings: any[] = [];
  selectedBookingId: string | null = null;
  selectedRoom: string | null = null;
  bookingRooms: string[] = [];
  selectedBookingStatus: string | null = null;

  submitting = false;
  message = '';
  totalPrice = 0;
  roomOrders: any[] = [];
  roomOrdersTotal = 0;

  constructor(private order: OrderService, private api: ApiService, private bookingService: BookingService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.loadMenu();
    this.loadBookings();

    // Read from query parameters (when navigated from booking card)
    this.route.queryParams.subscribe(params => {
      if (params['bookingId']) {
        this.selectedBookingId = params['bookingId'];
        if (params['room']) {
          this.selectedRoom = params['room'];
        }
        setTimeout(() => this.onBookingChange(), 100);
      } else if (this.bookingId) {
        // Fallback to @Input (when used as embedded component)
        this.selectedBookingId = this.bookingId;
        this.onBookingChange();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bookingId'] && !changes['bookingId'].isFirstChange()) {
      this.selectedBookingId = changes['bookingId'].currentValue || null;
      this.onBookingChange();
    }
  }

  loadBookings() {
    this.bookingService.myBookings().subscribe(
      (res: any) => { this.bookings = res || []; },
      (err: any) => { console.error('Failed to load bookings', err); }
    );
  }

  onBookingChange() {
    this.selectedRoom = null;
    const b = this.bookings.find(x => x._id === this.selectedBookingId);
    if (!b) {
      this.bookingRooms = [];
      this.selectedBookingStatus = null;
      return;
    }
    // Store booking status to check if ordering is allowed
    this.selectedBookingStatus = b.status || null;
    // Prefer enriched roomDetails.assignedRooms, fallback to selectedRooms
    this.bookingRooms = (b.roomDetails && b.roomDetails.assignedRooms && b.roomDetails.assignedRooms.length)
      ? b.roomDetails.assignedRooms
      : (b.selectedRooms || b.assignedRooms || []);
    // Auto-select first room and load its orders
    if (this.bookingRooms.length > 0) {
      this.selectedRoom = this.bookingRooms[0];
      this.loadRoomOrders();
    } else {
      this.roomOrders = [];
      this.roomOrdersTotal = 0;
    }
  }

  isOrderingAllowed(): boolean {
    if (!this.selectedBookingId) return true; // Allow if no booking selected
    return this.selectedBookingStatus === 'Approved';
  }

  getOrderingMessage(): string {
    if (!this.selectedBookingId) return '';
    if (this.selectedBookingStatus === 'Approved') return '';
    return `⚠️ Food ordering is only allowed for Approved bookings. Current status: ${this.selectedBookingStatus}`;
  }

  loadRoomOrders() {
    this.roomOrders = [];
    this.roomOrdersTotal = 0;
    if (!this.selectedBookingId || !this.selectedRoom) return;
    this.order.getByRoom(this.selectedBookingId, this.selectedRoom).subscribe(
      (res: any) => {
        if (Array.isArray(res)) {
          this.roomOrders = res;
          this.roomOrdersTotal = res.reduce((s: number, o: any) => s + (o.total || 0), 0);
        } else {
          this.roomOrders = res.orders || res.data || [];
          this.roomOrdersTotal = res.total || this.roomOrders.reduce((s: number, o: any) => s + (o.total || 0), 0);
        }
      },
      (err: any) => {
        console.error('Failed to load room orders', err);
      }
    );
  }

  loadMenu() {
    this.api.get('menu/all').subscribe(
      (data: any) => {
        this.menu = data;
      },
      (err: any) => {
        console.error('Failed to load menu', err);
      }
    );
  }

  addItem(item: any) {
    const existing = this.selectedItems.find(i => i.name === item.name);
    if (existing) {
      existing.qty++;
    } else {
      this.selectedItems.push({ name: item.name, price: item.price, qty: 1 });
    }
    this.calculateTotal();
  }

  removeItem(name: string) {
    this.selectedItems = this.selectedItems.filter(i => i.name !== name);
    this.calculateTotal();
  }

  calculateTotal() {
    this.totalPrice = this.selectedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  updateQty(name: string, qty: number) {
    const item = this.selectedItems.find(i => i.name === name);
    if (item) item.qty = Math.max(1, qty);
    this.calculateTotal();
  }

  increaseQty(name: string) {
    const item = this.selectedItems.find(i => i.name === name);
    if (item) {
      item.qty++;
      this.calculateTotal();
    }
  }

  decreaseQty(name: string) {
    const item = this.selectedItems.find(i => i.name === name);
    if (item && item.qty > 1) {
      item.qty--;
      this.calculateTotal();
    }
  }

  submit() {
    if (this.selectedItems.length === 0) {
      this.message = 'Please select at least one item.';
      return;
    }

    const orderData: any = {
      items: this.selectedItems,
      total: this.totalPrice
    };
    if (this.selectedBookingId && this.selectedRoom) {
      orderData.roomNumber = this.selectedRoom;
    }

    this.submitting = true;
    this.message = '';
    const obs = this.selectedBookingId ? this.order.createForBooking(this.selectedBookingId, orderData) : this.order.create(orderData);

    obs.subscribe(
      (_: any) => {
        this.submitting = false;
        this.message = 'Order placed successfully. Total: ₹' + this.totalPrice;
        this.selectedItems = [];
        this.totalPrice = 0;
      },
      (err: any) => {
        this.submitting = false;
        this.message = err?.error?.message || 'Order failed.';
      }
    );
  }
}
