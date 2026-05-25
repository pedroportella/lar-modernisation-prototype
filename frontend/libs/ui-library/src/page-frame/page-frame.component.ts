import { Component, input } from '@angular/core';
import { PageHeaderComponent } from '../page-header/page-header.component';

@Component({
  selector: 'lar-page-frame',
  imports: [PageHeaderComponent],
  templateUrl: './page-frame.component.html',
  styleUrl: './page-frame.component.scss',
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
