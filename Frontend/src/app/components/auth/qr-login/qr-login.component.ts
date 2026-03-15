import { Component, OnDestroy, OnInit } from '@angular/core';
// import { NgxQrcodeModule } from 'angularx-qrcode'; // Removed: should be imported in your module, not component
// Update the path below to the correct relative path where auth.service.ts exists
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { interval, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeComponent  } from 'angularx-qrcode';

@Component({
  selector: 'app-qr-login',
  imports:[CommonModule, FormsModule, QRCodeComponent ],
  templateUrl: './qr-login.component.html',
  styleUrls: ['./qr-login.component.css']
})
export class QrLoginComponent implements OnInit, OnDestroy {
  qrToken: string = '';
  pollingSub!: Subscription;
  ipaddress:string='192.168.1.6';
  loading: boolean = false;
  qrUrl: string ='';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.authService.createQrSession().subscribe({
      next: (res) => {
        this.qrToken = res.token; 
        this.qrUrl = `http://192.168.1.6:4200/#/mobile-login?token=${res.token}`; // ✅ This is shown in QR

        this.startPolling();
      },
      error: () => this.toastr.error('Failed to generate QR session')
    });
  }

  startPolling() {
    this.pollingSub = interval(3000).subscribe(() => {
      this.authService.checkQrStatus(this.qrToken).subscribe({
        next: (res) => {
          if (res.authenticated && res.token) {
            localStorage.setItem('token', res.token);
            const decoded: any = JSON.parse(atob(res.token.split('.')[1]));
            const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];

            if (role === 'Doctor') {
              localStorage.setItem('userRole', role);
              localStorage.setItem('doctorEmail', email);
              this.toastr.success('QR Login Successful!');
              this.router.navigate(['/home']);
            } else {
              this.toastr.warning('QR login is only for Doctors');
              this.router.navigate(['/login']);
            }

            this.pollingSub.unsubscribe();
          }
        },
        error: () => {
          this.toastr.error('QR session expired or invalid');
          this.pollingSub.unsubscribe();
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSub) this.pollingSub.unsubscribe();
  }
}
