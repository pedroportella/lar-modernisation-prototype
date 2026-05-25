import { Component, input } from '@angular/core';
import { PageHeaderComponent } from './page-header.component';

@Component({
  selector: 'lar-page-frame',
  imports: [PageHeaderComponent],
  template: `
    <section class="page-frame" [attr.aria-labelledby]="headingId()">
      <div class="page-frame__top">
        <lar-page-header
          [eyebrow]="eyebrow()"
          [title]="title()"
          [summary]="summary()"
          [headingId]="headingId()"
        ></lar-page-header>

        @if (metaLabel() || metaValue() || hasActions()) {
          <div class="page-frame__aside">
            @if (metaLabel() || metaValue()) {
              <dl>
                @if (metaLabel()) {
                  <dt>{{ metaLabel() }}</dt>
                }
                @if (metaValue()) {
                  <dd>{{ metaValue() }}</dd>
                }
              </dl>
            }
            <div class="page-frame__actions">
              <ng-content select="[page-actions]"></ng-content>
            </div>
          </div>
        }
      </div>

      <div class="page-frame__body">
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styles: [
    `
      .page-frame {
        display: grid;
        gap: var(--lar-space-6);
      }

      .page-frame__top {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(220px, 320px);
        gap: var(--lar-space-5);
        align-items: start;
      }

      .page-frame__aside {
        display: grid;
        gap: var(--lar-space-3);
        justify-items: end;
      }

      dl {
        width: 100%;
        margin: 0;
        padding: var(--lar-space-4);
        border: 1px solid var(--lar-border);
        border-radius: var(--lar-radius);
        background: var(--lar-surface);
      }

      dt,
      dd {
        margin: 0;
      }

      dt {
        color: var(--lar-text-muted);
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
      }

      dd {
        margin-top: var(--lar-space-2);
        color: var(--lar-text);
        font-weight: 800;
        overflow-wrap: anywhere;
      }

      .page-frame__actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: var(--lar-space-2);
      }

      .page-frame__body {
        display: grid;
        gap: var(--lar-space-6);
        min-width: 0;
      }

      @media (max-width: 980px) {
        .page-frame__top {
          grid-template-columns: 1fr;
        }

        .page-frame__aside {
          justify-items: stretch;
        }

        .page-frame__actions {
          justify-content: flex-start;
        }
      }
    `,
  ],
})
export class PageFrameComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly headingId = input('page-title');
  readonly summary = input<string>();
  readonly metaLabel = input<string>();
  readonly metaValue = input<string>();
  readonly hasActions = input(false);
}
