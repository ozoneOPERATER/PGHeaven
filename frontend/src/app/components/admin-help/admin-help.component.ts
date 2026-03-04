import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-help',
  templateUrl: './admin-help.component.html',
  styleUrls: ['./admin-help.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AdminHelpComponent {
  expandedFaq: number | null = null;

  faqs = [
    {
      question: 'How do I add a new property?',
      answer: 'Go to "Manage PGs" → "Add New PG" → Fill in property details, select images, and click "Add Property".'
    },
    {
      question: 'How can I manage bookings?',
      answer: 'Navigate to "Bookings" to see all user bookings. You can update status (Pending, Approved, Rejected) for each booking.'
    },
    {
      question: 'How do I view user analytics?',
      answer: 'Click on "Analytics" in the sidebar to view KPIs, bookings breakdown, and performance metrics.'
    },
    {
      question: 'Can I delete users?',
      answer: 'Yes, go to "Users" and click the delete button. Admin users cannot be deleted for security.'
    },
    {
      question: 'How is revenue calculated?',
      answer: 'Revenue = Property Price × Booked Rooms × Duration (days).'
    },
    {
      question: 'How often should I update property details?',
      answer: 'Update property details whenever there are changes to availability, pricing, or room count.'
    }
  ];

  toggleFaq(index: number) {
    this.expandedFaq = this.expandedFaq === index ? null : index;
  }

  contactSupport() {
    alert('📧 Support email: support@pgrental.com\n📞 Phone: +91-XXXX-XXXX-XXXX');
  }
}
