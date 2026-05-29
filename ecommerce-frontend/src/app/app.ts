import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplashScreenComponent } from './components/splash-screen-component/splash-screen-component';
import { SidenavComponent } from './components/sidenav-component/sidenav-component';
import { NavbarComponent } from './components/topnav-component/topnav-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SplashScreenComponent, NavbarComponent, SidenavComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  showSplash = true;
  sidenavOpen = false;
}
