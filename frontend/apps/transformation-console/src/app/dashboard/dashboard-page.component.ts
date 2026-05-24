import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { catchError, map, of, startWith } from 'rxjs';
import { TransformationApiService, Workstream } from '@lar/services';
import { WorkstreamCardComponent } from '@lar/ui-library';
import { sortByStatusRisk } from '@lar/utils';

type DashboardState =
  | { status: 'loading'; workstreams: Workstream[]; riskCount: number }
  | { status: 'ready'; workstreams: Workstream[]; riskCount: number }
  | { status: 'error'; workstreams: Workstream[]; riskCount: number };

@Component({
  selector: 'app-dashboard-page',
  imports: [AsyncPipe, WorkstreamCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly transformationApi = inject(TransformationApiService);

  protected readonly state$ = this.transformationApi.listWorkstreams().pipe(
    map((workstreams): DashboardState => {
      const orderedWorkstreams = sortByStatusRisk(workstreams);

      return {
        status: 'ready',
        workstreams: orderedWorkstreams,
        riskCount: orderedWorkstreams.filter((workstream) =>
          ['AtRisk', 'Blocked'].includes(workstream.status),
        ).length,
      };
    }),
    startWith({ status: 'loading', workstreams: [], riskCount: 0 } satisfies DashboardState),
    catchError(() =>
      of({ status: 'error', workstreams: [], riskCount: 0 } satisfies DashboardState),
    ),
  );
}
