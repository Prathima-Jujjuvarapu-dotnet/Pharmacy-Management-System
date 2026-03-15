import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileLoginComponent } from './mobile-login.component';

describe('MobileLoginComponent', () => {
  let component: MobileLoginComponent;
  let fixture: ComponentFixture<MobileLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MobileLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
