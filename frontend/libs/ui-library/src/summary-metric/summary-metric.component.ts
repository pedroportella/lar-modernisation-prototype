import { Component, input } from '@angular/core';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'lar-summary-metric',
  imports: [CardComponent],
  templateUrl: './summary-metric.component.html',
  styleUrl: './summary-metric.component.scss',
})
export class SummaryMetricComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
}
