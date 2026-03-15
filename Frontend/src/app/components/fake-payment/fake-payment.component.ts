import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fake-payment',
  imports: [CommonModule,FormsModule],
  templateUrl: './fake-payment.component.html',
  styleUrl: './fake-payment.component.css'
})
export class FakePaymentComponent {
  selectedMethod: string = 'UPI';
  upiApp: string = 'GPay';
  transactionId: string = 'TXN' + Math.floor(Math.random() * 1000000);
 doctorEmail: string = '';
 totalAmount: number = 0;
 drugNames: string[] = [];


  constructor(private router: Router) {}
ngOnInit(): void {
  const preview = JSON.parse(localStorage.getItem('paymentPreview') || '{}');
  this.doctorEmail = preview.doctorEmail || '';
  this.totalAmount = preview.totalAmount || 0;
  this.drugNames = preview.drugNames || [];
}


 payNow() {
  const paymentMethodMap: { [key: string]: number } = {
    UPI: 0,
    Cash: 1,
    DebitCard: 2,
    CreditCard: 3,
    NetBanking: 4
  };

  const paymentRequest = {
    doctorEmail: this.doctorEmail,
    drugNames: this.drugNames,
    paymentMethod: paymentMethodMap[this.selectedMethod],
    upiApp: this.selectedMethod === 'UPI' ? this.upiApp : null,
    transactionId: this.transactionId
  };

  localStorage.setItem('fakePaymentRequest', JSON.stringify(paymentRequest));
  this.router.navigate(['/payment-success']);
}

}
