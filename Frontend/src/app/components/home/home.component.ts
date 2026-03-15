import { Component, OnInit } from '@angular/core';
import { DrugService } from '../../services/drug.service';
import { CommonModule } from '@angular/common';
 import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { IDrug, IOrderItem } from '../../interfaces/models';
// Define DrugWithStock type if not already defined or import it from the correct location
type DrugWithStock = IDrug & { isOutOfStock?: boolean };
import { ProfileSidebarComponent } from '../profile-sidebar/profile-sidebar.component';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { Route } from '@angular/router';
// import { Router } from 'express';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule,ProfileSidebarComponent],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  drugs: DrugWithStock[] = [];
drugList: DrugWithStock[] = [];
allDrugs: DrugWithStock[] = [];

notifications: any[] = [];
  unreadCount: number = 0;
  showDropdown: boolean = false;
  userId: any;


  constructor(private drugService: DrugService,private authservice:AuthService,private router:Router) {}
  email: string = localStorage.getItem('doctorEmail') || '';
  ngOnInit() {
    this.userId = Number(localStorage.getItem('doctorId')); // ✅ Fix here
    this.loadNotifications();
    this.getDrugs(); // Load all drugs when HomeComponent is initialized
  }
  
 
getDrugs() {
  this.drugService.getAllDrugs().subscribe((drugs: IDrug[]) => {
    this.allDrugs = drugs.map(d => ({ ...d }));
    this.drugList = [...this.allDrugs];
    this.drugService.availabledrugs().subscribe((available) => {
  const availableMap = new Map(
    available
      .filter(d => d.drugName) // ✅ lowercase 'd'
      .map(d => [d.drugName.trim().toLowerCase(), !d.isOutOfStock]) // ✅ lowercase keys
  );
    this.drugList.forEach(drug => {
    const key = drug.name?.trim().toLowerCase();
    const isAvailable = availableMap.get(key);
    drug.isOutOfStock = isAvailable === false;
  });
});

  });
}


  
  searchDrugs(event: any) {
    const query = event.target.value.trim().toLowerCase();
    console.log("Search Query:", query); // ✅ Debugging
  
    if (query === '') {
      this.drugList = [...this.allDrugs]; // ✅ Reset
      return;
    }
  
    this.drugList = this.allDrugs.filter(drug =>
      drug.name.toLowerCase().includes(query)
    );
    console.log("Filtered Drugs:", this.drugList); // ✅ Debugging
  }    
  addToCart(drug: IDrug) {
    let cart: IOrderItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    let existingDrug = cart.find(item => item.drugName === drug.name);

    if (existingDrug) {
      existingDrug.quantity += 1;
    } else {
      cart.push({
        drugName: drug.name, quantity: 1, price: drug.price,
        OrderItemId: this.generateUniqueId(),
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${drug.name} added to cart!`);
  }
  generateUniqueId(): number {
    return Date.now() + Math.floor(Math.random() * 1000); // ✅ Unique numeric ID
}

notifyMe(drug: DrugWithStock) {
  const request = {
    email:this.email,
    drugName: drug.name
  };

  this.authservice.notifyMe(request).subscribe({
    next: (res) => alert(res.message),
    error: (err) => {
      console.error('Notify Me Error:', err); // ✅ This will show status, message, etc.
      alert('Already subscribed or error occurred.');
    }
  });
}

  toggleNotifications() {
    this.showDropdown = !this.showDropdown;
     console.log("bell has inisiated");
  }

  loadNotifications() {
    this.authservice.getNotifications(this.email).subscribe((data: any[]) => {
      this.notifications = data;
      this.unreadCount = data.filter(n => !n.isRead).length;
    });
  }

  markAsRead(id: number) {
    this.authservice.markAsRead(id).subscribe(() => this.loadNotifications());
  }
  
goToDrugDetails(drug: DrugWithStock) {
  this.router.navigate(['/drug', drug.drugId]);
}

}




