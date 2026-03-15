import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { DarkModeToggleComponent } from './components/dark-mode-toggle/dark-mode-toggle.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports:[RouterOutlet,SidebarComponent,CommonModule,ChatbotComponent,DarkModeToggleComponent],
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public title = 'PharmacyManagementSystemAngular';
  showSidebar: boolean = false; // Default to false to prevent flash
  userRole: string | null | undefined;
  
  constructor(private router: Router, private themeService: ThemeService) {}

  ngOnInit() {
    // this.themeService.toggleTheme();
    this.userRole = localStorage.getItem('userRole');
  
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const cleanUrl = event.url.split('?')[0];

      this.showSidebar = !(event.url === '/' || event.url === '/login'|| event.url==='/register'||event.url==='/forgot-password'||event.url==='/reset-password'||event.url==='/payment-success'||event.url==='/fake-payment'||event.url==='/payment-details'||event.url=='/reactivate-account'||event.url=='/account-activated'||event.url=='/qr-login'||cleanUrl=='/mobile-login'||
cleanUrl.startsWith('/drug/')
);  
      console.log(`Navigated to: ${event.url}, Sidebar should be hidden: ${!this.showSidebar}`);
    });
  }  
  
}
