import { Component, input } from '@angular/core';
import { LabelMandatoryComponent } from '../label-mandatory/label-mandatory.component';

@Component({
  selector: 'lar-fieldset',
  imports: [LabelMandatoryComponent],
  templateUrl: './fieldset.component.html',
  styleUrl: './fieldset.component.scss',
})
export class FieldsetComponent {
  readonly id = input<string>();
  readonly legend = input.required<string>();
  readonly alert = input<string>();
  readonly filled = input(false);
  readonly hint = input<string>();
  readonly error = input<string>();
  readonly required = input(false);
  readonly success = input<string>();

  protected describedByIds(): string | null {
    const baseId = this.id();
    if (!baseId) {
      return null;
    }

    const ids = [
      this.error() ? `${baseId}-error` : '',
      this.success() ? `${baseId}-success` : '',
      this.alert() ? `${baseId}-alert` : '',
      this.hint() ? `${baseId}-hint` : '',
    ].filter(Boolean);

    return ids.length ? ids.join(' ') : null;
  }
}
