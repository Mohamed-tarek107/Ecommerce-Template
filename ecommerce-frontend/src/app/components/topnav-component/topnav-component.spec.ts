import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopnavComponent } from './topnav-component';

describe('TopnavComponent', () => {
  let component: TopnavComponent;
  let fixture: ComponentFixture<TopnavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopnavComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TopnavComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
