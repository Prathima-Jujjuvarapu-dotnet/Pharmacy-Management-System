import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reactivate-account',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,RouterModule],
  templateUrl: './reactivate-account.component.html',
  styleUrls: ['./reactivate-account.component.css']
})
export class ReactiveAccountComponent implements OnInit {
  reactivateForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.reactivateForm = this.fb.group({
      email: [''], // No validation here
      phoneNumber: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]]
    });
  }

  reactivateAccount() {
    if (this.reactivateForm.get('phoneNumber')?.invalid) {
      this.toastr.error('Please enter a valid phone number.');
      return;
    }

    const payload = this.reactivateForm.value;

    this.http.post('http://localhost:5127/UserProfile/reactivate-with-security', payload).subscribe({
      next: () => {
        this.toastr.success('Account reactivated! Please log in.');
        this.router.navigate(['/login']);
      },
      error: err => {
        let errorMessage = 'Reactivation failed.';
        if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.error?.title) {
          errorMessage = err.error.title;
        }
        this.toastr.error(errorMessage);
      }
    });
  }
}
