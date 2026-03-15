import { Component } from '@angular/core';
import { IPayment } from '../../../interfaces/models';
import { PaymentService } from '../../../services/payment.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileSidebarComponent } from '../../profile-sidebar/profile-sidebar.component';

@Component({
  selector: 'app-paymentadmin-dashboard',
  imports: [CommonModule,ProfileSidebarComponent],
  templateUrl: './paymentadmin-dashboard.component.html',
  styleUrl: './paymentadmin-dashboard.component.css'
})
export class PaymentadminDashboardComponent {
  allPayments: IPayment[] = [];
  unverifiedPayments: IPayment[] = [];
  mismatchedPayments: IPayment[] = [];
  duplicatePayments: IPayment[] = [];
  email: string = localStorage.getItem('email') || '';

  selectedView: string = 'all'; // View switcher

  constructor(private paymentService: PaymentService,private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      const currentPath = this.router.url;
      if (currentPath.includes('unverifiedpayments')) {
        this.selectedView = 'unverified';
      } else {
        this.selectedView = 'all';
      }
    });
    this.fetchAllPayments();
    this.fetchUnverifiedPayments();
  
  }

  fetchAllPayments() {
    this.paymentService.getAllPayments().subscribe(data => {
      this.allPayments = data;
    });
  }

  fetchUnverifiedPayments() {
    this.paymentService.getUnverifiedPayments().subscribe(data => {
      this.unverifiedPayments = data;
    });
  }



  verifyPayment(paymentId: number) {
    this.paymentService.verifyPayment(paymentId).subscribe(() => {
      alert('Payment Verified Successfully ✅');
      this.fetchUnverifiedPayments();
      this.fetchAllPayments();
    });
  }
}
