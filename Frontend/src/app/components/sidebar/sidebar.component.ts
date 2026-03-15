import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // ✅ Import Router
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [CommonModule, RouterModule] // ✅ Add RouterModule
})
export class SidebarComponent {
  menuItems: any[] = [];
  userRole: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userRole = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
      this.loadMenu();
    }
  }

  loadMenu() {
    if (this.userRole === 'Doctor') {
      this.menuItems = [
        { label: 'Home', route: '/home', icon: '🏠' },
        { label: 'Cart', route: '/cart', icon: '🛒' },
        { label: 'Orders', route: '/orders', icon: '📦' },
        { label: 'Payments', route: '/payments', icon: '💳' }
      ];
    } else if (this.userRole === 'DrugAdmin') {
      this.menuItems = [
      //  { label: 'Manage Drugs', route: '/h', icon: '🏥' },
        { label: 'Drug Dashboard', route: '/drugadmin-dashboard', icon: '💊' },
        
      ];
    }
    else if (this.userRole === 'OrderAdmin') {
      this.menuItems = [
        { label: 'Order Update', route: '/orderadmin-dashboard/update', icon: '📝' },
        { label: 'Delivery Update', route: '/orderadmin-dashboard/delivery', icon: '🚚' }
      ];
    }
    else if(this.userRole==='SupplierAdmin'){
      this.menuItems=[
        {label:'Inventory List',route:'/supplieradmin-dashboard/inventory',icon:'📦'},
        {label:'Supplier List',route:'/supplieradmin-dashboard/supplier',icon:'🏢'},
        {label:'Supplier-Drug List',route:'/supplieradmin-dashboard/supplierdrug',icon:'💊'},
        {label:'Stock Alerts',route:'/supplieradmin-dashboard/stockalerts',icon:'⚠️'},
      ]
    }
    else if(this.userRole==='PaymentAdmin'){
      this.menuItems=[
        {label:'All Payments',route:'/paymentadmin-dashboard/allpayments',icon:'💳'},
        {label:'Unverified Payments',route:'/paymentadmin-dashboard/unverifiedpayments',icon:'❗'},
      ]
    }
    else if (this.userRole === 'SuperAdmin') {
      this.menuItems = [
        { label: 'Dashboard', route: '/superadmin-dashboard/dashboard', icon: '📊' },
        { label: 'Manage Admins', route: '/superadmin-dashboard/manageadmins', icon: '🛠️' }, // Same as dashboard, just clearer label
        { label: 'System Logs', route: '/superadmin-dashboard/logs', icon: '📋' },
        { label: 'Settings', route: '/superadmin-dashboard/settings', icon: '⚙️' }
      ];
    }
    else if(this.userRole==='SalesAdmin'){
      this.menuItems=[
        {label:'Sales Dashboard',route:'/salesadmin-dashboard/dashboard',icon:'📈'},
        {label:'Doctor Sales',route:'/salesadmin-dashboard/doctorsales',icon:'👨‍⚕️'},
        {label:'Drug Sales',route:'/salesadmin-dashboard/drugsales',icon:'💊'},
        {label:'High Demand Drugs',route:'/salesadmin-dashboard/highdemanddrugs',icon:'📈'},
        
      ]
    }
    
    
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
