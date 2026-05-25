import { Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

@Component({
  selector: 'lar-button',
  templateUrl: './button.component.html',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
}
