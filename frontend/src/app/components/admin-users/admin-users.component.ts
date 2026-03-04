import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  selectedRole: string = 'All';
  roles: string[] = ['All', 'admin', 'user'];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.api.get('auth/users').subscribe(
      (res: any) => {
        this.users = res.map((user: any, i: number) => ({
          ...user,
          id: i + 1
        }));
        this.filterByRole('All');
      },
      (error: any) => {
        console.error('Error loading users:', error);
        // Use mock data if API fails
        this.users = [
          { id: 1, name: 'Admin', email: 'admin@pg.com', role: 'admin', createdAt: new Date() },
          { id: 2, name: 'User', email: 'user@pg.com', role: 'user', createdAt: new Date() },
          { id: 3, name: 'tp', email: 'tp@gmail.com', role: 'user', createdAt: new Date() }
        ];
        this.filterByRole('All');
      }
    );
  }

  filterByRole(role: string) {
    this.selectedRole = role;
    if (role === 'All') {
      this.filteredUsers = this.users;
    } else {
      this.filteredUsers = this.users.filter(u => u.role === role);
    }
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.api.delete(`auth/users/${userId}`).subscribe(
        (res: any) => {
          this.loadUsers();
        },
        (error: any) => {
          console.error('Error deleting user:', error);
          alert('Unable to delete user (may not be supported by backend)');
        }
      );
    }
  }

  changeRole(userId: string, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newRole = selectElement.value;
    this.api.put(`auth/users/${userId}`, { role: newRole }).subscribe(
      (res: any) => {
        this.loadUsers();
      },
      (error: any) => {
        console.error('Error changing role:', error);
        alert('Unable to change role');
      }
    );
  }

  getUserStats() {
    return {
      total: this.users.length,
      admins: this.users.filter(u => u.role === 'admin').length,
      regularUsers: this.users.filter(u => u.role === 'user').length
    };
  }
}
