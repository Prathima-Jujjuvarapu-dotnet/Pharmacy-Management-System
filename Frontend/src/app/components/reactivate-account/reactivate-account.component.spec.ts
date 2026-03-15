import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveAccountComponent } from './reactivate-account.component';

describe('ReactiveAccountComponent', () => {
  let component: ReactiveAccountComponent;
  let fixture: ComponentFixture<ReactiveAccountComponent>;

  beforeEach(async () => {
  await TestBed.configureTestingModule({
        imports: [ReactiveAccountComponent]
      })
      .compileComponents();
  
      fixture = TestBed.createComponent(ReactiveAccountComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
