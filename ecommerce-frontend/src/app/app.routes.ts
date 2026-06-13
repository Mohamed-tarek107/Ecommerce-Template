import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page-component/home-page-component';
import { ProductDetailsComponent } from './components/product-details-component/product-details-component';

export const routes: Routes = [
    { path: '', redirectTo: 'homepage', pathMatch: 'full'},

    { path: 'homepage', component: HomePageComponent },
    { path: 'product/:id', component: ProductDetailsComponent }
];
