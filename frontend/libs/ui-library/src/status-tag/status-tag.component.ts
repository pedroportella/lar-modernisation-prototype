import { Component, input } from '@angular/core';
import { formatStatus } from '@lar/utils';

@Component({
  selector: 'lar-status-tag',
  templateUrl: './status-tag.component.html',
  styleUrl: './status-tag.component.scss',
})
export class StatusTagComponent {
  readonly status = input.required<string>();

  protected label(): string {
    return formatStatus(this.status());
  }

  protected statusClass(): string {
    return this.status()
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  }
}
