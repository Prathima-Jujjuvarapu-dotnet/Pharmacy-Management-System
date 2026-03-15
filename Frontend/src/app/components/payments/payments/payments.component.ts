import { Component, OnInit } from '@angular/core';
import { PaymentService } from '../../../services/payment.service';
import { CommonModule } from '@angular/common';
import { IPayment } from '../../../interfaces/models';
import { RouterModule } from '@angular/router';
//import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payments.component.html',
  imports:[CommonModule,RouterModule],
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {
  doctorPayments: any[] = [];
  totalAmount: number = 0;
  payments: IPayment[] = [];

  constructor(private paymentService: PaymentService) {}

  ngOnInit() {
    this.fetchPayments();
  }

  fetchPayments() {
    this.paymentService.getDoctorPayments().subscribe(
      (payments) => {
        this.doctorPayments = payments;
        this.totalAmount = this.doctorPayments.reduce((sum, p) => sum + p.amount, 0);
        localStorage.setItem('payments', JSON.stringify(payments));
      },
      (error) => {
        console.error('Error fetching payments:', error);
      }
    );
  }
}
