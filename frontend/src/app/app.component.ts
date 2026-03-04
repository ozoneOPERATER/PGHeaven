
import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('bannerAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ opacity: 0, transform: 'translateY(-30px)' }))
      ])
    ])
  ],
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
})
export class AppComponent {
  title = 'frontend';
  isAdminRoute = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isAdminRoute = event.url.startsWith('/admin');
      });
  }
}
