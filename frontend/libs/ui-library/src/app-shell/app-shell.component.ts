import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LAR_MARK_INITIALS,
  LAR_NEUTRAL_CLIENT_LABEL,
  LAR_PRODUCT_NAME,
} from '@lar/ui-assets';

@Component({
  selector: 'lar-app-shell',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  protected readonly productName = LAR_PRODUCT_NAME;
  protected readonly clientLabel = LAR_NEUTRAL_CLIENT_LABEL;
  protected readonly markInitials = LAR_MARK_INITIALS;
  readonly runtimeLabel = input('Runtime config');
  protected readonly navGroups = [
    {
      id: 'overview-navigation',
      label: 'Overview',
      items: [
        { label: 'Dashboard', path: '/' },
        { label: 'Readiness', path: '/readiness' },
      ],
    },
    {
      id: 'workstream-navigation',
      label: 'Workstreams',
      items: [
        { label: 'Payments', path: '/payments' },
        { label: 'Warehouse', path: '/warehouse' },
        { label: 'HR uplift', path: '/hr-platform' },
      ],
    },
    {
      id: 'operations-navigation',
      label: 'Operations',
      items: [
        { label: 'Insights', path: '/insights' },
        { label: 'Automation', path: '/automation' },
        { label: 'Operations status', path: '/operations' },
      ],
    },
  ];
}
