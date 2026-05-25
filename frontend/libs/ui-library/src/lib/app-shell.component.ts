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
    <div class="au-body shell">
      <a class="skip-link" href="#main-content">Skip to main content</a>

      <aside class="sidebar" aria-label="Primary">
        <a class="brand" routerLink="/" aria-label="Dashboard home">
          <span class="brand-mark">{{ markInitials }}</span>
          <span>
            <strong>{{ productName }}</strong>
            <small>{{ clientLabel }}</small>
          </span>
        </a>

        <nav class="primary-nav" aria-label="Workspace">
          @for (group of navGroups; track group.label) {
            <section class="nav-group" [attr.aria-labelledby]="group.id">
              <h2 [id]="group.id">{{ group.label }}</h2>
              @for (item of group.items; track item.path) {
                <a
                  [routerLink]="item.path"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: item.path === '/' }"
                >
                  {{ item.label }}
                </a>
              }
            </section>
          }
        </nav>
      </aside>

      <div class="workspace">
        <header class="workspace-bar">
          <span>Modernisation workspace</span>
          <strong>Frontend mock mode</strong>
        </header>

        <main id="main-content" tabindex="-1">
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

      .skip-link {
        position: fixed;
        top: var(--lar-space-3);
        left: var(--lar-space-3);
        z-index: 10;
        transform: translateY(calc(-100% - var(--lar-space-4)));
        border-radius: var(--lar-radius);
        background: var(--lar-action);
        color: #ffffff;
        font-weight: 800;
        padding: var(--lar-space-2) var(--lar-space-3);
        text-decoration: none;
        transition: transform 120ms ease;
      }

      .skip-link:focus {
        transform: translateY(0);
      }

      .sidebar {
        display: flex;
        flex-direction: column;
        gap: var(--lar-space-5);
        padding: var(--lar-space-5);
        border-right: 1px solid var(--lar-border);
        background: var(--lar-shell);
        color: #ffffff;
      }

      .brand {
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr);
        gap: var(--lar-space-3);
        align-items: center;
        color: #ffffff;
        text-decoration: none;
      }

      .brand:visited,
      .brand:hover,
      .brand:focus-visible {
        color: #ffffff;
        text-decoration: none;
      }

      .brand-mark {
        display: grid;
        width: 44px;
        height: 44px;
        place-items: center;
        border-radius: var(--lar-radius);
        background: #dceee8;
        color: var(--lar-shell);
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
        color: var(--lar-shell-muted);
      }

      .brand:hover strong,
      .brand:focus-visible strong {
        color: #ffffff;
      }

      .brand:hover small,
      .brand:focus-visible small {
        color: var(--lar-shell-muted);
      }

      .primary-nav,
      .nav-group {
        display: grid;
        gap: var(--lar-space-2);
      }

      .nav-group + .nav-group {
        margin-top: var(--lar-space-3);
        padding-top: var(--lar-space-4);
        border-top: 1px solid rgba(255, 255, 255, 0.12);
      }

      .nav-group h2 {
        margin: 0;
        color: rgba(255, 255, 255, 0.64);
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0;
        text-transform: uppercase;
      }

      .primary-nav a {
        display: block;
        padding: 0.7rem 0.8rem;
        border-radius: var(--lar-radius);
        color: var(--lar-shell-muted);
        font-weight: 700;
        text-decoration: none;
      }

      .primary-nav a.active,
      .primary-nav a:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #ffffff;
      }

      .workspace {
        min-width: 0;
      }

      .workspace-bar {
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

      .workspace-bar strong {
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

        .workspace-bar {
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
