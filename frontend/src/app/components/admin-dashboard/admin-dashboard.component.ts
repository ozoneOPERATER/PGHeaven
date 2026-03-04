import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({ selector: 'app-admin-dashboard', templateUrl: './admin-dashboard.component.html', styleUrls: ['./admin-dashboard.component.scss'], standalone: true, imports: [CommonModule, FormsModule, RouterModule] })
export class AdminDashboardComponent implements OnInit {
  stats: any = {};
  activities: any[] = [];
  user: any = null;

  constructor(private api: ApiService, private authService: AuthService) { }

  ngOnInit(): void {
    // load current user from AuthService (uses sessionStorage)
    this.user = this.authService.getUser();

    this.loadStats();
    this.loadActivities();
  }

  loadStats(): void {
    this.api.get('pgs/stats').subscribe((res: any) => {
      this.stats = res;
      if (isNaN(this.stats.averageRating)) {
        this.stats.averageRating = 0;
      }
    });
  }

  loadActivities(): void {
    // Fetch recent bookings
    this.api.get('bookings').subscribe((bookings: any) => {
      this.activities = [];

      // Add recent bookings to activities
      if (Array.isArray(bookings)) {
        bookings.slice(0, 5).forEach((booking: any) => {
          this.activities.push({
            icon: '📅',
            title: `New Booking - ${booking.pgName || 'PG'}`,
            time: new Date(booking.createdAt),
            type: 'booking'
          });
        });
      }

      // Fetch recent orders
      this.api.get('orders').subscribe((orders: any) => {
        if (Array.isArray(orders)) {
          orders.slice(0, 3).forEach((order: any) => {
            this.activities.push({
              icon: '🍽️',
              title: `New Order - ₹${order.totalAmount || 0}`,
              time: new Date(order.createdAt),
              type: 'order'
            });
          });
        }

        // Sort by date descending and limit to 5
        this.activities.sort((a, b) => b.time - a.time);
        this.activities = this.activities.slice(0, 5);
      });
    });
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }
}
