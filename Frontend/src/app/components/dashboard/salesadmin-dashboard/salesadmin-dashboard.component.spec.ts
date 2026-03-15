import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesadminDashboardComponent } from './salesadmin-dashboard.component';

describe('SalesadminDashboardComponent', () => {
  let component: SalesadminDashboardComponent;
  let fixture: ComponentFixture<SalesadminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesadminDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesadminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
