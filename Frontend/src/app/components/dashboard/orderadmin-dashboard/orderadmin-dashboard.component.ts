import { Component } from '@angular/core';
import { IOrder, IOrderItem } from '../../../interfaces/models';
import { OrderService } from '../../../services/order.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { ProfileSidebarComponent } from '../../profile-sidebar/profile-sidebar.component';
// import { ToastrService } from 'ngx-toastr';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { ToastrModule } from 'ngx-toastr';
interface IExtendedOrder extends IOrder {
  isVerified: boolean;
}

@Component({
  selector: 'app-orderadmin-dashboard',
  imports: [CommonModule, FormsModule,ProfileSidebarComponent],
  providers: [ToastrService],
  templateUrl: './orderadmin-dashboard.component.html',
  styleUrls: ['./orderadmin-dashboard.component.css']
})
export class OrderadminDashboardComponent {
  allOrders: IOrder[] = [];
  updatedStatuses: { [orderId: number]: string } = {};
  filteredOrders: IOrder[] = [];
  isDeliveryView = false;
  email: string = localStorage.getItem('email') || '';
 constructor(
    private orderService: OrderService,
    private paymentService: PaymentService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentRoute = this.router.url;
    console.log('Current route:', currentRoute);

    // Determine if we're in the delivery or update route
    if (currentRoute.includes('/delivery')) {
      this.isDeliveryView = true;
    } else if (currentRoute.includes('/update')) {
      this.isDeliveryView = false;
    }

    this.getAllOrders();
  }

  getAllOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (orders: IOrder[]) => {
        this.allOrders = orders;

        // Filter orders based on the view
        this.filteredOrders = this.allOrders.filter(order =>
          this.isDeliveryView
            ? ['Paid', 'Shipped', 'Delivered'].includes(order.status)
            : ['Pending', 'Approved', 'Rejected'].includes(order.status)
        );
      },
      error: err => {
        console.error('Error fetching orders:', err);
      }
    });
  }
  // Method to handle status changes
  onStatusChange(orderId: number, newStatus: string): void {
    this.updatedStatuses[orderId] = newStatus;
  }

  // Method to submit the updated status
  submitStatusUpdate(orderId: number): void {
    const newStatus = this.updatedStatuses[orderId];

    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (updatedOrder: IOrder) => {
        const index = this.allOrders.findIndex(o => o.orderId === updatedOrder.orderId);
        if (index > -1) {
          updatedOrder.orderDetails = this.allOrders[index].orderDetails;
          this.allOrders[index] = updatedOrder;
        }

        // Toast notifications based on status
        if (newStatus === 'Approved') {
          this.toastr.success('Order approved ✅', 'Approved', {
            toastClass: 'ngx-toastr custom-toast toast-approved'
          });
        } else if (newStatus === 'Rejected') {
          this.toastr.error('Order rejected ❌', 'Rejected', {
            toastClass: 'ngx-toastr custom-toast toast-rejected'
          });
        } else if (newStatus === 'Pending') {
          this.toastr.info('Order marked as pending ⏳', 'Pending', {
            toastClass: 'ngx-toastr custom-toast toast-pending'
          });
        } else if (newStatus === 'Paid') {
          this.toastr.success('Order marked as paid 💰', 'Paid', {
            toastClass: 'ngx-toastr custom-toast toast-paid'
          });
        } else if (newStatus === 'Shipped') {
          this.toastr.info('Order shipped 📦', 'Shipped', {
            toastClass: 'ngx-toastr custom-toast toast-shipped'
          });
        } else if (newStatus === 'Delivered') {
          this.toastr.success('Order delivered 🎉', 'Delivered', {
            toastClass: 'ngx-toastr custom-toast toast-delivered'
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        this.toastr.error('Failed to update status ❌', 'Error', {
          toastClass: 'ngx-toastr custom-toast toast-rejected'
        });
        console.error('Error updating order status:', err.message);
      }
    });
  }
  
}
