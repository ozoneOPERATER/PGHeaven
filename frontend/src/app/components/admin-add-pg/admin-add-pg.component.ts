import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PgService } from '../../services/pg.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-add-pg',
  templateUrl: './admin-add-pg.component.html',
  styleUrls: ['./admin-add-pg.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class AdminAddPgComponent {
  model: any = {
    name: '',
    location: '',
    price: '',
    availableRooms: '',
    totalRooms: '',
    defaultFoodPerRoom: 0,
    description: '',
    images: []
  };
  files: File[] = [];
  selectedFiles: any[] = [];
  existingImages: any[] = [];
  editingId: string | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  uploadConfig: any = {};

  constructor(
    private pgService: PgService,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Load upload configuration
    this.apiService.get('auth/config/upload-path').subscribe(
      (config: any) => {
        this.uploadConfig = config;
      }
    );

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editingId = id;
      this.pgService.get(id).subscribe(
        (res: any) => {
          this.model = res;
          // Store existing images for display
          this.existingImages = (res.images || []).map((img: string) => ({
            url: this.pgService.getImageUrl(img),
            original: img
          }));
        },
        (error) => {
          this.errorMessage = 'Failed to load property details';
          console.error('Error loading property:', error);
        }
      );
    }
  }

  onFiles(e: any) {
    this.files = Array.from(e.target.files);
    this.selectedFiles = [];
    
    // Generate previews for selected files
    this.files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        this.selectedFiles.push({
          file: file,
          preview: event.target.result,
          isNew: true
        });
      };
      reader.readAsDataURL(file);
    });
  }

  removeExistingImage(index: number) {
    this.existingImages.splice(index, 1);
  }

  submit() {
    // Validation
    if (!this.model.name || !this.model.location || !this.model.price || !this.model.description) {
      this.errorMessage = 'Please fill in all required fields';
      setTimeout(() => this.errorMessage = '', 5000);
      return;
    }

    const fd = new FormData();
    Object.keys(this.model).forEach((key) => {
      if (key !== 'images' && this.model[key] !== null && this.model[key] !== undefined) {
        fd.append(key, this.model[key]);
      }
    });
    
    // Add new files
    this.files.forEach((f) => fd.append('images', f));
    
    // Add existing images that weren't removed
    this.existingImages.forEach((img) => {
      fd.append('existingImages', img.original);
    });

    if (this.editingId) {
      this.pgService.update(this.editingId, fd).subscribe(
        () => {
          this.successMessage = 'Property updated successfully!';
          setTimeout(() => {
            this.router.navigate(['/admin/pgs']);
          }, 1500);
        },
        (error) => {
          this.errorMessage = 'Failed to update property. Please try again.';
          console.error('Error updating property:', error);
          setTimeout(() => this.errorMessage = '', 5000);
        }
      );
    } else {
      this.pgService.create(fd).subscribe(
        () => {
          this.successMessage = 'Property added successfully!';
          setTimeout(() => {
            this.router.navigate(['/admin/pgs']);
          }, 1500);
        },
        (error) => {
          this.errorMessage = 'Failed to add property. Please try again.';
          console.error('Error creating property:', error);
          setTimeout(() => this.errorMessage = '', 5000);
        }
      );
    }
  }
}
