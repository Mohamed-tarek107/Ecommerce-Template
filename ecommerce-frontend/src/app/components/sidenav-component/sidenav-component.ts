import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger, state, style, animate, transition
} from '@angular/animations';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidenav-component.html',
  styleUrl: './sidenav-component.css',
  animations: [
    trigger('slideIn', [
      state('closed', style({ transform: 'translateX(-100%)' })),
      state('open',   style({ transform: 'translateX(0)' })),
      transition('closed => open', animate('400ms cubic-bezier(0.16, 1, 0.3, 1)')),
      transition('open => closed', animate('300ms ease-in'))
    ])
  ]
})
export class SidenavComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
}