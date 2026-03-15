import { Component } from '@angular/core';
import { IAdmin } from '../../../interfaces/models';
import { ToastrService } from 'ngx-toastr';
import { SuperService } from '../../../services/super.service';
import { CommonModule } from '@angular/common';
import { Route } from '@angular/router';
import { Router } from '@angular/router';
import { ProfileSidebarComponent } from '../../profile-sidebar/profile-sidebar.component';

@Component({
  selector: 'app-superadmin-dashboard',
  imports: [CommonModule,ProfileSidebarComponent],
  templateUrl: './superadmin-dashboard.component.html',
  styleUrl: './superadmin-dashboard.component.css'
})
export class SuperadminDashboardComponent {
  currentView: 'dashboard' | 'logs' | 'settings' | 'manageadmins' = 'dashboard';
  allAdmins: IAdmin[] = [];
  roles: string[] = ['DrugAdmin', 'OrderAdmin', 'SupplierAdmin', 'PaymentAdmin'];
  loading = false;
  email: string = localStorage.getItem('email') || '';
  constructor(private superService: SuperService, private toastr: ToastrService,private router:Router) {}
  currentSection: string = 'dashboard'; // default section

setSection(section: string): void {
  this.currentSection = section;
}
ngOnInit(): void {
  this.router.events.subscribe(() => {
    const path = this.router.url.split('/').pop()?.toLowerCase();
    if (path === 'manageadmins') {
      this.currentView = 'manageadmins';
      this.fetchAdmins(); // ✅ only fetch here
    } else if (path === 'logs') {
      this.currentView = 'logs';
    } else if (path === 'settings') {
      this.currentView = 'settings';
    } else {
      this.currentView = 'dashboard'; // generic dashboard
    }
  });

  // On initial load (e.g., browser refresh)
  const initialPath = this.router.url.split('/').pop();
  if (initialPath === 'manageadmins') {
    this.currentView = 'manageadmins';
    this.fetchAdmins();
  } else if (initialPath === 'logs') {
    this.currentView = 'logs';
  } else if (initialPath === 'settings') {
    this.currentView = 'settings';
  } else {
    this.currentView = 'dashboard';
  }
}



  fetchAdmins(): void {
    this.loading = true;
    this.superService.getAllAdmins().subscribe({
      next: (res) => {
        this.allAdmins = res;
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error(err.error || 'Failed to load admins');
        this.loading = false;
      }
    });
  }

  onRoleChange(admin: IAdmin, newRole: string): void {
    if (admin.adminRole === newRole) return;
  
    this.superService.changeAdminRole(admin.adminId, newRole).subscribe({
      next: (updatedAdmin) => {
        admin.adminRole = updatedAdmin.adminRole;
        this.toastr.success(`Role updated to ${newRole} for ${admin.adminName}`);
      },
      error: (err) => {
        const message = err.error?.error || 'Failed to change role';  // 👈 this line matters
        if (message === "Cannot update SuperAdmin role.") {
          this.toastr.warning("SuperAdmin role cannot be changed!");
        } else {
          this.toastr.error(message);
        }
      }
           
    });
  }  
  deleteAdmin(adminId: number): void {
    if (confirm('Are you sure you want to delete this admin?')) {
      this.superService.deleteAdmin(adminId).subscribe({
        next: () => {
          this.toastr.success('Admin deleted');
          this.fetchAdmins();
        },
        error: (err) => {
          const message = err.error?.error || 'Error deleting admin';  // 👈 this handles backend error
          if (message === "Cannot Delete SuperAdmin role.") {
            this.toastr.warning("SuperAdmin cannot be deleted!");
          } else {
            this.toastr.error(message);
          }
        }        
      });
    }

  }
  
}
