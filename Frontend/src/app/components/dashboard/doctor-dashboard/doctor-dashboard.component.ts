import { Component, OnInit } from '@angular/core';
import { DrugService } from '../../../services/drug.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { IDrug, IOrderItem } from '../../../interfaces/models';
import { OrderService } from '../../../services/order.service';
//import { SidebarComponent } from '../../sidebar/sidebar.component';
//import { SidebarComponent } from '../../side-bar/side-bar.component';
//import { HomeComponent } from '../../home/home.component';
//import { SidebarComponent } from '../../side-bar/side-bar.component';

@Component({
  selector: 'app-doctor-dashboard',
  imports: [CommonModule, FormsModule,RouterOutlet],
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {
  drugs: any[] = [];
  searchQuery: string = '';
  cart: any[] = [];
  drugList: any[] =[];
  myOrders: IOrderItem[] | undefined;

  constructor(private drugService: DrugService,private orderService:OrderService) {}

  ngOnInit(): void {
    this.getAllDrugs();
  }

  getAllDrugs(): void {
    this.drugService.getAllDrugs().subscribe((data) => {
      this.drugs = data;
    });
  }

  searchDrugs(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const searchTerm = inputElement.value.toLowerCase().trim();
  
    if (searchTerm) {
      this.drugList = this.drugs.filter(drug => 
        drug.name.toLowerCase().includes(searchTerm) || 
        drug.manufacturer.toLowerCase().includes(searchTerm)
      );
    } else {
      this.drugList = [...this.drugs]; // Reset to full list when search is cleared
    }
  }
  

  
}