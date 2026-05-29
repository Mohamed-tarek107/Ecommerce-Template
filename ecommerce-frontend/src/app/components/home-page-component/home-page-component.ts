import { Component } from '@angular/core';
import { FooterSectionComponent } from '../footer-section-component/footer-section-component';

@Component({
  selector: 'app-home-page-component',
  imports: [FooterSectionComponent],
  templateUrl: './home-page-component.html',
  styleUrl: './home-page-component.css',
})
export class HomePageComponent {}
