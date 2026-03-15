import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private baseUrl = 'http://localhost:5127/Sales'; // adjust if needed

  constructor(private http: HttpClient) {}

  getAllSales(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.baseUrl}/get-sales`,{ headers });
  }

  getDoctorSales(doctorEmail: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.baseUrl}/get-doctor-sales/${doctorEmail}`,{ headers });
  }

  getSalesByDrug(drugName: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.baseUrl}/DrugSales/${drugName}`,{ headers });
  }

  getHighDemandDrugs(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.baseUrl}/get-high-demand-drugs`,{ headers });
  }
}
