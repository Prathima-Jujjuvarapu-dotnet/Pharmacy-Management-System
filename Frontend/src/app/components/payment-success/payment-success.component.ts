import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-success',
  imports: [CommonModule,FormsModule],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent {

  status: 'processing' | 'success' | 'failed' = 'processing';

  constructor(private paymentService: PaymentService, private router: Router) {}

  ngOnInit(): void {
  const paymentRequest = JSON.parse(localStorage.getItem('fakePaymentRequest') || '{}');

  this.paymentService.makePayment(paymentRequest).subscribe(
    () => {
      this.status = 'success';

      // ✅ Update doctorOrders to mark paid items
      const paidDrugNames = paymentRequest.drugNames || [];
      let doctorOrders = JSON.parse(localStorage.getItem('doctorOrders') || '[]');
      doctorOrders = doctorOrders.map((order: any) => {
        if (paidDrugNames.includes(order.drugName)) {
          return { ...order, orderStatus: 'Paid' };
        }
        return order;
      });
      localStorage.setItem('doctorOrders', JSON.stringify(doctorOrders));

      // ✅ Remove paid items from cart
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');
      cart = cart.filter((item: any) => !paidDrugNames.includes(item.drugName));
      localStorage.setItem('cart', JSON.stringify(cart));

      // ✅ Redirect after 3 seconds
      setTimeout(() => this.router.navigate(['/home']), 3000);
    },
    (error) => {
      console.error('❌ Payment failed:', error);
      this.status = 'failed';
      setTimeout(() => this.router.navigate(['/home']), 3000);
    }
  );
}



}
