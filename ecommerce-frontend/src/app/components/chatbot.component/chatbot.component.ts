import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  trigger, state, style, animate, transition
} from '@angular/animations';

interface Message {
  text: string;
  fromUser: boolean;
  loading?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css',
  animations: [
    trigger('slideUp', [
      state('void', style({ opacity: 0, transform: 'translateY(16px)' })),
      state('*',    style({ opacity: 1, transform: 'translateY(0)' })),
      transition(':enter', animate('260ms ease-out')),
      transition(':leave', animate('180ms ease-in'))
    ])
  ]
})
export class ChatbotComponent {
  isOpen = false;
  inputText = '';
  messages: Message[] = [
    { text: 'Hi! I\'m your Lumina style assistant. How can I help you today?', fromUser: false }
  ];

  toggle() {
    this.isOpen = !this.isOpen;
  }

  send() {
    const text = this.inputText.trim();
    if (!text) return;

    this.messages.push({ text, fromUser: true });
    this.inputText = '';

    // Loading bubble
    const loadingMsg: Message = { text: '', fromUser: false, loading: true };
    this.messages.push(loadingMsg);

    // Simulate loading only — no real response
    setTimeout(() => {
      const idx = this.messages.indexOf(loadingMsg);
      if (idx !== -1) this.messages.splice(idx, 1);
    }, 99999); // stays loading indefinitely as per requirement
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }
}