import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentadminDashboardComponent } from './paymentadmin-dashboard.component';

describe('PaymentadminDashboardComponent', () => {
  let component: PaymentadminDashboardComponent;
  let fixture: ComponentFixture<PaymentadminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentadminDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentadminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
