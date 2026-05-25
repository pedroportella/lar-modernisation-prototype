import { Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

@Component({
  selector: 'lar-button',
  template: `
    <button
      class="au-btn"
      [class.au-btn--secondary]="variant() === 'secondary'"
      [class.au-btn--tertiary]="variant() === 'tertiary'"
      [attr.type]="type()"
    >
      <ng-content></ng-content>
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
}
