import { Component, input } from '@angular/core';

@Component({
  selector: 'lar-label-mandatory',
  templateUrl: './label-mandatory.component.html',
  styleUrl: './label-mandatory.component.scss',
})
export class LabelMandatoryComponent {
  readonly required = input(false);
}
