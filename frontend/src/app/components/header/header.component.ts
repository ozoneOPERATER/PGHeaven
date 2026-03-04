import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  user: any = null;
  isMenuOpen = false;
  isSticky = false;
  showHeader = true;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    window.addEventListener('scroll', () => this.onWindowScroll());

    // Hide header on admin routes and refresh auth state
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.showHeader = !event.url.startsWith('/admin');
        this.checkAuth();
      });
  }

  checkAuth(): void {
    this.isLoggedIn = !!this.authService.getUser();
    this.user = this.authService.getUser();
  }

  onWindowScroll(): void {
    this.isSticky = window.scrollY > 10;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn = false;
    this.user = null;
    this.isMenuOpen = false;
    // Hard redirect to clear all state
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.isMenuOpen = false;
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }
}

