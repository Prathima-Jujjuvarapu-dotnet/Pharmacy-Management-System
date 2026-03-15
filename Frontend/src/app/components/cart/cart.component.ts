import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IOrderItem } from '../../interfaces/models';
import { DrugService } from '../../services/drug.service';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
 //import { load } from '@cashfreepayments/cashfree-js';
import { PaymentService } from '../../services/payment.service';
import { HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
//import { url } from 'inspector';
declare var Cashfree: any;
@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  
  imports: [CommonModule, FormsModule],
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: IOrderItem[] = [];
  totalAmount: number = 0;
  
  approvedOrders: any[] = [];
  hasApprovedOrders: boolean = false;
  waitingForApproval: boolean = false;
  statusMessage: string = '';
  ordersUpdated = new BehaviorSubject<void>(undefined);  // BehaviorSubject for order updates

  constructor(
    private drugService: DrugService, 
    private orderService: OrderService, 
    private paymentService: PaymentService, 
    private route: Router,
    private toastr: ToastrService
    
  ) {}

  ngOnInit() {
    this.loadCart();
    this.checkApprovedOrders();
  


  }

  showNotification(message: string) {
    this.toastr.info(message);
  }
   checkApprovedOrders() {
    const doctorOrders = JSON.parse(localStorage.getItem('doctorOrders') || '[]');
    this.hasApprovedOrders = doctorOrders.some((order: any) => order.orderStatus === 'Approved');
  }

  loadCart() {
  const localCartItems = JSON.parse(localStorage.getItem('cart') || '[]');
  const doctorOrders = JSON.parse(localStorage.getItem('doctorOrders') || '[]');
  const paidOrders = JSON.parse(localStorage.getItem('paidOrders') || '[]');

  const approvedOrders = doctorOrders.filter(
    (order: any) => order.orderStatus === 'Approved' && !paidOrders.includes(order.orderId)
  );

  const approvedItems: IOrderItem[] = approvedOrders.flatMap((order: any) =>
    order.items.map((item: any) => ({
      ...item,
      orderId: order.orderId,
      orderStatus: order.orderStatus,
      approved: true
    }))
  );

  // Start with all items in local cart
  const mergedItems: IOrderItem[] = [...localCartItems];

  for (const item of approvedItems) {
    const alreadyExists = mergedItems.some(
      (i) =>
        i.drugName === item.drugName &&
        i.orderId === item.orderId &&
        i.orderStatus === 'Approved'
    );
    if (!alreadyExists) {
      mergedItems.push(item);
    }
  }

  this.cartItems = mergedItems;
  this.saveCartToLocalStorage();

  this.drugService.getAllDrugs().subscribe((drugs) => {
    const drugMap = new Map<string, string>(
      drugs.map((drug: { name: string; image: string }) => [
        drug.name,
        drug.image || 'assets/default-medicine.jpg'
      ])
    );

    this.cartItems.forEach((item) => {
      item.image = drugMap.get(item.drugName) || 'assets/default-medicine.jpg';
    });

    this.calculateTotalAmount();

    if (approvedItems.length > 0) {
      this.toastr.success(
        'Your order has been approved! You can now proceed with payment.',
        'Order Approved'
      );
    }
  });
}


  updateQuantity(index: number, event: any) {
    const newQuantity = Number(event.target.value);
    if (newQuantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }

    this.cartItems[index].quantity = newQuantity;
    this.saveCartToLocalStorage();
    this.calculateTotalAmount();
  }

  removeFromCart(order: any) {
    const drugName = order?.drugName;
    const orderId = order?.orderId ?? 0;

    if (!drugName) {
      console.error('❌ Missing drug name. Cannot remove item.');
      return;
    }

    let doctorOrders = JSON.parse(localStorage.getItem('doctorOrders') || '[]');
    doctorOrders = doctorOrders.filter((item: any) => !(item.drugName === drugName && (item.orderId ?? 0) === orderId));
    localStorage.setItem('doctorOrders', JSON.stringify(doctorOrders));

    this.cartItems = this.cartItems.filter((item: any) => !(item.drugName === drugName && (item.orderId ?? 0) === orderId));
    this.saveCartToLocalStorage();

    if (orderId && orderId !== 0) {
      this.orderService.deleteOrderItems(orderId, drugName).subscribe(
        () => {
          console.log(`✅ Removed ${drugName} from backend (Order ID: ${orderId})`);
          this.orderService.ordersUpdated.next();
        },
        (error) => {
          console.error('❌ Backend removal failed:', error);
        }
      );
    } else {
      console.log(`🧹 Removed ${drugName} from local cart`);
    }

    this.calculateTotalAmount();
  }

  calculateTotalAmount(): number {
    this.totalAmount = this.cartItems.reduce(
      (sum: number, item) => sum + (this.convertToNumber(item.price) * item.quantity),
      0
    );
    return this.totalAmount;
  }

  convertToNumber(value: string | number | Number): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    if (value instanceof Number) return value.valueOf();
    return value as number;
  }

  placeOrder() {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const orderRequest = {
      orderItems: this.cartItems.map((item) => ({
        drugName: item.drugName,
        quantity: item.quantity,
        price: this.convertToNumber(item.price),
      }))
    };

    this.orderService.placeOrder(orderRequest).subscribe(
      (response) => {
        alert('Order placed successfully!');
        localStorage.setItem('Pending', JSON.stringify(this.cartItems));
        this.orderService.ordersUpdated.next();
      },
      (error) => {
        console.error('❌ Order placement failed:', error);
        alert('Order placement failed. Please try again.');
      }
    );
  }

 

