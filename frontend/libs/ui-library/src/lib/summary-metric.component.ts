import { Component, input } from '@angular/core';

@Component({
  selector: 'lar-summary-metric',
  template: `
    <article class="metric">
      <span>{{ label() }}</span>
      <strong>{{ value() }}</strong>
    </article>
  `,
  styles: [
    `
      .metric {
        min-height: 112px;
        padding: var(--lar-space-4);
        border: 1px solid var(--lar-border);
        border-radius: var(--lar-radius);
        background: var(--lar-surface);
      }

      span {
        display: block;
        color: var(--lar-text-muted);
        font-size: 0.82rem;
        font-weight: 800;
      }

      strong {
        display: block;
        margin-top: var(--lar-space-3);
        color: var(--lar-text);
        font-size: 2rem;
        line-height: 1.15;
      }
    `,
  ],
})
export class SummaryMetricComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
}
