import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPayment } from '../interfaces/models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'http://localhost:5127/Payment'; // Adjust to your API URL

  constructor(private http: HttpClient) {}

  // Get payments of the logged-in doctor
  getDoctorPayments(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(`${this.apiUrl}/my-payments`, { headers });
  }

  // Make a payment
  makePayment(paymentRequest: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(`${this.apiUrl}/make-payment`, paymentRequest, { headers });
  }

  getAllPayments(): Observable<IPayment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get<IPayment[]>(`${this.apiUrl}/all`, { headers });
  }

  getUnverifiedPayments(): Observable<IPayment[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get<IPayment[]>(`${this.apiUrl}/unverified`, { headers });
  }

  getPaymentById(paymentId: number): Observable<IPayment> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get<IPayment>(`${this.apiUrl}/${paymentId}`, { headers });
  }

  verifyPayment(paymentId: number): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.apiUrl}/verify/${paymentId}`, {}, {
      headers: headers,
      responseType: 'text'
    });  }
 initiateInstamojoPayment(paymentData: any): Observable<any> {
  const token = localStorage.getItem('token'); // or whatever key you use
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.post(`${this.apiUrl}/initiate`, paymentData, { headers });
}



}
