import { AsyncPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { catchError, map, of, startWith } from 'rxjs';
import {
  OperationalDatasetCounts,
  OperationalStatus,
  TransformationApiService,
} from '@lar/services';
import {
  LoadingStateComponent,
  PageAlertComponent,
  PageFrameComponent,
  StatusTagComponent,
} from '@lar/ui-library';

type OperationsState =
  | { status: 'loading'; statusReport: null; countItems: CountItem[] }
  | {
      status: 'ready';
      statusReport: OperationalStatus;
      countItems: CountItem[];
    }
  | { status: 'error'; statusReport: null; countItems: CountItem[] };

interface CountItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-operations-status-page',
  imports: [
    AsyncPipe,
    DatePipe,
    LoadingStateComponent,
    PageAlertComponent,
    PageFrameComponent,
    StatusTagComponent,
    TitleCasePipe,
  ],
  templateUrl: './operations-status-page.component.html',
  styleUrl: './operations-status-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsStatusPageComponent {
  private readonly transformationApi = inject(TransformationApiService);

  protected readonly state$ = this.transformationApi
    .getOperationalStatus()
    .pipe(
      map((statusReport) => ({
        status: 'ready' as const,
        statusReport,
        countItems: toCountItems(statusReport.counts),
      })),
      startWith({
        status: 'loading',
        statusReport: null,
        countItems: [],
      } satisfies OperationsState),
      catchError(() =>
        of({
          status: 'error',
          statusReport: null,
          countItems: [],
        } satisfies OperationsState),
      ),
    );
}

function toCountItems(counts: OperationalDatasetCounts): CountItem[] {
  return [
    { label: 'Workstreams', value: counts.workstreams },
    { label: 'Initiatives', value: counts.initiatives },
    { label: 'Payment readiness', value: counts.paymentReadinessItems },
    { label: 'Warehouse signals', value: counts.warehouseSignals },
    { label: 'HR platform tasks', value: counts.hrPlatformTasks },
    { label: 'Insight metrics', value: counts.insightMetrics },
    { label: 'Automation candidates', value: counts.automationCandidates },
  ];
}
