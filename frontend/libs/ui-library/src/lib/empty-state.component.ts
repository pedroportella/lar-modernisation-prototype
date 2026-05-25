import { Component, input } from '@angular/core';
import { PageAlertComponent } from './page-alert.component';

@Component({
  selector: 'lar-empty-state',
  imports: [PageAlertComponent],
  template: `
    <lar-page-alert tone="info" [title]="title()">
      {{ message() }}
    </lar-page-alert>
  `,
})
export class EmptyStateComponent {
  readonly title = input('No records');
  readonly message = input('There is nothing to show yet.');
}
