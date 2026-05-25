import { Component, input } from '@angular/core';
import { StatusTagComponent } from './status-tag.component';

@Component({
  selector: 'lar-status-pill',
  imports: [StatusTagComponent],
  template: `<lar-status-tag [status]="status()"></lar-status-tag>`,
})
export class StatusPillComponent {
  readonly status = input.required<string>();
}
