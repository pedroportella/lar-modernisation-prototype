import { Component, input, output } from '@angular/core';
import { FormControlOption } from '../form-control-option';
import { FieldsetComponent } from '../fieldset/fieldset.component';

@Component({
  selector: 'lar-checkbox-group',
  imports: [FieldsetComponent],
  templateUrl: './checkbox-group.component.html',
  styleUrl: './checkbox-group.component.scss',
})
export class CheckboxGroupComponent {
  readonly id = input<string>();
  readonly legend = input.required<string>();
  readonly name = input.required<string>();
  readonly options = input.required<FormControlOption[]>();
  readonly value = input<string[]>([]);
  readonly alert = input<string>();
  readonly error = input<string>();
  readonly hint = input<string>();
  readonly required = input(false);
  readonly disabled = input(false);
  readonly success = input<string>();
  readonly valueChange = output<string[]>();

  protected optionId(option: FormControlOption): string {
    return `${this.name()}-${option.value}`;
  }

  protected toggleValue(optionValue: string, checked: boolean): void {
    const next = new Set(this.value());
    if (checked) {
      next.add(optionValue);
    } else {
      next.delete(optionValue);
    }
    this.valueChange.emit([...next]);
  }
}
