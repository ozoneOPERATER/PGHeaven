import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent {
  @Input() bookingId!: string;
  @Input() amount!: number;
  @Output() paymentComplete = new EventEmitter<any>();

  loading = false;
  paymentSubmitted = false;
  paymentSuccess = false;
  errorMessage = '';

  // Form fields
  cardName: string = '';
  cardNumber: string = '';
  expiryDate: string = '';
  cvv: string = '';
  paymentMethod: string = 'card';
  upiId: string = '';

  constructor(private bookingService: BookingService) {}

  isFormValid(): boolean {
    if (this.paymentMethod === 'card') {
      return !!(this.cardName && 
             this.cardNumber && 
             this.cardNumber.length === 16 &&
             this.expiryDate && 
             this.expiryDate.match(/^\d{2}\/\d{2}$/) &&
             this.cvv && 
             this.cvv.length === 3);
    } else if (this.paymentMethod === 'upi') {
      return !!(this.upiId && this.upiId.includes('@'));
    } else if (this.paymentMethod === 'netbanking') {
      return true;
    }
    return false;
  }

  submitPayment() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill all required fields correctly';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Prepare payment data
    const paymentData = {
      bookingId: this.bookingId,
      amount: this.amount,
      method: this.paymentMethod,
      cardDetails: this.paymentMethod === 'card' ? {
        name: this.cardName,
        number: this.cardNumber.slice(-4),
        expiry: this.expiryDate
      } : null,
      upiId: this.paymentMethod === 'upi' ? this.upiId : null
    };

    // Simulate payment processing
    setTimeout(() => {
      this.loading = false;
      this.paymentSubmitted = true;
      this.paymentSuccess = true;

      // Update booking with payment info
      this.bookingService.updatePayment(this.bookingId, {
        amountPaid: this.amount,
        paymentStatus: 'Paid',
        paymentMethod: this.paymentMethod
      }).subscribe(
        (res: any) => {
          this.paymentComplete.emit({
            success: true,
            bookingId: this.bookingId,
            amount: this.amount,
            method: this.paymentMethod
          });
        },
        (error: any) => {
          console.error('Error updating payment:', error);
          this.errorMessage = 'Payment recorded but update failed. Please contact admin.';
        }
      );
    }, 2000);
  }

  formatCardNumber(value: string): string {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  }

  onCardNumberChange(event: any) {
    let value = event.target.value.replace(/\s/g, '');
    if (!/^\d*$/.test(value)) {
      this.cardNumber = this.cardNumber.replace(/\D/g, '');
      return;
    }
    if (value.length <= 16) {
      this.cardNumber = value;
    }
  }

  onExpiryChange(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    this.expiryDate = value.slice(0, 5);
  }

  onCvvChange(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    this.cvv = value.slice(0, 3);
  }

  reset() {
    this.cardName = '';
    this.cardNumber = '';
    this.expiryDate = '';
    this.cvv = '';
    this.upiId = '';
    this.paymentSubmitted = false;
    this.paymentSuccess = false;
    this.errorMessage = '';
  }
}
