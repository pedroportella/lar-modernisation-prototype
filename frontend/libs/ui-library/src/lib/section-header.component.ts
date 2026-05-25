import { Component, input } from '@angular/core';

@Component({
  selector: 'lar-section-header',
  template: `
    <header class="section-header">
      <div>
        <p>{{ eyebrow() }}</p>
        <h2 [id]="headingId()">{{ title() }}</h2>
      </div>
      @if (summary()) {
        <span>{{ summary() }}</span>
      }
    </header>
  `,
  styles: [
    `
      .section-header {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: var(--lar-space-4);
      }

      p,
      h2,
      span {
        margin: 0;
      }

      p {
        color: var(--lar-action);
        font-size: 0.74rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      h2 {
        margin-top: var(--lar-space-1);
        color: var(--lar-text);
        font-size: 1.25rem;
        letter-spacing: 0;
      }

      span {
        max-width: 520px;
        color: var(--lar-text-muted);
        line-height: 1.5;
      }

      @media (max-width: 720px) {
        .section-header {
          display: grid;
        }
      }
    `,
  ],
})
export class SectionHeaderComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly headingId = input('section-title');
  readonly summary = input<string>();
}
