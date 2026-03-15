import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDrug, Review } from '../interfaces/models';

@Injectable({
  providedIn: 'root'
})
export class DrugService {
  private baseUrl = 'http://localhost:5127/Drug'; // Update your actual API URL

  constructor(private http: HttpClient) {}

  getAllDrugs(): Observable<any> {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}` // Attach token to request
    });

    return this.http.get(`${this.baseUrl}/all`, { headers });
  }

  getDrugByName(name: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get(`${this.baseUrl}/${name}`, { headers });
  }
  addDrug(drug: IDrug): Observable<IDrug> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post<IDrug>(`${this.baseUrl}/add`, drug,{ headers });
  }

  // ✅ Update existing drug by name
  updateDrug(name: string, updatedDrug: IDrug): Observable<IDrug> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.put<IDrug>(`${this.baseUrl}/update/${name}`, updatedDrug,{ headers });
  }

  // ✅ Delete drug by name
  deleteDrug(name: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.delete(`${this.baseUrl}/delete/${name}`,{ headers });
  }
 availabledrugs() {
  return this.http.get<{ drugName: string; isOutOfStock: boolean }[]>(`${this.baseUrl}/available-drugs`);
}
getDrugById(id: number): Observable<IDrug> {
  const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  return this.http.get<IDrug>(`${this.baseUrl}/details/${id}`,{headers});
}

getReviewsByDrug(drugName: string): Observable<Review[]> {
  const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<Review[]>(`${this.baseUrl}/drug-review/${drugName}`,{headers});
  }

  addReview(review: Review): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.post(`${this.baseUrl}/add-review`, review,{headers});
  }

  getReviewSummary(drugName: string): Observable<{ rating: number; count: number }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    return this.http.get<{ rating: number; count: number }>(`${this.baseUrl}/summary/${drugName}`,{headers});
  }


}
