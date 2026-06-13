import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterSectionComponent } from '../footer-section-component/footer-section-component';
import { MOCK_PRODUCTS } from '../home-page-component/home-page-Mockups';
import { ProductCardComponent } from '../product-card-component/product-card-component';
import { ChatbotComponent } from '../chatbot.component/chatbot.component';

@Component({
  selector: 'app-home-page-component',
  imports: [CommonModule, FooterSectionComponent, ProductCardComponent, ChatbotComponent],
  templateUrl: './home-page-component.html',
  styleUrl: './home-page-component.css',
})
export class HomePageComponent {
  newArrivals = MOCK_PRODUCTS.filter(p => p.category === 'New Arrivals');
  summerCollection = MOCK_PRODUCTS.filter(p => p.category === 'Summer Collection');
  bestSellers = MOCK_PRODUCTS.filter(p => p.category === 'Best Sellers');

  activeFilter = 'All';

  setFilter(filter: string) {
    this.activeFilter = filter;
  }
}
