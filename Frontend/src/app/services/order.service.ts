import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { IOrder, IOrderItem, IOrderRequest } from '../interfaces/models';
//import { environment } from '../../environments/environment';
//import { IOrderItem } from '../../interfaces/models';  // Adjust the import path as needed
//import { IOrderRequest } from '../../interfaces/order-request.model';  // Adjust import for order request model

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  // updateOrdersAfterCartRemoval(myOrders: any) {
  //   throw new Error('Method not implemented.');
  // }
  //ordersUpdated = new BehaviorSubject<void>(undefined); 
  ordersUpdated = new Subject<void>();
  private apiUrl = `http://localhost:5127/Order`;  // Make sure to use the correct API URL
  

  constructor(private http: HttpClient) {}

  // Get orders placed by the logged-in doctor
  getDoctorOrders() {
    const token = localStorage.getItem('token'); // Retrieve token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`, // Attach token
      'Content-Type': 'application/json',
    });
  
    return this.http.get(`${this.apiUrl}/my-orders`, { headers });
  }
  // Removed duplicate deleteOrder method to avoid conflicts
  // deleteOrderItem(orderId: number, drugName: string) {
  //   return this.http.delete(`${this.apiUrl}/orders/${orderId}/drug/${drugName}`);
  // }
    

  // Get all orders (accessible to Admin)
  getAllOrders(): Observable<IOrder[]> {
    const token = localStorage.getItem('token'); // Get the token from storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Attach token
      'Content-Type': 'application/json'
    });
    return this.http.get<IOrder[]>(`${this.apiUrl}/all`,{headers});
  }

  // Place an order
  placeOrder(orderRequest: any) {
    const token = localStorage.getItem('token'); // Get the token from storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,  // Attach token
      'Content-Type': 'application/json'
    });
  
    return this.http.post(`${this.apiUrl}/place-order`, orderRequest, { headers });
  }

  // Update order status (accessible to OrderAdmin, SuperAdmin)
  updateOrderStatus(orderId: number, status: string): Observable<IOrder> {
    const token = localStorage.getItem('token'); // Get the token from storage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  
    // Send the status as a raw string (proper JSON string)
    return this.http.put<IOrder>(`${this.apiUrl}/${orderId}`, JSON.stringify(status), { headers });
  }
  

  // Remove order (for admin purposes)
  deleteOrder(orderId: number){
    const token = localStorage.getItem('token'); // Retrieve token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`, // Attach token
      'Content-Type': 'application/json',
    });
    return this.http.delete(`${this.apiUrl}/${orderId}`,{headers});
  }
  deleteOrderItems(orderId: number, drugName: string) {
    const token = localStorage.getItem('token'); // Retrieve token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`, // Attach token
      'Content-Type': 'application/json',
    });
    return this.http.delete(`${this.apiUrl}/${orderId}/drugs/${drugName}`,{headers});
}
// getAllOrders(): Observable<IOrder[]> {
//   const token = localStorage.getItem('token'); // Retrieve token
//     const headers = new HttpHeaders({
//       'Authorization': `Bearer ${token}`, // Attach token
//       'Content-Type': 'application/json',
//     });
//   return this.http.get<IOrder[]>(`${this.apiUrl}/all`,{headers});
// }

// Update order status
// updateOrderStatus(orderId: number, status: string): Observable<IOrder> {
//   const token = localStorage.getItem('token'); // Retrieve token
//   const headers = new HttpHeaders({
//     'Authorization': `Bearer ${token}`, // Attach token
//     'Content-Type': 'application/json',
//   });
//   return this.http.put<IOrder>(`${this.apiUrl}/${orderId}`, status,{headers});
// }

}
