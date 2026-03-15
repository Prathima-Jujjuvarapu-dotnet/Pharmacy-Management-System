import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
//import { ISupplier } from '../models/interfaces';
import { Observable } from 'rxjs';
import { IStockAlert, ISupplier, ISupplierDrug } from '../interfaces/models';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private baseUrl = 'http://localhost:5127/Supplier'; // Replace with your actual base URL

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAllSuppliers(): Observable<ISupplier[]> {
    return this.http.get<ISupplier[]>(`${this.baseUrl}`, {
      headers: this.getAuthHeaders()
    });
  }
  GetAllSuppliersWithDrugs():Observable<ISupplierDrug[]>{
    return this.http.get<ISupplierDrug[]>(`${this.baseUrl}/all-suppliers-drugs`, {
        headers: this.getAuthHeaders()
        });
    }
  getSupplierByName(name: string): Observable<ISupplier> {
    return this.http.get<ISupplier>(`${this.baseUrl}/${name}`, {
      headers: this.getAuthHeaders()
    });
  }

  addSupplier(supplier: ISupplier): Observable<ISupplier> {
    return this.http.post<ISupplier>(`${this.baseUrl}/add-supplier`, supplier, {
      headers: this.getAuthHeaders()
    });
  }

  updateSupplier(name: string, supplier: ISupplier): Observable<ISupplier> {
    return this.http.put<ISupplier>(`${this.baseUrl}/${name}/update`, supplier, {
      headers: this.getAuthHeaders()
    });
  }

  deleteSupplier(name: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${name}/delete`, {
      headers: this.getAuthHeaders()
    });
  }

  getSupplierDrugs(supplierName: string): Observable<ISupplierDrug[]> {
    return this.http.get<ISupplierDrug[]>(`${this.baseUrl}/${supplierName}/drugs`, {
      headers: this.getAuthHeaders()
    });
  }

  addDrugToSupplier(supplierName: string, drugName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${supplierName}/add-drug/${drugName}`, null, {
      headers: this.getAuthHeaders()
    });
  }

  removeDrugFromSupplier(supplierName: string, drugName: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${supplierName}/remove-drug/${drugName}`, {
      headers: this.getAuthHeaders()
    });
  }
  getstockalerts(): Observable<IStockAlert[]> {
    return this.http.get<IStockAlert[]>(`${this.baseUrl}/stocks`, {
      headers: this.getAuthHeaders()
    });
  }
  updateStockAlert(drugname: string, isResolved: boolean): Observable<IStockAlert> {
    const headers = this.getAuthHeaders();
    const params = new HttpParams().set('stockAlert', isResolved.toString());
  
    return this.http.put<IStockAlert>(
      `${this.baseUrl}/UpdateStock/${drugname}`,
      {}, // No body needed since you're only sending query param
      { headers, params }
    );
  }
  

  deleteStockAlert(drugname: string): Observable<IStockAlert[]> {
    return this.http.delete<IStockAlert[]>(`${this.baseUrl}/DeleteStock/${drugname}`,{
        headers: this.getAuthHeaders()
      });
  }
  
}
