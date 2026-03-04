import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceService } from '../../services/service.service';

@Component({
  selector: 'app-customer-service',
  templateUrl: './customer-service.component.html',
  styleUrls: ['./customer-service.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CustomerServiceComponent {
  model: any = { title: '', description: '', preferredDate: '' };
  submitting = false;
  message = '';
  constructor(private service: ServiceService, private router: Router) {}

  submit() {
    this.submitting = true;
    this.message = '';
    
    // Map frontend field names to backend field names
    const requestData = {
      type: this.model.title || 'General Request',
      details: this.model.description || ''
    };
    
    this.service.create(requestData).subscribe(
      (_: any) => {
        this.submitting = false;
        this.message = 'Service request submitted successfully.';
        this.model = { title: '', description: '', preferredDate: '' };
      },
      (err: any) => {
        this.submitting = false;
        this.message = err?.error?.message || 'Submission failed.';
      }
    );
  }
}
