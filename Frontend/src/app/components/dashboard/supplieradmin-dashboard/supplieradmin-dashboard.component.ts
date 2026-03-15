import { Component } from '@angular/core';
import { IInventory, IStockAlert, ISupplier, ISupplierDrug } from '../../../interfaces/models';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService } from '../../../services/inventory.service';
import { SupplierService } from '../../../services/supplier.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProfileSidebarComponent } from '../../profile-sidebar/profile-sidebar.component';
import { Console } from 'console';

@Component({
  selector: 'app-supplieradmin-dashboard',
  imports: [CommonModule,FormsModule,ReactiveFormsModule,ProfileSidebarComponent],
  templateUrl: './supplieradmin-dashboard.component.html',
  styleUrls: ['./supplieradmin-dashboard.component.css']
})
export class SupplieradminDashboardComponent{
  currentView: 'inventory' | 'supplier' | 'supplierdrug' | 'stockalerts' = 'inventory';

  suppliers: ISupplier[] = [];
  stockalert:IStockAlert[]=[];
 // activeTab: string = 'inventory';
  inventory: IInventory[] = [];
  selectedSupplierName = '';
  selectedDrugName = '';
  supplierDrugs: ISupplierDrug[] = [];

  newSupplier: ISupplier = {
    supplierId: 0,
    name: '',
    contactInfo: '',
    email: '',
    address: ''
  };

  stockUpdate = 0;
  priceUpdate = 0;
  expiryUpdate = '';
  //alerts: IStockAlert[] =[];
  alerts: any[] = [];
  selectedDrugToUpdate: string | null = null;  
  email: string = localStorage.getItem('email') || '';

  constructor(
    private supplierService: SupplierService,
    private inventoryService: InventoryService,
    private toastr: ToastrService,
    public router: Router,
    private route: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    this.route.url.subscribe(urlSegments => {
      const lastSegment = urlSegments[urlSegments.length - 1].path;
      this.currentView = lastSegment as 'inventory' | 'supplier' | 'supplierdrug' | 'stockalerts';
      this.loadDataBasedOnView();
    });
}

  
  loadDataBasedOnView() {
    if (this.currentView === 'inventory') {
      this.getAllInventory();
    } else if (this.currentView === 'supplier') {
      this.getAllSuppliers();
    } else if (this.currentView === 'supplierdrug') {
      this.loadAllSuppliersDrugs();
    } else if (this.currentView === 'stockalerts') {
      this.getstockalert();
    }
  }
toggleUpdate(drugName: string): void {
  if (this.selectedDrugToUpdate === drugName) {
    this.selectedDrugToUpdate = null;
    this.selectedDrugName = ''; // Clear selected drug
  } else {
    this.selectedDrugToUpdate = drugName;
    this.selectedDrugName = drugName; // ✅ Set selected drug name for update
  }
}

  
  
  // ───────────────────── SUPPLIERS ────────────────────
  loadAllSuppliersDrugs(): void {
    this.supplierService.GetAllSuppliersWithDrugs().subscribe({
      next: data => {
        this.supplierDrugs = data;
        this.toastr.info('All suppliers loaded.');
      },
      error: err => this.toastr.error('Failed to load suppliers.')
    });
  }
  getAllSuppliers(): void {
    this.supplierService.getAllSuppliers().subscribe({
      next: data => {
        this.suppliers = data;
        this.toastr.info('All suppliers loaded.');
      },
      error: err => this.toastr.error('Failed to load suppliers.')
    });
  }
  getstockalert() {
    console.log("Fetching stock alerts...");
    this.supplierService.getstockalerts().subscribe({
      next: (data) => {
        this.alerts = data;
        this.toastr.success('Stock alerts loaded ✅');
        console.log("✅ Stock alerts data received:", this.alerts);
      },
      error: (err) => {
        console.error("❌ Error fetching stock alerts:", err);
        this.toastr.error('Failed to load stock alerts ❌');
      }
    });
  }
  
  markAsResolved(drugName: string): void {
    this.supplierService.updateStockAlert(drugName, true).subscribe({
      next: () => {
        this.toastr.success(`Marked ${drugName} as resolved ✅`);
        this.getstockalert();
      },
      error: (err) => {
        console.error('Error updating stock alert', err);
        this.toastr.error(`Failed to mark ${drugName} as resolved ❌`);
      }
    });
  }
  

  deleteAlert(drugName: string): void {
    this.supplierService.deleteStockAlert(drugName).subscribe({
      next: () => {
        this.toastr.success(`Deleted resolved alert for ${drugName} 🗑️`);
        this.getstockalert();
      },
      error: (err) => {
        console.error('Error deleting stock alert', err);
  
        if (err.status === 400 || err.status === 500) {
          this.toastr.warning(err.error.message || 'Cannot delete: alert is not resolved ⚠️');
        } else {
          this.toastr.error('Failed to delete stock alert ❌');
        }
      }
    });
  }
  
