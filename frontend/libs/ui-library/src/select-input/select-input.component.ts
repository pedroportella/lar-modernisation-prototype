import { Component, input, output } from '@angular/core';
import { FormControlOption } from '../form-control-option';
import { FormFieldWrapperComponent } from '../form-field-wrapper/form-field-wrapper.component';

@Component({
  selector: 'lar-select-input',
  imports: [FormFieldWrapperComponent],
  templateUrl: './select-input.component.html',
  styleUrl: './select-input.component.scss',
})
export class SelectInputComponent {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly options = input.required<FormControlOption[]>();
  readonly value = input('');
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
