import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  colors: string[];
  isLiked?: boolean;
}

@Component({
  selector: 'app-product-card-component',
  imports: [CommonModule],
  templateUrl: './product-card-component.html',
  styleUrl: './product-card-component.css',
})
export class ProductCardComponent {
  @Input() product!: Product;

  liked = false;
  addedToCart = false;

  constructor(private router: Router) {}

  toggleLike(event: Event) {
    event.stopPropagation();
    this.liked = !this.liked;
  }

  addToCart(event: Event) {
    event.stopPropagation();
    this.addedToCart = true;
    setTimeout(() => this.addedToCart = false, 1500);
  }

  goToDetail() {
    this.router.navigate(['/product', this.product.id]);
  }
}
