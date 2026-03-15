import { Component } from '@angular/core';
import { jwtDecode } from 'jwt-decode'; 
//import { AuthService } from 'src/app/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
//import { AuthService } from '../../../../services/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router'; 
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone:true,
  imports:[FormsModule,CommonModule,RouterModule],
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  otp: string = '';
  role: string = '';
  otpSent: boolean = false;
  doctorEmail: any;
  isOtpButtonDisabled: boolean = false;
  countdown: number = 0;
  timer: any;
  constructor(private authService: AuthService, private router: Router,private toastr:ToastrService) {}
  
// validateEmail(email: string): boolean {
//     const pattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
//     return pattern.test(email.trim().toLowerCase());
//   }
  
//   validatePassword(password: string): boolean {
//     // Example: Minimum 6 characters, at least one letter and one number
//     const pattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
//     return pattern.test(password);
//   }
  
  // Login with Password
  login(event: Event) {
    event.preventDefault(); // Prevent page reload
    const trimmedEmail = this.email.trim().toLowerCase();
    const trimmedPassword = this.password.trim();

    // if (!trimmedEmail || !trimmedPassword) {
    //   this.toastr.info("Please enter both email and password.");
    //   return;
    // }
    // if (!this.validateEmail(trimmedEmail)) {
    //   this.toastr.warning("Please enter a valid Gmail address.");
    //   return;
    // }
    // if (!this.validatePassword(trimmedPassword)) {
    //   this.toastr.warning("Password must be at least 6 characters and contain letters and numbers.");
    //   return;
    // }
    //console.log('Logging in with:', trimmedEmail, trimmedPassword);

    this.authService.login({ email: trimmedEmail, password: trimmedPassword }).subscribe(
      (response) => {
        console.log('Login successful:', response);
        
        // Save Token
        localStorage.setItem('token', response.token);
        
        // Extract Role from JWT
        const decodedToken: any = jwtDecode(response.token);
        this.role = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]; // Extracting role correctly
        this.doctorEmail = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]; // Extract email
        console.log('User Role:', this.role);
        console.log('Email:', this.doctorEmail);
        localStorage.setItem('userRole', this.role);
        // Store Email for Doctors
        if (this.role === 'Doctor') {
            localStorage.setItem('doctorEmail', this.doctorEmail);
        }

        // Redirect Based on Role
        switch (this.role) {
          case 'SuperAdmin':
            this.router.navigate(['/superadmin-dashboard/dashboard']);
            break;
          case 'DrugAdmin':
            this.router.navigate(['/drugadmin-dashboard']);
            break;
          case 'SalesAdmin':
              this.router.navigate(['/salesadmin-dashboard/dashboard']);
              break;
          case 'OrderAdmin':
            this.router.navigate(['/orderadmin-dashboard/update']);
            break;
          case 'SupplierAdmin':
            this.router.navigate(['/supplieradmin-dashboard/inventory']);
            break;
          case 'PaymentAdmin':
            this.router.navigate(['/paymentadmin-dashboard/allpayments']);
            break;
          case 'Doctor':
            this.sendOtp(); // Doctors need OTP verification
            break;
          default:
            this.toastr.info('Invalid Role!'); // Handle unknown roles
            this.router.navigate(['/login']);
        }
        if(this.role!=='Doctor'){
          localStorage.setItem('email', this.doctorEmail);
        }
      },
      (error) => {
        console.error('Login error:', error);
        if (error.status === 401 && error.error.includes('inactive')) {
          this.router.navigate(['/reactivate-account']);
        } else {
          this.toastr.error(error.error || 'Login failed');
        }

      }

    );
  }

  // Request OTP for Doctors
  sendOtp() {
    if (!this.email) {
      this.toastr.info("Please enter your email before requesting an OTP.");
      return;
    }
  
    this.authService.sendOtp(this.email).subscribe(
      (response) => {
        if (response && response.success === false) {
          alert(response.message);
        } else {
          this.toastr.success("OTP has been sent to your email!");
          this.otpSent = true;
          this.isOtpButtonDisabled = true;
          this.countdown = 120;
  
          this.timer = setInterval(() => {
            this.countdown--;
            if (this.countdown <= 0) {
              clearInterval(this.timer);
              this.isOtpButtonDisabled = false;
            }
          }, 1000);
        }
      },
      (error) => {
        this.toastr.error("Failed to send OTP. Try again!");
      }
    );
  }
  
  // 🆕 Format timer as MM:SS
  formatTime(): string {
    const minutes = Math.floor(this.countdown / 60);
    const seconds = this.countdown % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
  

  

  // Verify OTP for Doctors
  verifyOtp() {
    this.authService.verifyOtp(this.email, this.otp).subscribe(
      (response) => {
        console.log('OTP Verified. Login successful:', response);
        this.toastr.success("OTP Verified! Redirecting...");
        this.router.navigate(['/home']);
      },
      (error) => {
        console.error('Invalid OTP:', error);
        this.toastr.error("Invalid OTP! Try again.");
      }
    );
  }
  navigateToRegister() {
    this.router.navigate(['/register']); 
  }
  navigateToForgotPassword() {
    this.router.navigate(['/forgot-password']); 
  }
  navigateToQrLogin() {
  this.router.navigate(['/qr-login']);
}

}

