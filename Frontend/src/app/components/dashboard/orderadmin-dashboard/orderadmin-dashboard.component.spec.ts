import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderadminDashboardComponent } from './orderadmin-dashboard.component';

describe('OrderadminDashboardComponent', () => {
  let component: OrderadminDashboardComponent;
  let fixture: ComponentFixture<OrderadminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderadminDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderadminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
