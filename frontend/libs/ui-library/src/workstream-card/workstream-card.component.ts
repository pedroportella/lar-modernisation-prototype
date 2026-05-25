import { Component, input } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { StatusTagComponent } from '../status-tag/status-tag.component';

@Component({
  selector: 'lar-workstream-card',
  imports: [CardComponent, StatusTagComponent],
  templateUrl: './workstream-card.component.html',
  styleUrl: './workstream-card.component.scss',
})
export class WorkstreamCardComponent {
  readonly priority = input.required<number | string>();
  readonly status = input.required<string>();
  readonly title = input.required<string>();
  readonly summary = input.required<string>();
}
