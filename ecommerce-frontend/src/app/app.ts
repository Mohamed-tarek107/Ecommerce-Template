import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplashScreenComponent } from './components/splash-screen-component/splash-screen-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, SplashScreenComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  showSplash = true;
}
