import { Component, input } from '@angular/core';
import { StatusTagComponent } from '../status-tag/status-tag.component';

@Component({
  selector: 'lar-status-pill',
  imports: [StatusTagComponent],
  templateUrl: './status-pill.component.html',
})
export class StatusPillComponent {
  readonly status = input.required<string>();
}
