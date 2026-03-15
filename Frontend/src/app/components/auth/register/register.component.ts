import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FilePreviewPipe } from '../../file-preview.pipe';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FilePreviewPipe],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  avatars: string[] = [
    'http://localhost:5241/profile-images/avatars/avatar1.png',
    'http://localhost:5241/profile-images/avatars/avatar2.png',
    'http://localhost:5241/profile-images/avatars/avatar3.png'
  ];
  uploadedImage: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contact: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]],
      password: ['', Validators.required],
      role: ['Doctor', Validators.required],
      specialization: [''],
      adminRole: [''],
      selectedAvatar: ['']
    });

    this.onRoleChange(); // Set conditional validators
  }

  onRoleChange() {
    this.registerForm.get('role')?.valueChanges.subscribe(role => {
      if (role === 'Doctor') {
        this.registerForm.get('specialization')?.setValidators(Validators.required);
        this.registerForm.get('adminRole')?.clearValidators();
      } else if (role === 'Admin') {
        this.registerForm.get('adminRole')?.setValidators(Validators.required);
        this.registerForm.get('specialization')?.clearValidators();
      } else {
        this.registerForm.get('specialization')?.clearValidators();
        this.registerForm.get('adminRole')?.clearValidators();
      }

      this.registerForm.get('specialization')?.updateValueAndValidity();
      this.registerForm.get('adminRole')?.updateValueAndValidity();
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadedImage = file;
      this.registerForm.patchValue({ selectedAvatar: '' }); // Clear avatar if image is uploaded
    }
  }

  selectAvatar(avatar: string) {
    this.registerForm.patchValue({ selectedAvatar: avatar });
    this.uploadedImage = null; // Clear uploaded image if avatar is selected
  }

  register(event: Event) {
    event.preventDefault();

    if (this.registerForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.');
      return;
    }

    const formData = new FormData();
    Object.entries(this.registerForm.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object' && value !== null && !(value instanceof Blob)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string | Blob);
        }
      }
    });

    if (this.uploadedImage) {
      formData.append('uploadedImage', this.uploadedImage);
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.toastr.success('Successfully Registered');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.toastr.error('Registration failed');
        alert('Registration Error: ' + JSON.stringify(err.error));
      }
    });
  }
}
