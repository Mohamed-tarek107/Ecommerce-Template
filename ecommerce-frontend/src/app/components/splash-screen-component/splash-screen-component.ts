import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  trigger, state, style, animate, transition, query, stagger
} from '@angular/animations';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen-component.html',
  styleUrl: './splash-screen-component.css',
  animations: [
    trigger('fadeOut', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('visible => hidden', animate('1000ms ease-out'))
    ]),
    trigger('lettersIn', [
      transition(':enter', [
        query('.letter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(80, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ]),
    trigger('quoteIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('800ms 900ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('dividerIn', [
      transition(':enter', [
        style({ width: '0%' }),
        animate('600ms 700ms ease-out', style({ width: '60px' }))
      ])
    ])
  ]
})
export class SplashScreenComponent implements OnInit {
  animState = 'visible';
  visible = true;
  letters = 'LUMINA'.split('');

  @Output() done = new EventEmitter<void>();

  ngOnInit() {
    setTimeout(() => {
      this.animState = 'hidden';
      setTimeout(() => {
        this.visible = false;
        this.done.emit();
      }, 1000);
    }, 3500);
  }
}