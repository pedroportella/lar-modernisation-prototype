import { Component, input } from '@angular/core';
import { Workstream } from '@lar/services';
import { StatusPillComponent } from './status-pill.component';

@Component({
  selector: 'lar-workstream-card',
  imports: [StatusPillComponent],
  template: `
    <article class="card">
      <div class="card-header">
        <span class="priority">P{{ workstream().priority }}</span>
        <lar-status-pill [status]="workstream().status"></lar-status-pill>
      </div>

      <h2>{{ workstream().name }}</h2>
      <p>{{ workstream().summary }}</p>
    </article>
  `,
  styles: [
    `
      .card {
        display: flex;
        min-height: 210px;
        flex-direction: column;
        gap: var(--lar-space-4);
        justify-content: space-between;
        padding: var(--lar-space-5);
        border: 1px solid var(--lar-border);
        border-radius: var(--lar-radius);
        background: var(--lar-surface);
        box-shadow: var(--lar-shadow);
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--lar-space-3);
      }

      .priority {
        color: var(--lar-text-muted);
        font-size: 0.78rem;
        font-weight: 800;
      }

      h2 {
        margin: 0;
        color: var(--lar-text);
        font-size: 1.05rem;
        letter-spacing: 0;
      }

      p {
        margin: 0;
        color: var(--lar-text-muted);
        line-height: 1.55;
      }
    `,
  ],
})
export class WorkstreamCardComponent {
  readonly workstream = input.required<Workstream>();
}
