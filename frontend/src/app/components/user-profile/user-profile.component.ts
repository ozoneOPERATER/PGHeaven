import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('0.3s ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class UserProfileComponent implements OnInit {
  profile: any = { name: '', email: '', avatar: '' };
  passwordData: any = { oldPassword: '', newPassword: '' };
  showEditModal = false;
  showPasswordModal = false;
  user: any = null;
  selectedFile: File | null = null; // image file chosen by user
  originalAvatar: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user) {
      this.profile = { 
        name: this.user.name,
        email: this.user.email,
        avatar: this.user.avatar || ''
      };
    }
  }

  openEditModal(): void {
    this.showEditModal = true;
  }

  openPasswordModal(): void {
    this.showPasswordModal = true;
  }

  closeModal(): void {
    this.showEditModal = false;
    this.showPasswordModal = false;
  }

  getProfileImage(): string {
    // prefer stored avatar if available
    if (this.profile.avatar) {
      // if it's already a full url or data url we can return directly
      if (this.profile.avatar.startsWith('http') || this.profile.avatar.startsWith('data:')) {
        return this.profile.avatar;
      }
      return this.authService.getImageUrl(this.profile.avatar);
    }
    const initial = this.profile.name?.charAt(0).toUpperCase() || 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.profile.name)}&background=667eea&color=fff&size=150`;
  }

  updateProfile(): void {
    // if no file selected we send plain object, else create FormData
    let payload: any = this.profile;
    if (this.selectedFile) {
      const fd = new FormData();
      // include other fields so user can update name/email at same time
      fd.append('name', this.profile.name);
      fd.append('email', this.profile.email);
      fd.append('avatar', this.selectedFile);
      payload = fd;
    }
    this.authService.updateProfile(payload).subscribe(
      (res: any) => {
        this.user = res;
        this.profile.avatar = res.avatar || this.profile.avatar;
        this.authService.setSession(this.authService.getToken() || '', res);
        this.selectedFile = null;
        this.closeModal();
        alert('Profile updated successfully');
      },
      (error) => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
      }
    );
  }

  changePassword(): void {
    this.authService.changePassword(this.passwordData).subscribe(
      (res: any) => {
        alert('Password changed successfully');
        this.passwordData = { oldPassword: '', newPassword: '' };
        this.closeModal();
      },
      (error) => {
        console.error('Error changing password:', error);
        alert('Failed to change password');
      }
    );
  }

  forgotPassword(): void {
    const email = prompt('Enter your email address to reset password:');
    if (email) {
      this.authService.forgotPassword({ email }).subscribe(
        (response: any) => {
          alert('Password reset link sent to your email');
        },
        (error: any) => {
          const errorMsg = error.error?.message || 'Failed to send reset email';
          alert(errorMsg);
        }
      );
    }
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      this.authService.deleteAccount().subscribe(
        (res: any) => {
          this.authService.logout();
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Error deleting account:', error);
          alert('Failed to delete account');
        }
      );
    }
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      // preview immediately
      // save original so user can cancel
      this.originalAvatar = this.profile.avatar || '';
      const reader = new FileReader();
      reader.onload = () => {
        // temporarily override profile avatar for preview
        this.profile.avatar = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  cancelSelected(): void {
    // restore previous avatar preview and clear selected file
    this.profile.avatar = this.originalAvatar || '';
    this.selectedFile = null;
    this.originalAvatar = null;
  }

  public uploadPhoto(): void {
    if (!this.selectedFile) return;
    // use explicit uploadAvatar helper for clarity
    this.authService.uploadAvatar(this.selectedFile).subscribe(
      (res: any) => {
        console.log('uploadPhoto success:', res);
        this.user = res;
        this.profile.avatar = res.avatar || this.profile.avatar;
        this.authService.setSession(this.authService.getToken() || '', res);
        this.selectedFile = null;
        alert('Photo updated successfully');
      },
      (error) => {
        console.error('Error uploading photo:', error);
        const msg = error?.error?.message || (error.message ? error.message : 'Failed to upload photo');
        alert(msg);
      }
    );
  }
}
