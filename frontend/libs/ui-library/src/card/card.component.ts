import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';

export type CardMode = 'card' | 'panel';

@Component({
  selector: 'lar-card',
  imports: [NgTemplateOutlet],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  readonly title = input.required<string | number>();
  readonly mode = input<CardMode>('card');
  readonly href = input<string>();
  readonly eyebrow = input<string>();
  readonly meta = input<string>();
  readonly tag = input<string>();
  readonly shadow = input(true);
  readonly wide = input(false);
  readonly cardClass = input('');

  protected rootClasses(): string {
    return [
      'health-card',
      this.shadow() ? 'health-card--shadow' : '',
      this.href() ? 'health-card--clickable' : '',
      this.mode() === 'panel' ? 'panel' : '',
      this.wide() ? 'panel--wide' : '',
      this.cardClass(),
    ]
      .filter(Boolean)
      .join(' ');
  }
}
