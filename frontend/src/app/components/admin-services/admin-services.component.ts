import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../services/service.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-services',
  templateUrl: './admin-services.component.html',
  styleUrls: ['./admin-services.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminServicesComponent implements OnInit {
  services: any[] = [];

  constructor(
    private serviceService: ServiceService,
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
    this.serviceService.all().subscribe(
      (res: any) => {
        this.services = res || [];
      },
      (error) => {
        console.error('Error loading services:', error);
      }
    );
  }

  updateStatus(id: string, event: any) {
    const newStatus = event.target?.value || event;
    if (!newStatus) return;

    this.serviceService.updateStatus(id, newStatus).subscribe(
      () => {
        this.load();
      },
      (error) => {
        console.error('Error updating service status:', error);
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
}
