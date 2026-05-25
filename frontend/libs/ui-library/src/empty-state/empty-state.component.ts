import { Component, input } from '@angular/core';
import { PageAlertComponent } from '../page-alert/page-alert.component';

@Component({
  selector: 'lar-empty-state',
  imports: [PageAlertComponent],
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  readonly title = input('No records');
  readonly message = input('There is nothing to show yet.');
}
