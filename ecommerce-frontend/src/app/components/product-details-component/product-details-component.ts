import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FooterSectionComponent } from '../footer-section-component/footer-section-component';
import { MOCK_PRODUCTS } from '../home-page-component/home-page-Mockups';
import { Product } from '../product-card-component/product-card-component';

@Component({
  selector: 'app-product-details-component',
  imports: [CommonModule, FooterSectionComponent],
  templateUrl: './product-details-component.html',
  styleUrl: './product-details-component.css',
})
export class ProductDetailsComponent implements OnInit{
//---------------------------
  product: Product | undefined;
  selectedColor = '';
  selectedSize = '';
  quantity = 1;
  addedToCart = false;
  liked = false;
  activeTab = 'materials';
  sizes = ['XS', 'S', 'M', 'L', 'XL'];
  relatedProducts: Product[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.product = MOCK_PRODUCTS.find(p => p.id === id) ?? MOCK_PRODUCTS[0];
    this.selectedColor = this.product?.colors[0] ?? '';
    this.relatedProducts = MOCK_PRODUCTS.filter(p => p.id !== this.product?.id).slice(0, 4);
  }

  changeQty(delta: number) {
    this.quantity = Math.max(1, this.quantity + delta);
  }

  addToCart() {
    this.addedToCart = true;
    setTimeout(() => this.addedToCart = false, 1800);
  }

  toggleLike() {
    this.liked = !this.liked;
  }

  selectColor(color: string) {
    this.selectedColor = color;
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }
}



