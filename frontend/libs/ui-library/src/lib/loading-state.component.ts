import { Component, input } from '@angular/core';
import { PageAlertComponent } from './page-alert.component';

@Component({
  selector: 'lar-loading-state',
  imports: [PageAlertComponent],
  template: `
    <lar-page-alert tone="info" title="Loading">
      {{ message() }}
    </lar-page-alert>
  `,
})
export class LoadingStateComponent {
  readonly message = input('Loading data...');
}
