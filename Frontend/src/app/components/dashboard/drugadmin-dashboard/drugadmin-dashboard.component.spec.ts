import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugadminDashboardComponent } from './drugadmin-dashboard.component';

describe('DrugadminDashboardComponent', () => {
  let component: DrugadminDashboardComponent;
  let fixture: ComponentFixture<DrugadminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrugadminDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrugadminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
