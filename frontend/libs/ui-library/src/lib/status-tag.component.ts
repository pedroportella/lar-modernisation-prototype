import { Component, input } from '@angular/core';
import { formatStatus } from '@lar/utils';

@Component({
  selector: 'lar-status-tag',
  template: `<span class="tag" [class]="statusClass()">{{ label() }}</span>`,
  styles: [
    `
      .tag {
        display: inline-flex;
        min-height: 28px;
        align-items: center;
        padding: 0 var(--lar-space-3);
        border: 1px solid var(--lar-border);
        border-radius: 999px;
        background: var(--lar-surface-muted);
        color: var(--lar-text);
        font-size: 0.78rem;
        font-weight: 800;
        white-space: nowrap;
      }

      .at-risk,
      .blocked {
        border-color: #f0c3bd;
        background: #fff0ee;
        color: var(--lar-danger);
      }

      .monitoring {
        border-color: #edd39a;
        background: #fff8e8;
        color: var(--lar-warning);
      }

      .on-track,
      .complete,
      .ready {
        border-color: #b7d9c6;
        background: #edf8f1;
        color: var(--lar-success);
      }
    `,
  ],
})
export class StatusTagComponent {
  readonly status = input.required<string>();

  protected label(): string {
    return formatStatus(this.status());
  }

  protected statusClass(): string {
    return this.status().replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}
