import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PgService } from '../../services/pg.service';

@Component({
  selector: 'app-pg-list',
  templateUrl: './pg-list.component.html',
  styleUrls: ['./pg-list.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class PgListComponent implements OnInit {
  pgs: any[] = [];
  filteredPgs: any[] = [];
  searchLocation: string = '';
  searchName: string = '';
  priceRange: string = '';
  minPrice: string = '';
  maxPrice: string = '';

  constructor(
    private pgService: PgService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.searchDatabase();
  }

  searchDatabase(): void {
    const params: any = {};
    if (this.searchLocation) params.location = this.searchLocation;
    if (this.searchName) params.q = this.searchName;

    // Parse price range string ("0-5000" or "5000-10000" or "15000+")
    if (this.priceRange) {
      if (this.priceRange.includes('+')) {
        params.minPrice = this.priceRange.replace('+', '');
      } else {
        const parts = this.priceRange.split('-');
        if (parts.length === 2) {
          params.minPrice = parts[0];
          params.maxPrice = parts[1];
        }
      }
    }

    this.pgService.list(params).subscribe((res: any) => {
      this.filteredPgs = this.pgService.processImages(res.pgs || res);
      this.cdr.detectChanges();
    });
  }

  filterPGs(): void {
    this.searchDatabase();
  }

  resetFilters(): void {
    this.searchLocation = '';
    this.searchName = '';
    this.priceRange = '';
    this.minPrice = '';
    this.maxPrice = '';
    this.searchDatabase();
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? '⭐' : '';
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return '⭐'.repeat(fullStars) + halfStar + '☆'.repeat(emptyStars);
  }
}

