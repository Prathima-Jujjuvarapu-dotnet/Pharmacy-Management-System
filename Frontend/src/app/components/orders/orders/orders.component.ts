import { Component } from '@angular/core';
import { IOrder, IOrderDetail, IOrderItem } from '../../../interfaces/models';
import { OrderService } from '../../../services/order.service'; // Import the correct service
import { CommonModule } from '@angular/common';
import { Route } from '@angular/router';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent {
  myOrders: {
    orderId: number;
    orderDate: string;
    orderStatus: string;
    items: {
      drugName: string;
      quantity: number;
      price: number;
      image: string;
    }[];
  }[] = [];
  
  
  constructor(private orderservice: OrderService,private router:Router) {}
  //constructor(private orderservice: OrdersComponent) {}
  ngOnInit() {
  this.getDoctorOrders();

  // 🔥 Listen for changes in orders
  this.orderservice.ordersUpdated.subscribe(() => {
    console.log("♻ Refreshing My Orders...");
    this.getDoctorOrders(); // Reload My Orders
  });
}

  
  
 // ordersUpdated = new Subject<void>();

  // Removed duplicate implementation of updateOrdersAfterCartRemoval
  
  getDoctorOrders() {
    console.log("♻ Fetching latest doctorOrders...");

    this.orderservice.getDoctorOrders().subscribe(
      (response: any) => {
        console.log("📦 Raw API Response:", response); // 🔍 Check if API is sending orders

        if (!response || response.length === 0) {
          console.warn("❌ No orders found from API. Loading from localStorage...");
          
          // ✅ If API fails, load from localStorage
          const storedOrders = JSON.parse(localStorage.getItem('doctorOrders') || '[]');
          console.log("📂 Loaded My Orders from Local Storage:", storedOrders);
          this.myOrders = storedOrders;
          return;
        }

        const apiOrders = response as IOrder[];
        this.myOrders = [];

        apiOrders.forEach(order => {
          if (order.orderDetails && Array.isArray(order.orderDetails)) {
            this.myOrders.push({
              orderId: order.orderId,
              orderDate: new Date(order.orderDate).toLocaleDateString(),
              orderStatus: order.status || 'Approved',
              items: order.orderDetails.map((detail: IOrderDetail) => ({
                drugName: detail.drugName || 'Unknown Drug',
                quantity: detail.quantity || 1,
                price: this.convertToNumber(detail.price),
                image: detail.image || 'assets/default-medicine.jpg'
              }))
            });
          } 
        });

        console.log("📦 Processed API Orders:", this.myOrders);

        // ✅ Store orders in localStorage (ONLY if API sent valid data)
        if (this.myOrders.length > 0) {
          localStorage.setItem('doctorOrders', JSON.stringify(this.myOrders));
          console.log("✅ doctorOrders stored in localStorage:", this.myOrders);
        } else {
          console.warn("❌ No valid orders to store in localStorage.");
        }
      },
      (error) => {
        console.error("❌ Error fetching orders from API:", error);
        
        // ✅ If API fails, load from localStorage
        const storedOrders = JSON.parse(localStorage.getItem('doctorOrders') || '[]');
        console.log("📂 Loaded My Orders from Local Storage:", storedOrders);
        this.myOrders = storedOrders;
      }
    );
}


  convertToNumber(value: any): number {
    return typeof value === 'number' ? value : parseFloat(value) || 0;
  }
  payNow(orderId: number) {
    console.log("💰 Paying for orderId:", orderId);
  
    // 🔍 Find the full order
    const selectedOrder = this.myOrders.find(o => o.orderId === orderId);
    if (!selectedOrder) {
      console.error("❌ Order not found");
      return;
    }
  
    // ✅ Create cart from all items in this order
    const cartItems = selectedOrder.items.map(item => ({
      orderId: orderId,
      drugName: item.drugName,
      quantity: item.quantity,
      price: item.price,
      image: item.image
    }));
  
    // ✅ Store in localStorage (overwrite existing cart)
    localStorage.setItem('cart', JSON.stringify(cartItems));
  
    // ✅ Remove this order from localStorage doctorOrders
    let myOrders = JSON.parse(localStorage.getItem('doctorOrders') || '[]');
    myOrders = myOrders.filter((o: any) => o.orderId !== orderId);
  
    localStorage.setItem('doctorOrders', JSON.stringify(myOrders));
    this.orderservice.ordersUpdated.next();
  
    // ✅ Redirect to cart
    this.router.navigate(['/cart']);
  }
  
  
  
  updateOrdersAfterCartRemoval(updatedOrders: IOrderItem[]) {
    console.log("♻ Updating My Orders after cart removal...");
  
    let storedOrders = JSON.parse(localStorage.getItem('doctorOrders') || '[]');
  
    // ✅ Keep only drugs still in updatedOrders
    storedOrders = storedOrders.map((order: any) => {
      order.items = order.items.filter((item: any) =>
        updatedOrders.some(u => u.drugName === item.drugName && u.orderId === order.orderId)
      );
      return order;
    }).filter((order: any) => order.items.length > 0); // remove empty orders
  
    this.myOrders = storedOrders;
  
    localStorage.setItem('doctorOrders', JSON.stringify(this.myOrders));
    this.orderservice.ordersUpdated.next();
  }
  
}  