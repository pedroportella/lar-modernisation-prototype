import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LAR_MARK_INITIALS,
  LAR_NEUTRAL_CLIENT_LABEL,
  LAR_PRODUCT_NAME,
} from '@lar/ui-assets';

@Component({
  selector: 'lar-app-shell',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="shell">
      <aside class="sidebar" aria-label="Primary">
        <a class="brand" routerLink="/" aria-label="Dashboard home">
          <span class="brand-mark">{{ markInitials }}</span>
          <span>
            <strong>{{ productName }}</strong>
            <small>{{ clientLabel }}</small>
          </span>
        </a>

        <nav>
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
            >
              {{ item.label }}
            </a>
          }
        </nav>
      </aside>

      <div class="workspace">
        <header>
          <span>Modernisation program</span>
          <strong>Local prototype</strong>
        </header>

        <main>
          <ng-content></ng-content>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .shell {
        display: grid;
        min-height: 100vh;
        grid-template-columns: 280px minmax(0, 1fr);
        background: var(--lar-surface-page);
      }

      .sidebar {
        display: flex;
        flex-direction: column;
        gap: var(--lar-space-6);
        padding: var(--lar-space-5);
        border-right: 1px solid var(--lar-border);
        background: #123237;
        color: #ffffff;
      }

      .brand {
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr);
        gap: var(--lar-space-3);
        align-items: center;
        color: inherit;
        text-decoration: none;
      }

      .brand-mark {
        display: grid;
        width: 44px;
        height: 44px;
        place-items: center;
        border-radius: var(--lar-radius);
        background: #dceee8;
        color: #123237;
        font-weight: 800;
      }

      .brand strong,
      .brand small {
        display: block;
      }

      .brand strong {
        line-height: 1.2;
      }

      .brand small {
        margin-top: var(--lar-space-1);
        color: #b7cbc6;
      }

      nav a {
        display: block;
        padding: 0.7rem 0.8rem;
        border-radius: var(--lar-radius);
        color: #dbe8e5;
        font-weight: 700;
        text-decoration: none;
      }

      nav a.active,
      nav a:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
      }

      .workspace {
        min-width: 0;
      }

      header {
        display: flex;
        min-height: 64px;
        align-items: center;
        justify-content: space-between;
        gap: var(--lar-space-4);
        padding: 0 var(--lar-space-6);
        border-bottom: 1px solid var(--lar-border);
        background: var(--lar-surface);
        color: var(--lar-text-muted);
      }

      header strong {
        color: var(--lar-text);
      }

      main {
        padding: var(--lar-space-6);
      }

      @media (max-width: 820px) {
        .shell {
          grid-template-columns: 1fr;
        }

        .sidebar {
          border-right: 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        header {
          padding: 0 var(--lar-space-4);
        }

        main {
          padding: var(--lar-space-4);
        }
      }
    `,
  ],
})
export class AppShellComponent {
  protected readonly productName = LAR_PRODUCT_NAME;
  protected readonly clientLabel = LAR_NEUTRAL_CLIENT_LABEL;
  protected readonly markInitials = LAR_MARK_INITIALS;
  protected readonly navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Payments', path: '/payments' },
    { label: 'Warehouse', path: '/warehouse' },
    { label: 'HR uplift', path: '/hr-platform' },
    { label: 'Insights', path: '/insights' },
    { label: 'Automation', path: '/automation' },
  ];
}
