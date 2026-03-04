import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-orders',
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminOrdersComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  searchQuery: string = '';
  selectedStatus: string = 'All';
  statuses: string[] = ['All', 'Pending', 'Prepared', 'Delivered', 'Cancelled'];

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getUser();
    if (!user || user.role !== 'admin') {
      this.router.navigate(['/auth']);
      return;
    }
    this.load();
  }

  load() {
    this.orderService.all().subscribe(
      (res: any) => {
        this.orders = res || [];
        this.applyFilters();
      },
      (error) => {
        console.error('Error loading orders:', error);
      }
    );
  }

  applyFilters() {
    let filtered = this.orders;

    // Apply status filter
    if (this.selectedStatus !== 'All') {
      filtered = filtered.filter(o => o.status === this.selectedStatus);
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(o => {
        const userName = o.user?.name || o.booking?.user?.name || '';
        const orderId = o._id || '';
        const roomNumbers = this.formatRooms(o.rooms || o.selectedRooms || []);
        
        return (
          userName.toLowerCase().includes(query) ||
          orderId.toLowerCase().includes(query) ||
          roomNumbers.toLowerCase().includes(query)
        );
      });
    }

    this.filteredOrders = filtered;
  }

  filterByStatus(status: string) {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onSearchChange(query: string) {
    this.searchQuery = query;
    this.applyFilters();
  }

  updateStatus(id: string, event: any) {
    const newStatus = event.target?.value || event;
    if (!newStatus) return;

    this.orderService.updateStatus(id, newStatus).subscribe(
      () => {
        this.load();
      },
      (error) => {
        console.error('Error updating order status:', error);
      }
    );
  }

  formatRooms(rooms: any): string {
    if (!rooms || rooms.length === 0) return '—';
    return rooms
      .map((r: any) => {
        if (typeof r === 'string' || typeof r === 'number') return r;
        if (r?.roomNumber) return r.roomNumber;
        return '?';
      })
      .join(', ');
  }

  getStatusStats() {
    return {
      total: this.orders.length,
      pending: this.orders.filter(o => o.status === 'Pending').length,
      prepared: this.orders.filter(o => o.status === 'Prepared').length,
      delivered: this.orders.filter(o => o.status === 'Delivered').length
    };
  }
}
