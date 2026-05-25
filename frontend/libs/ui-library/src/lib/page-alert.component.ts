import { Component, input } from '@angular/core';

export type PageAlertTone = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'lar-page-alert',
  template: `
    <aside
      class="au-page-alerts alert"
      [class.alert--info]="tone() === 'info'"
      [class.alert--success]="tone() === 'success'"
      [class.alert--warning]="tone() === 'warning'"
      [class.alert--error]="tone() === 'error'"
      [attr.aria-live]="live()"
    >
      @if (title()) {
        <strong>{{ title() }}</strong>
      }
      <p><ng-content></ng-content></p>
    </aside>
  `,
  styles: [
    `
      .alert {
        margin: 0;
        padding: var(--lar-space-4);
        border: 1px solid var(--lar-border);
        border-left-width: 6px;
        border-radius: var(--lar-radius);
        background: var(--lar-surface);
        color: var(--lar-text-muted);
      }

      .alert--info {
        border-left-color: var(--lar-action);
      }

      .alert--success {
        border-left-color: var(--lar-success);
      }

      .alert--warning {
        border-left-color: var(--lar-warning);
      }

      .alert--error {
        border-color: #f0c3bd;
        border-left-color: var(--lar-danger);
        color: var(--lar-danger);
      }

      strong,
      p {
        margin: 0;
      }

      strong + p {
        margin-top: var(--lar-space-1);
      }
    `,
  ],
})
export class PageAlertComponent {
  readonly tone = input<PageAlertTone>('info');
  readonly title = input<string>();
  readonly live = input<'off' | 'polite' | 'assertive'>('polite');
}
