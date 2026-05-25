import { Component, input } from '@angular/core';

export type PageAlertTone = 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'lar-page-alert',
  templateUrl: './page-alert.component.html',
  styleUrl: './page-alert.component.scss',
})
export class PageAlertComponent {
  readonly tone = input<PageAlertTone>('info');
  readonly title = input<string>();
  readonly live = input<'off' | 'polite' | 'assertive'>('polite');
}
