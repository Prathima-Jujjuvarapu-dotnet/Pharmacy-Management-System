import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugDetailsComponent } from './drug-details.component';

describe('DrugDetailsComponent', () => {
  let component: DrugDetailsComponent;
  let fixture: ComponentFixture<DrugDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrugDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrugDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
