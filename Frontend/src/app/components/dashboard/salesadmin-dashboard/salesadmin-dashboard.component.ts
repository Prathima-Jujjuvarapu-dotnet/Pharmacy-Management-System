import { Component } from '@angular/core';
import { SalesService } from '../../../services/sales.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProfileSidebarComponent } from '../../profile-sidebar/profile-sidebar.component';

@Component({
  selector: 'app-salesadmin-dashboard',
  imports: [CommonModule,FormsModule,ProfileSidebarComponent],
  templateUrl: './salesadmin-dashboard.component.html',
  styleUrl: './salesadmin-dashboard.component.css'
})
export class SalesadminDashboardComponent {
  currentView: 'dashboard' | 'doctorsales' | 'drugsales' | 'highdemanddrugs' = 'dashboard';
  currentRoute: string = '';
  allSales: any[] = [];
  highDemandDrugs: string[] = [];

  selectedDoctorEmail: string = '';
  doctorSales: any[] = [];

  selectedDrugName: string = '';
  drugSales: any[] = [];
  email: string = localStorage.getItem('email') || '';
  constructor(private salesService: SalesService,  public router: Router,
    public route: ActivatedRoute, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.route.url.subscribe(() => {
      const path = this.router.url.split('/').pop();
      this.currentRoute = path || '';
      if (path === 'doctorsales') this.currentView = 'doctorsales';
      else if (path === 'drugsales') this.currentView = 'drugsales';
      else if (path === 'highdemanddrugs') this.currentView = 'highdemanddrugs';
      else this.currentView = 'dashboard';
    });

    this.getAllSales();
    this.getHighDemandDrugs();
  }
  downloadAllSales(): void {
    if (!this.allSales || this.allSales.length === 0) {
      alert('No sales data to download!');
      return;
    }
  
    const csvRows = [];
  
    // Header
    const headers = ['Drug Name', 'Quantity', 'Price', 'Total', 'Date', 'Doctor Name'];
    csvRows.push(headers.join(','));
  
    // Data Rows
    for (const sale of this.allSales) {
      const row = [
        sale.drugName,
        sale.quantity,
        sale.price,
        sale.total,
        new Date(sale.saleDate).toLocaleString(),
        sale.doctor?.name || 'N/A'
      ];
      csvRows.push(row.join(','));
    }
  
    // Convert to CSV string
    const csvString = csvRows.join('\n');
  
    // Create a blob and download
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'all-sales.csv');
    a.click();
    window.URL.revokeObjectURL(url);
  }
  downloadSalesPDF(): void {
    if (!this.allSales || this.allSales.length === 0) {
      alert('No sales data to download!');
      return;
    }
  
    const doc = new jsPDF();
  
    // Title
    doc.setFontSize(18);
    doc.text('All Sales Report', 14, 22);
  
    // Table data
    const headers = [['Drug Name', 'Quantity', 'Price', 'Total', 'Date', 'Doctor']];
    const data = this.allSales.map(sale => [
      sale.drugName,
      sale.quantity,
      `₹${sale.price}`,
      `₹${sale.total}`,
      new Date(sale.saleDate).toLocaleString(),
      sale.doctor?.name || 'N/A'
    ]);
  
    autoTable(doc, {
      startY: 30,
      head: headers,
      body: data,
      theme: 'striped'
    });
  
    doc.save('all-sales.pdf');
  }
  
  getAllSales(): void {
    this.salesService.getAllSales().subscribe({
      next: data => {
        this.allSales = data;
        this.toastr.success('All sales loaded.');
      },
      error: () => this.toastr.error('Failed to load sales.')
    });
  }
  
  getDoctorSales(): void {
    if (!this.selectedDoctorEmail) return;
    this.salesService.getDoctorSales(this.selectedDoctorEmail).subscribe({
      next: data => {
        this.doctorSales = data;
        this.toastr.success('Doctor sales loaded.');
      },
      error: () => this.toastr.error('Failed to load doctor sales.')
    });
  }
  
  getDrugSales(): void {
    if (!this.selectedDrugName) return;
    this.salesService.getSalesByDrug(this.selectedDrugName).subscribe({
      next: data => {
        this.drugSales = data;
        this.toastr.success('Drug sales loaded.');
      },
      error: () => this.toastr.error('Failed to load drug sales.')
    });
  }
  
  getHighDemandDrugs(): void {
    this.salesService.getHighDemandDrugs().subscribe({
      next: data => {
        this.highDemandDrugs = data;
        this.toastr.success('High demand drugs loaded.');
      },
      error: () => this.toastr.error('Failed to load data.')
    });
  }
  
}
