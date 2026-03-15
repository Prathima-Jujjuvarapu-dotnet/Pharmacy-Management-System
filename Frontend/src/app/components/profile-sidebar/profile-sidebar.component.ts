import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.css'],
  encapsulation: ViewEncapsulation.None

})
export class ProfileSidebarComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('video') video!: ElementRef;

  @Input() email!: string;
  profile: any;
  showImageOptions = false;
  showCamera = false;
  mediaStream: MediaStream | null = null;

  editMode: any = {
    contact: false,
    address: false,
    specialization: false
  };

  selectedAvatar: string | null = null;
  uploadedImage: File | null = null;
  previewImageUrl: string | null = null;

  isSidebarOpen: boolean = false;
  avatarBaseUrl = 'http://localhost:5241/profile-images/avatars/';

  // Role flags
  isDoctor: boolean = false;
  isAdmin: boolean = false;
  adminRole: string = '';

  constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (this.email && token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      this.http.get(`http://localhost:5127/UserProfile/get-user-profile-by-email/${this.email}`, { headers })
        .subscribe({
          next: (data: any) => {
            this.profile = data;

            // Role detection
            if (data.Role === 'Doctor') {
              this.isDoctor = true;
            } else if (data.Role === 'Admin') {
              this.isAdmin = true;
              this.adminRole = data.AdminRole;
            }
          },
          error: (err) => console.error('Error loading profile:', err)
        });
    }
  }

  toggleImageOptions(): void {
    this.showImageOptions = !this.showImageOptions;
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
    this.showImageOptions = false;
  }

  openCamera(): void {
    navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
      this.mediaStream = stream;
      this.showCamera = true;
      this.showImageOptions = false;

      setTimeout(() => {
        if (this.video && this.video.nativeElement) {
          this.video.nativeElement.srcObject = stream;
        } else {
          this.toastr.error('Camera element not found');
        }
      }, 100);
    }).catch(err => {
      console.error('Camera error:', err.name, err.message);
      this.toastr.error(`Camera access denied: ${err.message}`);
    });
  }

  capturePhoto(): void {
    if (!this.video || !this.video.nativeElement) {
      this.toastr.error('Camera not ready');
      return;
    }

    const video = this.video.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (blob) {
        this.uploadedImage = new File([blob], 'captured.png', { type: 'image/png' });
        this.previewImageUrl = URL.createObjectURL(blob);
        this.submitProfileImage();
      }
    });
    this.closeCamera();
  }

  closeCamera(): void {
    this.showCamera = false;
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }

  getFullImageUrl(imagePath: string | undefined): string {
    const backendBaseUrl = 'http://localhost:5241';
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `${backendBaseUrl}/${imagePath}`;
  }

  toggleEdit(field: string): void {
    this.editMode[field] = !this.editMode[field];
  }

  saveField(field: string): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = {
      name: this.profile.Name,
      contact: this.profile.Contact,
      address: this.profile.Address,
      specialization: this.profile.Specialization,
      profileImageUrl: this.profile.ProfileImageUrl
    };

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.put(
      `http://localhost:5127/UserProfile/update-profile-by-email/${this.email}`,
      payload,
      { headers, responseType: 'text' }
    ).subscribe({
      next: () => {
        this.toastr.success(`${field} updated successfully`);
        this.editMode[field] = false;
      },
      error: (err) => {
        console.error(`Error updating ${field}:`, err);
        this.toastr.error(`Failed to update ${field}`);
      }
    });
  }

  goToChangePassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  uploadImage(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.uploadedImage = file;
      this.selectedAvatar = null;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImageUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  selectAvatar(avatarName: string): void {
    this.selectedAvatar = avatarName;
    this.uploadedImage = null;
    this.previewImageUrl = `${this.avatarBaseUrl}${avatarName}`;
  }

  submitProfileImage(): void {
    if (!this.email) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const formData = new FormData();
    formData.append('email', this.email);
    if (this.selectedAvatar) {
      formData.append('selectedAvatar', this.selectedAvatar);
    } else if (this.uploadedImage) {
      formData.append('uploadedImage', this.uploadedImage);
    }

    this.http.post<any>('http://localhost:5127/UserProfile/update-profile-image', formData, { headers })
      .subscribe({
        next: (res) => {
          this.toastr.success('Profile image updated');
          this.profile.ProfileImageUrl = res.imageUrl;
          this.previewImageUrl = null;
          this.selectedAvatar = null;
          this.uploadedImage = null;
        },
        error: (err) => {
          console.error('Error uploading image:', err);
          this.toastr.error('Failed to update profile image');
        }
      });
  }

  deleteAccount(): void {
    if (!confirm('Are you sure you want to delete your account? This action is reversible only by reactivation.')) return;

    const token = localStorage.getItem('token');
    if (!token || !this.email) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.delete(`http://localhost:5127/UserProfile/delete-account?email=${this.email}`, { headers, responseType: 'text' })
      .subscribe({
        next: () => {
          this.toastr.success('Account deleted successfully');
          localStorage.clear();
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error('Error deleting account:', err);
          this.toastr.error('Failed to delete account');
        }
      });
  }
}
