import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FakePaymentComponent } from './fake-payment.component';

describe('FakePaymentComponent', () => {
  let component: FakePaymentComponent;
  let fixture: ComponentFixture<FakePaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FakePaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FakePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
