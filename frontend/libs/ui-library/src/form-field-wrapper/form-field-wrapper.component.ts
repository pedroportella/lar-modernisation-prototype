import { Component, input } from '@angular/core';
import { LabelMandatoryComponent } from '../label-mandatory/label-mandatory.component';

@Component({
  selector: 'lar-form-field-wrapper',
  imports: [LabelMandatoryComponent],
  templateUrl: './form-field-wrapper.component.html',
  styleUrl: './form-field-wrapper.component.scss',
})
export class FormFieldWrapperComponent {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly alert = input<string>();
  readonly filled = input(false);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly description = input<string>();
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly success = input<string>();

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
