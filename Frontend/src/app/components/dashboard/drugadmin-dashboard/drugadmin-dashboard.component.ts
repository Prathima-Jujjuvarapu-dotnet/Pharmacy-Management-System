import { Component, OnInit } from '@angular/core';
import { IDrug } from '../../../interfaces/models';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DrugService } from '../../../services/drug.service';
import { CommonModule } from '@angular/common';
import { ProfileSidebarComponent } from '../../profile-sidebar/profile-sidebar.component';

@Component({
  selector: 'app-drugadmin-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProfileSidebarComponent, FormsModule],
  templateUrl: './drugadmin-dashboard.component.html',
  styleUrls: ['./drugadmin-dashboard.component.css']
})
export class DrugadminDashboardComponent implements OnInit {
  drugs: IDrug[] = [];
  drugForm!: FormGroup;
  isEditMode: boolean = false;
  selectedDrugName: string = '';
  email: string = localStorage.getItem('email') || '';
  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 6;
  defaultImage: string = 'assets/default-drug.png';

  constructor(private drugService: DrugService, private fb: FormBuilder) {}

  ngOnInit(): void {
    console.log('✅ DrugadminDashboardComponent initialized with email:', this.email);
    this.loadDrugs();
    this.initForm();
  }

  initForm() {
    this.drugForm = this.fb.group({
      name: ['', Validators.required],
      manufacturer: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      image: ['', Validators.required],
      rating: [0],
      reviewCount: [0],
      ingredients: [''],
      storage: [''],
      warnings: [''],
      quantityPerPack: [''],
      expiryDate: ['', Validators.required],
      prescriptionRequired: [false],
      category: [''],
      usage: ['']
    });
  }

  loadDrugs() {
    this.drugService.getAllDrugs().subscribe({
      next: (res) => this.drugs = res,
      error: () => alert('Error loading drugs')
    });
  }

  onSubmit() {
    const drugData: IDrug = this.drugForm.value;
    if (this.isEditMode) {
      this.drugService.updateDrug(this.selectedDrugName, drugData).subscribe({
        next: () => {
          this.loadDrugs();
          this.resetForm();
        },
        error: () => alert('Update Failed')
      });
    } else {
      this.drugService.addDrug(drugData).subscribe({
        next: () => {
          this.loadDrugs();
          this.resetForm();
        },
        error: () => alert('Add Failed')
      });
    }
  }

  onEdit(drug: IDrug) {
    this.isEditMode = true;
    this.selectedDrugName = drug.name;
    this.drugForm.patchValue(drug);
  }

  onDelete(name: string) {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      this.drugService.deleteDrug(name).subscribe({
        next: () => this.loadDrugs(),
        error: (err) => console.error('Delete error:', err)
      });
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.selectedDrugName = '';
    this.drugForm.reset();
  }

  get filteredDrugs(): IDrug[] {
    return this.drugs.filter(drug =>
      drug.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      drug.manufacturer.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDrugs.length / this.pageSize);
  }
}
