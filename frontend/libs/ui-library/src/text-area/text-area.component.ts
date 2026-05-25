import { Component, input, output } from '@angular/core';
import { FormFieldWrapperComponent } from '../form-field-wrapper/form-field-wrapper.component';

@Component({
  selector: 'lar-text-area',
  imports: [FormFieldWrapperComponent],
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.scss',
})
export class TextAreaComponent {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input('');
  readonly rows = input(4);
  readonly alert = input<string>();
  readonly description = input<string>();
  readonly filled = input(false);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly success = input<string>();
  readonly width = input<'sm' | 'md' | 'lg' | 'full' | string>('full');
  readonly valueChange = output<string>();

  protected describedByIds(): string | null {
    const ids = [
      this.error() ? `${this.id()}-error` : '',
      this.success() ? `${this.id()}-success` : '',
      this.alert() ? `${this.id()}-alert` : '',
      this.description() || this.hint() ? `${this.id()}-hint` : '',
    ].filter(Boolean);

    return ids.length ? ids.join(' ') : null;
  }
}
