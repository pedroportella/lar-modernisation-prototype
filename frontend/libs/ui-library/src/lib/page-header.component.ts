import { Component, input } from '@angular/core';

@Component({
  selector: 'lar-page-header',
  template: `
    <header class="page-header">
      <p class="page-header__eyebrow">{{ eyebrow() }}</p>
      <h1 [id]="headingId()">{{ title() }}</h1>
      @if (summary()) {
        <p class="page-header__summary">{{ summary() }}</p>
      }
    </header>
  `,
  styles: [
    `
      .page-header {
        max-width: 960px;
      }

      .page-header__eyebrow {
        margin: 0 0 var(--lar-space-2);
        color: var(--lar-action);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      h1 {
        margin: 0;
        color: var(--lar-text);
        font-size: clamp(2.1rem, 4vw, 4.4rem);
        line-height: 1;
        letter-spacing: 0;
      }

      .page-header__summary {
        max-width: 680px;
        margin: var(--lar-space-4) 0 0;
        color: var(--lar-text-muted);
        font-size: 1.05rem;
        line-height: 1.6;
      }
    `,
  ],
})
export class PageHeaderComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly headingId = input('page-title');
  readonly summary = input<string>();
}
