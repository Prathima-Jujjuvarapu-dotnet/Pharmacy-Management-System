// drug-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DrugService } from '../../services/drug.service';
import { IDrug, IOrderItem, Review } from '../../interfaces/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
// import { ReviewService } from '../../services/review.service';
// import { Review } from '../../interfaces/review.model';

@Component({
  selector: 'app-drug-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './drug-details.component.html',
  styleUrls: ['./drug-details.component.css']
})
export class DrugDetailsComponent implements OnInit {
  drugId!: number;
  email: string = '';
  drug!: IDrug;
  activeTab: string = 'description';
  relatedDrugs: IDrug[] = [];

  reviews: Review[] = [];
  newReview: Review = {
    userEmail: '',
    drugName: '',
    comment: '',
    rating: 0
  };

  constructor(
    private route: ActivatedRoute,
    private drugService: DrugService,
    private router: Router,
    private authService: AuthService,
    // private reviewService: ReviewService
  ) {}

  ngOnInit(): void {
    this.email = localStorage.getItem('doctorEmail') || '';
    this.route.paramMap.subscribe(params => {
      this.drugId = Number(params.get('id'));
      this.loadDrugDetails();
    });
  }

  loadDrugDetails() {
    this.drugService.getDrugById(this.drugId).subscribe((data: IDrug) => {
      this.drug = data;
      this.newReview.drugName = data.name;
      this.newReview.userEmail = this.email;
      this.loadRelatedDrugs();
      this.loadReviews();
    });
  }

  loadRelatedDrugs() {
    this.drugService.getAllDrugs().subscribe((drugs: IDrug[]) => {
      this.relatedDrugs = drugs.filter(d => d.drugId !== this.drug?.drugId).slice(0, 5);
    });
  }

  loadReviews() {
    this.drugService.getReviewsByDrug(this.drug.name).subscribe(data => {
      this.reviews = data;
    });
  }

  submitReview() {
    this.drugService.addReview(this.newReview).subscribe(() => {
      this.newReview.comment = '';
      this.newReview.rating = 0;
      this.loadReviews();
    });
  }

  addToCart(drug: IDrug) {
    let cart: IOrderItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    let existingDrug = cart.find(item => item.drugName === drug.name);

    if (existingDrug) {
      existingDrug.quantity += 1;
    } else {
      cart.push({
        drugName: drug.name,
        quantity: 1,
        price: drug.price,
        OrderItemId: Date.now() + Math.floor(Math.random() * 1000)
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`${drug.name} added to cart!`);
  }

  notifyMe(drug: IDrug) {
    const request = { email: this.email, drugName: drug.name };
    this.authService.notifyMe(request).subscribe({
      next: res => alert(res.message),
      error: err => alert('Already subscribed or error occurred.')
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToDrugDetails(drug: IDrug) {
    this.router.navigate(['/drug', drug.drugId]);
  }
  getMaskedEmail(email: string): string {
  const [name, domain] = email.split('@');
  const visible = name.slice(0, 4);
  return `${visible}xxx@${domain}`;
}

}
