import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { IInventory } from '../models/interfaces';
import { Observable } from 'rxjs';
import { IInventory } from '../interfaces/models';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private baseUrl = 'http://localhost:5127/Inventory'; // Replace with your actual base URL

  constructor(private http: HttpClient) {}

  getAllInventory(): Observable<IInventory[]> {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` // Attach token to request
    });
    return this.http.get<IInventory[]>(`${this.baseUrl}/GetAllInventory`,{headers});
  }

  getInventoryByDrug(drugName: string): Observable<IInventory> {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` // Attach token to request
    });
    return this.http.get<IInventory>(`${this.baseUrl}/GetInventoryByDrug/${drugName}`,{headers});
  }

  updateStock(drugName: string, stockQuantity: number): Observable<IInventory> {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` // Attach token to request
    });
    return this.http.put<IInventory>(`${this.baseUrl}/UpdateStock/${drugName}`, stockQuantity,{headers});
  }

  updatePrice(drugName: string, pricePerUnit: number): Observable<IInventory> {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` // Attach token to request
    });
    return this.http.put<IInventory>(`${this.baseUrl}/UpdatePrice/${drugName}`, pricePerUnit,{headers});
  }

  updateExpiry(drugName: string, expiryDate: string): Observable<IInventory> {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` // Attach token to request
    });
    return this.http.put<IInventory>(`${this.baseUrl}/UpdateExpiry/${drugName}`, expiryDate,{headers});
  }
}
