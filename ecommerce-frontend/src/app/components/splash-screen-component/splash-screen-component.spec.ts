import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplashScreenComponent } from './splash-screen-component';

describe('SplashScreenComponent', () => {
  let component: SplashScreenComponent;
  let fixture: ComponentFixture<SplashScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplashScreenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SplashScreenComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
