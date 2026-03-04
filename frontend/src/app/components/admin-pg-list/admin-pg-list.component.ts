import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PgService } from '../../services/pg.service';

@Component({ selector: 'app-admin-pg-list', templateUrl: './admin-pg-list.component.html', styleUrls: ['./admin-pg-list.component.scss'], standalone: true, imports: [CommonModule, FormsModule, RouterModule] })
export class AdminPgListComponent implements OnInit {
  pgs: any[] = [];
  searchLocation: string = '';
  searchName: string = '';
  priceRange: string = '';

  constructor(private pgService: PgService, private router: Router) { }

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.searchDatabase();
  }

  searchDatabase(): void {
    const params: any = {};
    if (this.searchLocation) params.location = this.searchLocation;
    if (this.searchName) params.q = this.searchName;

    if (this.priceRange) {
      if (this.priceRange === 'under5000') {
        params.maxPrice = '5000';
      } else if (this.priceRange === '5000-10000') {
        params.minPrice = '5000';
        params.maxPrice = '10000';
      } else if (this.priceRange === 'over10000') {
        params.minPrice = '10000';
      }
    }

    this.pgService.list(params).subscribe((res: any) => {
      this.pgs = this.pgService.processImages(res.pgs || res);
    });
  }

  filterPGs(): void {
    this.searchDatabase();
  }

  resetFilters(): void {
    this.searchLocation = '';
    this.searchName = '';
    this.priceRange = '';
    this.searchDatabase();
  }

  edit(id: string) { this.router.navigate(['/admin/pgs/edit', id]); }
  delete(id: string) { if (confirm('Delete?')) this.pgService.delete(id).subscribe(() => this.load()); }

  // Room Management Modal
  showRoomModal: boolean = false;
  selectedPgForRooms: any = null;
  editRoomData: { totalRooms: number, availableRooms: number } = { totalRooms: 0, availableRooms: 0 };
  isSavingRooms: boolean = false;

  openRoomModal(pg: any): void {
    this.selectedPgForRooms = pg;
    this.editRoomData = {
      totalRooms: pg.totalRooms || pg.availableRooms || 1,
      availableRooms: pg.availableRooms || 0
    };
    this.showRoomModal = true;
  }

  closeRoomModal(): void {
    this.showRoomModal = false;
    this.selectedPgForRooms = null;
  }

  saveRooms(): void {
    if (!this.selectedPgForRooms) return;
    this.isSavingRooms = true;

    // Use formData to send the update according to how the backend usually expects it from PG add/edit
    const formData = new FormData();
    formData.append('totalRooms', this.editRoomData.totalRooms.toString());
    formData.append('availableRooms', this.editRoomData.availableRooms.toString());

    this.pgService.update(this.selectedPgForRooms._id, formData).subscribe({
      next: () => {
        this.isSavingRooms = false;
        this.closeRoomModal();
        this.load(); // reload the data grid to show updated numbers
      },
      error: (err) => {
        console.error('Error updating rooms', err);
        alert('Failed to update rooms. Please try again.');
        this.isSavingRooms = false;
      }
    });
  }
}
