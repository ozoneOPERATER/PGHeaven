import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-auth-page',
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.3s ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AuthPageComponent implements OnInit {
  activeTab = 'login'; // 'login' or 'register'
  isLoading = false;
  message = '';
  messageType = ''; // 'success' or 'error'
  rememberMe = false;

  loginForm = {
    email: '',
    password: ''
  };

  registerForm = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.getUser()) {
      this.router.navigate(['/']);
    }

    // Small delay to ensure DOM is ready for autofill
    setTimeout(() => {
      this.loadSavedCredentials();
    }, 100);

    // Check query param for tab switching
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.activeTab = params['tab'];
      }
    });
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.message = '';
    
    // Only clear forms when switching away from them
    if (tab === 'register') {
      this.loginForm = { email: '', password: '' };
      this.rememberMe = false;
    } else if (tab === 'login') {
      this.registerForm = { name: '', email: '', password: '', confirmPassword: '' };
      // Reload saved credentials when switching back to login
      this.loadSavedCredentials();
    }
  }

  login(): void {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.showMessage('Please fill in all fields', 'error');
      return;
    }

    this.isLoading = true;
    this.authService.login({
      email: this.loginForm.email,
      password: this.loginForm.password
    }).subscribe(
      (response: any) => {
        this.isLoading = false;
        
        // Save credentials if remember me is checked
        if (this.rememberMe) {
          this.saveCredentials();
        } else {
          this.clearSavedCredentials();
        }
        
        this.authService.setSession(response.token, response.user);
        this.showMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => {
          const route = response.user?.role === 'admin' ? '/admin' : '/';
          this.router.navigate([route]);
        }, 800);
      },
      (error: any) => {
        this.isLoading = false;
        const errorMsg = error.error?.message || 'Login failed. Please try again.';
        this.showMessage(errorMsg, 'error');
      }
    );
  }

  register(): void {
    if (!this.registerForm.name || !this.registerForm.email || !this.registerForm.password || !this.registerForm.confirmPassword) {
      this.showMessage('Please fill in all fields', 'error');
      return;
    }

    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.showMessage('Passwords do not match', 'error');
      return;
    }

    if (this.registerForm.password.length < 6) {
      this.showMessage('Password must be at least 6 characters', 'error');
      return;
    }

    this.isLoading = true;
    this.authService.register({
      name: this.registerForm.name,
      email: this.registerForm.email,
      password: this.registerForm.password
    }).subscribe(
      (response: any) => {
        this.isLoading = false;
        this.showMessage('Registration successful! Please login.', 'success');
        setTimeout(() => {
          this.switchTab('login');
        }, 1500);
      },
      (error: any) => {
        this.isLoading = false;
        const errorMsg = error.error?.message || 'Registration failed. Please try again.';
        this.showMessage(errorMsg, 'error');
      }
    );
  }

  private showMessage(msg: string, type: string): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 4000);
  }

  forgotPassword(event: Event): void {
    event.preventDefault();
    const email = prompt('Enter your email address to reset password:');
    if (email) {
      this.authService.forgotPassword({ email }).subscribe(
        (response: any) => {
          this.showMessage('Password reset link sent to your email', 'success');
        },
        (error: any) => {
          const errorMsg = error.error?.message || 'Failed to send reset email';
          this.showMessage(errorMsg, 'error');
        }
      );
    }
  }

  private loadSavedCredentials(): void {
    const saved = localStorage.getItem('pg_login_credentials');
    if (saved) {
      try {
        const credentials = JSON.parse(saved);
        this.loginForm.email = credentials.email || '';
        this.loginForm.password = credentials.password || '';
        this.rememberMe = true;
      } catch (error) {
        console.error('Error loading saved credentials:', error);
        this.clearSavedCredentials();
      }
    }
  }

  private saveCredentials(): void {
    const credentials = {
      email: this.loginForm.email,
      password: this.loginForm.password
    };
    localStorage.setItem('pg_login_credentials', JSON.stringify(credentials));
  }

  private clearSavedCredentials(): void {
    localStorage.removeItem('pg_login_credentials');
  }

  onInputFocus(): void {
    // Allow browser autofill to work without interference
    // This method can be used if needed for additional autofill handling
  }

  onRememberMeChange(): void {
    if (!this.rememberMe) {
      this.clearSavedCredentials();
    }
  }
}