// makePayment() {
//   const storedDoctorOrders = JSON.parse(localStorage.getItem('doctorOrders') || '[]');
//   const approvedOrders = storedDoctorOrders.filter((order: any) => order.orderStatus === 'Approved');

//   if (approvedOrders.length === 0) {
//     this.toastr.info('Please wait 10 seconds while your order is being approved.', 'Hold On!');
//     return;
//   }

//   const doctorEmail = localStorage.getItem('doctorEmail');
//   if (!doctorEmail) {
//     this.toastr.error('Doctor email not found! Please log in again.', 'Error');
//     return;
//   }

//   const drugNames = approvedOrders.flatMap((order: any) =>
//     order.items.map((item: any) => item.drugName)
//   );

//   const totalAmount = this.calculateTotalAmount();

//   const paymentRequest = {
//     doctorEmail,
//     drugNames,
//     paymentMethod: 'Instamojo',
//     upiApp: null,
//     transactionId: null
//   };

//   // Call your backend to initiate Instamojo payment
//   this.paymentService.initiateInstamojoPayment({ 
//     purpose: 'Pharmacy Payment',
//     amount: totalAmount,
//     buyerName: doctorEmail.split('@')[0],
//     email: doctorEmail,
//     phone: '9999999999',
//     redirectUrl: 'https://yourfrontend.com/payment-success' // Replace with your actual route
//   }).subscribe(
//     (res: any) => {
//       const response = typeof res === 'string' ? JSON.parse(res) : res;
//       const paymentUrl = response.payment_request?.longurl;

//       if (paymentUrl) {
//         window.location.href = paymentUrl; // Redirect to Instamojo payment page
//       } else {
//         this.toastr.error('Failed to get payment URL from Instamojo.', 'Error');
//       }
//     },
//     (error) => {
//       console.error('❌ Failed to initiate Instamojo payment:', error);
//       this.toastr.error('Could not start payment. Please try again.', 'Error');
//     }
//   );
// }
goToFakePayment() {
  const doctorEmail = localStorage.getItem('doctorEmail');
  const doctorOrders = JSON.parse(localStorage.getItem('doctorOrders') || '[]');

  const approvedOrders = doctorOrders.filter(
    (order: any) => order.orderStatus === 'Approved'
  );

  if (approvedOrders.length === 0) {
    this.toastr.info('Please wait for admin approval before making payment.', 'Order Pending');
    this.statusMessage = '⏳ Waiting for admin approval...';
    this.waitingForApproval = true;
    return;
  }

  const drugNames = approvedOrders.flatMap((order: any) =>
    order.items.map((item: any) => item.drugName)
  );

  const paymentData = {
    doctorEmail,
    drugNames,
    totalAmount: this.totalAmount
  };

  localStorage.setItem('paymentPreview', JSON.stringify(paymentData));
  this.route.navigate(['/fake-payment']);
}




  private saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  } 
  }    