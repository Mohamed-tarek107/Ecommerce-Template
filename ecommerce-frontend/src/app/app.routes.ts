import { Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page-component/home-page-component';

export const routes: Routes = [
    { path: '', redirectTo: 'homepage', pathMatch: 'full'},

    { path: 'homepage', component: HomePageComponent }
];
