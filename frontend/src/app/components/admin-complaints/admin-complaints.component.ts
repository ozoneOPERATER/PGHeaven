import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../services/complaint.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-complaints',
  templateUrl: './admin-complaints.component.html',
  styleUrls: ['./admin-complaints.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminComplaintsComponent implements OnInit {
  complaints: any[] = [];

  constructor(
    private complaintService: ComplaintService,
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
    this.complaintService.all().subscribe(
      (res: any) => {
        this.complaints = res || [];
      },
      (error) => {
        console.error('Error loading complaints:', error);
      }
    );
  }

  updateStatus(id: string, event: any) {
    const newStatus = event.target?.value || event;
    if (!newStatus) return;

    this.complaintService.updateStatus(id, newStatus).subscribe(
      () => {
        this.load();
      },
      (error) => {
        console.error('Error updating complaint status:', error);
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
