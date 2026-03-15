import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from '../components/auth/login/login.component';
import { RegisterComponent } from '../components/auth/register/register.component';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landingpage',
  imports: [CommonModule,FormsModule],
  templateUrl: './landingpage.component.html',
  styleUrls: ['./landingpage.component.css'],
})
export class LandingpageComponent {
  showLogin = true;
  constructor(private router: Router) {}
  ngOnInit(): void {
    document.body.style.overflowX = 'hidden';
  }
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
  
  toggleAuth() {
    this.showLogin = !this.showLogin;
  }
}
