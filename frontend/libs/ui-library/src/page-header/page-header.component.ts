import { Component, input } from '@angular/core';

@Component({
  selector: 'lar-page-header',
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly headingId = input('page-title');
  readonly summary = input<string>();
}
