import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/components/auth/login/login.component';
import { RegisterComponent } from './app/components/auth/register/register.component';
import { HomeComponent } from './app/components/home/home.component';
import { CartComponent } from './app/components/cart/cart.component';
import { OrdersComponent } from './app/components/orders/orders/orders.component';
import { PaymentsComponent } from './app/components/payments/payments/payments.component';
import { LandingpageComponent } from './app/landingpage/landingpage.component';
// Dashboards
import { DoctorDashboardComponent } from './app/components/dashboard/doctor-dashboard/doctor-dashboard.component';
import { SuperadminDashboardComponent } from './app/components/dashboard/superadmin-dashboard/superadmin-dashboard.component';
import { DrugadminDashboardComponent } from './app/components/dashboard/drugadmin-dashboard/drugadmin-dashboard.component';
import { OrderadminDashboardComponent } from './app/components/dashboard/orderadmin-dashboard/orderadmin-dashboard.component';
import { PaymentadminDashboardComponent } from './app/components/dashboard/paymentadmin-dashboard/paymentadmin-dashboard.component';
import { SalesadminDashboardComponent } from './app/components/dashboard/salesadmin-dashboard/salesadmin-dashboard.component';
import { SupplieradminDashboardComponent } from './app/components/dashboard/supplieradmin-dashboard/supplieradmin-dashboard.component';
import { PaymentDetailsComponent } from './app/components/payment-details/payment-details.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { ForgotPasswordComponent } from './app/components/auth/forgot-password/forgot-password.component';
import { ProfileSidebarComponent } from './app/components/profile-sidebar/profile-sidebar.component';
import { PaymentSuccessComponent } from './app/components/payment-success/payment-success.component';
import { FakePaymentComponent } from './app/components/fake-payment/fake-payment.component';
import { ReactiveAccountComponent } from './app/components/reactivate-account/reactivate-account.component';
import { DarkModeToggleComponent } from './app/components/dark-mode-toggle/dark-mode-toggle.component';
import { QrLoginComponent } from './app/components/auth/qr-login/qr-login.component';
import { MobileLoginComponent } from './app/components/auth/mobile-login/mobile-login.component';
import { DrugDetailsComponent } from './app/components/drug-details/drug-details.component';

// Define routes
const routes: Routes = [
  { path: '', redirectTo: 'landingpage', pathMatch: 'full' },
  {path:'',component:LandingpageComponent},
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'payment-details/:paymentId', component: PaymentDetailsComponent }, // ✅ FIXED

  // Main pages
  { path: 'home', component: HomeComponent },
  { path: 'cart', component: CartComponent },
  { path: 'orders', component: OrdersComponent },
  { path: 'payments', component: PaymentsComponent },
  { path: 'payment-success', component: PaymentSuccessComponent },
  {path:'fake-payment',component:FakePaymentComponent},
  { path: 'drug/:id', component: DrugDetailsComponent },

  // Dashboards - Keep them under `/dashboard/` to avoid clutter
  { path: 'doctor-dashboard', component: DoctorDashboardComponent },
  {path:'qr-login',component: QrLoginComponent},
  {path:'mobile-login',component:MobileLoginComponent},
  {path:'reactivate-account',component:ReactiveAccountComponent},
  { path: 'superadmin-dashboard/dashboard', component: SuperadminDashboardComponent },
  { path: 'superadmin-dashboard/manageadmins', component: SuperadminDashboardComponent },
  { path: 'superadmin-dashboard/logs', component: SuperadminDashboardComponent },
  { path: 'superadmin-dashboard/settings', component: SuperadminDashboardComponent },
  { path: 'drugadmin-dashboard', component: DrugadminDashboardComponent },
  { path: 'orderadmin-dashboard/update', component: OrderadminDashboardComponent },
  { path: 'orderadmin-dashboard/delivery', component: OrderadminDashboardComponent },  
  { path: 'paymentadmin-dashboard/allpayments', component: PaymentadminDashboardComponent },
  { path: 'paymentadmin-dashboard/unverifiedpayments', component: PaymentadminDashboardComponent },
  { path: 'salesadmin-dashboard/dashboard', component: SalesadminDashboardComponent },
  { path: 'supplieradmin-dashboard/inventory', component: SupplieradminDashboardComponent },
  {path:'supplieradmin-dashboard/supplier',component:SupplieradminDashboardComponent},
  {path:'supplieradmin-dashboard/stockalerts',component:SupplieradminDashboardComponent},
  {path:'supplieradmin-dashboard/supplierdrug',component:SupplieradminDashboardComponent},
  {path:'salesadmin-dashboard/doctorsales',component:SalesadminDashboardComponent},
  {path:'salesadmin-dashboard/drugsales',component:SalesadminDashboardComponent},
  {path:'salesadmin-dashboard/highdemanddrugs',component:SalesadminDashboardComponent},
  {path:'forgot-password',component:ForgotPasswordComponent},
  {path:'profile-sidebar',component:ProfileSidebarComponent},
  // Wildcard (404) - Redirect all unknown routes to login
  { path: '**', redirectTo: 'landingpage', pathMatch: 'full' }
];

// ✅ Bootstrapping AppComponent
bootstrapApplication(AppComponent, {
 
providers: [
  provideRouter(routes, withHashLocation()),
  provideHttpClient(),
  provideAnimations(),
  provideToastr()
]

}).catch(err => console.error(err));
