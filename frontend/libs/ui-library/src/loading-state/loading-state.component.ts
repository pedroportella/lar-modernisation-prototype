import { Component, input } from '@angular/core';
import { PageAlertComponent } from '../page-alert/page-alert.component';

@Component({
  selector: 'lar-loading-state',
  imports: [PageAlertComponent],
  templateUrl: './loading-state.component.html',
})
export class LoadingStateComponent {
  readonly message = input('Loading data...');
}
