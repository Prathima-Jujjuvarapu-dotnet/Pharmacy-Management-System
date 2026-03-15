import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';


@Component({
  selector: 'app-mobile-login',
  imports:[CommonModule,FormsModule],
  standalone:true,
  templateUrl: './mobile-login.component.html',
  styleUrls: ['./mobile-login.component.css']
})
export class MobileLoginComponent implements OnInit {
  token: string = '';
  email: string = '';
  password: string = '';
  loading: boolean = false;
  showSuccessBanner = false;



  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
     private location: Location
  ) {}

  ngOnInit(): void {
  this.token = this.route.snapshot.queryParamMap.get('token') || '';

}


  submitLogin() {
  console.log('Sending to backend:', {
    token: this.token,
    email: this.email,
    password: this.password
  });

  if (!this.email || !this.password) {
    this.toastr.warning('Please enter both email and password');
    return;
  }

  this.loading = true;
  this.authService.authenticateQrLogin({
    token: this.token,
    email: this.email,
    password: this.password
  }).subscribe({
    next: () => {
      this.loading = false;

      if (this.isMobileDevice()) {
  this.toastr.success('✅ Successfully logged in!', '', {
    timeOut: 0,
    extendedTimeOut: 0,
    closeButton: true,
    tapToDismiss: false
  });

  this.location.replaceState('/mobile-login'); // Clear token from URL
}
else {
        this.toastr.success('Login successful!');
        this.router.navigate(['/home']);
      }
    },
    error: (err) => {
      this.loading = false;
      const errorMsg = err?.error || 'Invalid credentials or expired token';
      if (errorMsg === 'User is inactive' || errorMsg === 'QR code is only for doctors') {
        this.toastr.info(errorMsg, 'Info');
      } else {
        this.toastr.error(errorMsg, 'Error');
      }
    }
  });
}

  isMobileDevice(): boolean {
  return /Mobi|Android|iPhone/i.test(navigator.userAgent);
}

}
