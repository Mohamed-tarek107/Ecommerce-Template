import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgetpassComponent } from './forgetpass.component';

describe('ForgetpassComponent', () => {
  let component: ForgetpassComponent;
  let fixture: ComponentFixture<ForgetpassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgetpassComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgetpassComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