  getSupplierByName(): void {
    if (!this.selectedSupplierName) return;
    this.supplierService.getSupplierByName(this.selectedSupplierName).subscribe({
      next: supplier => {
        this.suppliers = [supplier];
        this.toastr.success(`Found supplier: ${supplier.name}`);
      },
      error: () => this.toastr.error('Supplier not found.')
    });
  }

  addSupplier(): void {
    this.supplierService.addSupplier(this.newSupplier).subscribe({
      next: () => {
        this.getAllSuppliers();
        this.toastr.success('Supplier added!');
        this.newSupplier = { supplierId: 0, name: '', contactInfo: '', email: '', address: '' };
      },
      error: () => this.toastr.error('Failed to add supplier.')
    });
  }

  updateSupplier(): void {
    if (!this.selectedSupplierName) return;
    this.supplierService.updateSupplier(this.selectedSupplierName, this.newSupplier).subscribe({
      next: () => {
        this.getAllSuppliers();
        this.toastr.success('Supplier updated!');
      },
      error: () => this.toastr.error('Update failed.')
    });
  }

  deleteSupplier(): void {
    if (!this.selectedSupplierName) return;
    const confirmed = confirm(`Are you sure you want to delete ${this.selectedSupplierName}?`);
    if (!confirmed) return;

    this.supplierService.deleteSupplier(this.selectedSupplierName).subscribe({
      next: () => {
        this.getAllSuppliers();
        this.toastr.warning('Supplier deleted!');
      },
      error: () => this.toastr.error('Delete failed.')
    });
  }

  // ───────────────────── DRUG ASSOCIATION ─────────────────────

  getSupplierDrugs(): void {
    if (!this.selectedSupplierName) return;
    this.supplierService.getSupplierDrugs(this.selectedSupplierName).subscribe({
      next: drugs => {
        this.supplierDrugs = drugs;
        this.toastr.info(`Loaded drugs for ${this.selectedSupplierName}`);
      },
      error: () => this.toastr.error('Failed to load supplier drugs.')
    });
  }
  confirmDelete(): void {
    const confirmDelete = confirm('Are you sure you want to delete this supplier?');
    if (confirmDelete) {
      this.deleteSupplier();
    }
  }
  
  addDrugToSupplier(): void {
    if (!this.selectedSupplierName || !this.selectedDrugName) return;
    this.supplierService.addDrugToSupplier(this.selectedSupplierName, this.selectedDrugName).subscribe({
      next: () => {
        this.getSupplierDrugs();
        this.toastr.success('Drug added to supplier!');
      },
      error: () => this.toastr.error('Failed to add drug.')
    });
  }

  removeDrugFromSupplier(): void {
    if (!this.selectedSupplierName || !this.selectedDrugName) return;
    const confirmed = confirm(`Remove ${this.selectedDrugName} from ${this.selectedSupplierName}?`);
    if (!confirmed) return;

    this.supplierService.removeDrugFromSupplier(this.selectedSupplierName, this.selectedDrugName).subscribe({
      next: (res) => {
        console.log('Delete success:', res);
        this.loadAllSuppliersDrugs();
        this.toastr.warning('Drug removed from supplier.');
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.toastr.error('Failed to remove drug.');
      }
    });
    
  }

  // ───────────────────── INVENTORY ─────────────────────

  getAllInventory(): void {
    this.inventoryService.getAllInventory().subscribe({
      next: data => {
        this.inventory = data;
        this.toastr.info('Inventory loaded.');
      },
      error: () => this.toastr.error('Failed to load inventory.')
    });
  }

  getInventoryByDrug(): void {
    if (!this.selectedDrugName) return;
    this.inventoryService.getInventoryByDrug(this.selectedDrugName).subscribe({
      next: data => {
        this.inventory = [data];
        this.toastr.success('Inventory for drug loaded.');
      },
      error: () => this.toastr.error('Drug inventory not found.')
    });
  }

  updateStock(): void {
  if (!this.selectedDrugName) return;
  console.log('📦 Updating stock for:', this.selectedDrugName, 'to:', this.stockUpdate);

  this.inventoryService.updateStock(this.selectedDrugName, this.stockUpdate).subscribe({
    next: () => {
      this.getAllInventory();
      this.toastr.success('Stock updated.');
    },
    error: () => this.toastr.error('Failed to update stock.')
  });
}


  updatePrice(): void {
    if (!this.selectedDrugName) return;
    this.inventoryService.updatePrice(this.selectedDrugName, this.priceUpdate).subscribe({
      next: () => {
        this.getAllInventory();
        this.toastr.success('Price updated.');
      },
      error: () => this.toastr.error('Failed to update price.')
    });
  }

  updateExpiry(): void {
    if (!this.selectedDrugName) return;
    this.inventoryService.updateExpiry(this.selectedDrugName, this.expiryUpdate).subscribe({
      next: () => {
        this.getAllInventory();
        this.toastr.success('Expiry updated.');
      },
      error: () => this.toastr.error('Failed to update expiry.')
    });
  }
}
