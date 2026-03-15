import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { ISupplier } from '../models/interfaces';
import { Observable } from 'rxjs';
import { IAdmin, ISupplier, ISupplierDrug } from '../interfaces/models';

@Injectable({
  providedIn: 'root'
})
export class SuperService {
  private baseUrl = 'http://localhost:5127/SuperAdmin'; // Replace with your actual base URL

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAllAdmins(): Observable<IAdmin[]> {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` // Attach token to request
    });
    return this.http.get<IAdmin[]>(`${this.baseUrl}/get-all-admins`,{headers});
  }
  
  changeAdminRole(adminId: number, newRole: string): Observable<IAdmin> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  
    const body = { newRole }; // 👈 matches RoleUpdateRequest
  
    return this.http.put<IAdmin>(
      `${this.baseUrl}/change-role/${adminId}`,
      body,
      { headers }
    );
  }
  
  deleteAdmin(adminId: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/delete-admin/${adminId}`, {
        headers: this.getAuthHeaders()
        });
    }
}
