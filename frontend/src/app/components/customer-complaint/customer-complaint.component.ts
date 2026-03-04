import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComplaintService } from '../../services/complaint.service';

@Component({
  selector: 'app-customer-complaint',
  templateUrl: './customer-complaint.component.html',
  styleUrls: ['./customer-complaint.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CustomerComplaintComponent {
  model: any = { subject: '', message: '' };
  submitting = false;
  message = '';
  constructor(private complaint: ComplaintService) {}

  submit() {
    this.submitting = true;
    this.message = '';
    this.complaint.create(this.model).subscribe(
      (_: any) => {
        this.submitting = false;
        this.message = 'Complaint submitted. Admin will review it shortly.';
        this.model = { subject: '', message: '' };
      },
      (err: any) => {
        this.submitting = false;
        this.message = err?.error?.message || 'Submission failed.';
      }
    );
  }
}
