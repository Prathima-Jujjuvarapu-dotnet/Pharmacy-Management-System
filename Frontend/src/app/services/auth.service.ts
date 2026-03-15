// auth.service.ts (Handles authentication logic)
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
//import { environment } from '../environments/environment';
//import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = `http://localhost:5127/Auth`; // Adjust API URL

  constructor(private http: HttpClient) {}
  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  getUserRole(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/get-role`, { email }); // Adjust endpoint
  }
register(user: FormData): Observable<any> {
  return this.http.post(`${this.baseUrl}/register`, user); // No headers here
}


  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login-password`,credentials).pipe(
      tap((response: any) => {
        if (response.email) {
          localStorage.setItem('doctorEmail', response.email);
        }
      })
    );
  }
  
  sendOtp(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/request-otp`, JSON.stringify({ email }), { headers: this.headers });
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login-with-otp`, JSON.stringify({ email, otp }), { headers: this.headers });
  }
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/request-reset-password`, JSON.stringify({ email }), { headers: this.headers });
  }
  passwordReset(otp: string, newpassword: string, email:string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, JSON.stringify({ email,otp,newpassword }), { headers: this.headers });
  }
  createQrSession() {
    return this.http.post<{ token: string }>(`${this.baseUrl}/qr-session`, {});
  }
  authenticateQrLogin(data: { token: string; email: string; password: string }) {
  return this.http.post(`http://192.168.1.6:5127/Auth/qr-authenticate`, data);
}

checkQrStatus(token: string) {
  return this.http.get<{ authenticated: boolean; token?: string }>(`${this.baseUrl}/qr-status/` + token);
}

notifyMe(request: { email: string, drugName: string }): Observable<any> {
    return this.http.post('http://localhost:5127/Notification/notify-me', request);
  }

  getNotifications(email:string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5127/Notification/by-email/${email}`);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.post(`http://localhost:5127/Notification/mark-read/${id}`, {});
  }

  createNotification(notification: { userId: number, message: string }): Observable<any> {
    return this.http.post(`http://localhost:5127/Notification`, notification);
  }

}
