import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone:true,
  imports: [FormsModule,CommonModule,RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  email: string = '';
  newPassword: string = '';
  otp: string = '';
  step: 'email' | 'otp' | 'newPassword' = 'email';

  constructor(private authservice: AuthService, private router: Router, private toastr: ToastrService) {}

  requestPasswordReset(email: string) {
    this.authservice.requestPasswordReset(email).subscribe(
      (response) => {
        this.toastr.success('OTP sent to your email.');
        this.step = 'otp'; // Move to OTP step
      },
      (error) => {
        this.toastr.error('Error sending OTP. Please try again.');
      }
    );
  }

  verifyOtpAndProceed(otp: string) {
    // You can optionally verify OTP here via API
    this.step = 'newPassword'; // Move to new password step
  }

  passwordReset(otp: string, newPassword: string, email: string) {
    this.authservice.passwordReset(otp, newPassword, email).subscribe(
      (response) => {
        this.toastr.success('Password reset successfully.');
        this.router.navigate(['/login']);
      },
      (error) => {
        this.toastr.error('Error resetting password. Please try again.');
      }
    );
  }
}
