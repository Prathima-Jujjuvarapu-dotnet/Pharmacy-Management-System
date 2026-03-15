import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { IOrderItem, IPayment } from '../../interfaces/models';
import { PaymentService } from '../../services/payment.service';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-details',
  templateUrl: './payment-details.component.html',
  imports:[CommonModule,FormsModule,RouterModule],
  styleUrls: ['./payment-details.component.css']
})
export class PaymentDetailsComponent implements OnInit {
  paymentId!: number;
  paymentDetails!: IPayment;
  relatedOrders: any[] = [];
  paymentMethodLabel(method: number): string {
  switch (method) {
    case 0: return 'UPI';
    case 1: return 'Cash';
    case 2: return 'Debit Card';
    case 3: return 'Credit Card';
    case 4: return 'Net Banking';
    default: return 'Unknown';
  }
}


  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    this.paymentId = Number(this.route.snapshot.paramMap.get('paymentId'));
    console.log("Payment ID from URL:", this.paymentId);
  
    const storedPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    this.paymentDetails = storedPayments.find((p: IPayment) => p.paymentId === this.paymentId);
  
    console.log("Fetched Payment Details:", this.paymentDetails);
  
    if (this.paymentDetails) {
      const orderId = this.paymentDetails.orderId;
      console.log("Order ID from Payment:", orderId);
  
      const storedOrders = JSON.parse(localStorage.getItem('doctorOrders') || '[]');
      console.log("Stored Orders:", storedOrders);
  
      // ✅ Clean flattened related order items:
      this.relatedOrders = [];
  
      storedOrders.forEach((order: any) => {
        if (order.orderId === orderId && order.items) {
          this.relatedOrders.push(...order.items);
        }
      });
  
      console.log("Flattened Related Orders:", this.relatedOrders);
    }
  }    
}
