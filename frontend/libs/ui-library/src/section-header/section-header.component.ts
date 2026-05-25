import { Component, input } from '@angular/core';

@Component({
  selector: 'lar-section-header',
  templateUrl: './section-header.component.html',
  styleUrl: './section-header.component.scss',
})
export class SectionHeaderComponent {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly headingId = input('section-title');
  readonly summary = input<string>();
}
