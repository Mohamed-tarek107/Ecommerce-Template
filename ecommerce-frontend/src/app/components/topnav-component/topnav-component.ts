import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
    templateUrl: './topnav-component.html',
  styleUrl: './topnav-component.css',
})
export class NavbarComponent {
  @Output() toggleSidenav = new EventEmitter<void>();
}