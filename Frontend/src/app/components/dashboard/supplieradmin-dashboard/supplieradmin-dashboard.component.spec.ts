import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplieradminDashboardComponent } from './supplieradmin-dashboard.component';

describe('SupplieradminDashboardComponent', () => {
  let component: SupplieradminDashboardComponent;
  let fixture: ComponentFixture<SupplieradminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplieradminDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SupplieradminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
