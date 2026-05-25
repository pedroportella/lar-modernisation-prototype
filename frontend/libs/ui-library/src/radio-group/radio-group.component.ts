import { Component, input, output } from '@angular/core';
import { FormControlOption } from '../form-control-option';
import { FieldsetComponent } from '../fieldset/fieldset.component';

@Component({
  selector: 'lar-radio-group',
  imports: [FieldsetComponent],
  templateUrl: './radio-group.component.html',
  styleUrl: './radio-group.component.scss',
})
export class RadioGroupComponent {
  readonly id = input<string>();
  readonly legend = input.required<string>();
  readonly name = input.required<string>();
  readonly options = input.required<FormControlOption[]>();
  readonly value = input('');
  readonly alert = input<string>();
  readonly error = input<string>();
  readonly hint = input<string>();
  readonly required = input(false);
  readonly disabled = input(false);
  readonly success = input<string>();
  readonly valueChange = output<string>();

  protected optionId(option: FormControlOption): string {
    return `${this.name()}-${option.value}`;
  }
}
