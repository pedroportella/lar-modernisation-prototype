import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { catchError, map, Observable, of, startWith, switchMap } from 'rxjs';
import { TransformationApiService } from '@lar/services';
import {
  LoadingStateComponent,
  PageAlertComponent,
  PageFrameComponent,
  StatusTagComponent,
  SummaryMetricComponent,
} from '@lar/ui-library';

interface FeatureColumn {
  key: string;
  label: string;
}

interface FeatureConfig {
  eyebrow: string;
  title: string;
  summary: string;
  sourceLabel: string;
  load: keyof Pick<
    TransformationApiService,
    | 'listPaymentReadiness'
    | 'listWarehouseSignals'
    | 'listHrPlatformTasks'
    | 'listInsightMetrics'
    | 'listAutomationCandidates'
  >;
  columns: FeatureColumn[];
  statusKey?: string;
}

type FeatureRecord = Record<string, string | number>;

type FeatureState =
  | { status: 'loading'; config: FeatureConfig; records: FeatureRecord[] }
  | { status: 'ready'; config: FeatureConfig; records: FeatureRecord[] }
  | { status: 'error'; config: FeatureConfig; records: FeatureRecord[] };

const featureConfigs: Record<string, FeatureConfig> = {
  payments: {
    eyebrow: 'Payment migration',
    title: 'Migration Readiness',
    summary: 'Checklist items for moving from the current payment platform to a Stripe-style provider boundary.',
    sourceLabel: '/api/payments/migration-readiness',
    load: 'listPaymentReadiness',
    statusKey: 'status',
    columns: [
      { key: 'area', label: 'Area' },
      { key: 'status', label: 'Status' },
      { key: 'risk', label: 'Risk' },
      { key: 'owner', label: 'Owner' },
      { key: 'nextAction', label: 'Next action' },
    ],
  },
  warehouse: {
    eyebrow: 'Warehouse optimisation',
    title: 'Operational Signals',
    summary: 'Signals that identify pick, pack and dispatch process friction.',
    sourceLabel: '/api/warehouse/optimisation',
    load: 'listWarehouseSignals',
    statusKey: 'status',
    columns: [
      { key: 'signalName', label: 'Signal' },
      { key: 'currentValue', label: 'Value' },
      { key: 'unit', label: 'Unit' },
      { key: 'status', label: 'Status' },
      { key: 'opportunity', label: 'Opportunity' },
    ],
  },
  hr: {
    eyebrow: 'HR platform uplift',
    title: 'Platform Tasks',
    summary: 'People-platform uplift tasks with process risk and ownership.',
    sourceLabel: '/api/hr/platform-uplift',
    load: 'listHrPlatformTasks',
    statusKey: 'status',
    columns: [
      { key: 'taskName', label: 'Task' },
      { key: 'status', label: 'Status' },
      { key: 'processRisk', label: 'Process risk' },
      { key: 'owner', label: 'Owner' },
    ],
  },
  insights: {
    eyebrow: 'Wayfinding insights',
    title: 'Decision Metrics',
    summary: 'Dashboard metrics that help leaders find the right operational signal quickly.',
    sourceLabel: '/api/insights/wayfinding',
    load: 'listInsightMetrics',
    statusKey: 'status',
    columns: [
      { key: 'metricName', label: 'Metric' },
      { key: 'value', label: 'Value' },
      { key: 'unit', label: 'Unit' },
      { key: 'status', label: 'Status' },
    ],
  },
  automation: {
    eyebrow: 'Automation and AI',
    title: 'Opportunity Queue',
    summary: 'Candidates for automation or AI-assisted tooling with governance-aware next steps.',
    sourceLabel: '/api/automation/candidates',
    load: 'listAutomationCandidates',
    columns: [
      { key: 'workflowName', label: 'Workflow' },
      { key: 'valueScore', label: 'Value' },
      { key: 'effortScore', label: 'Effort' },
      { key: 'riskClass', label: 'Risk class' },
      { key: 'recommendedNextStep', label: 'Next step' },
    ],
  },
};

@Component({
  selector: 'app-feature-slice-page',
  imports: [
    AsyncPipe,
    LoadingStateComponent,
    PageAlertComponent,
    PageFrameComponent,
    StatusTagComponent,
    SummaryMetricComponent,
  ],
  templateUrl: './feature-slice-page.component.html',
  styleUrl: './feature-slice-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureSlicePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly transformationApi = inject(TransformationApiService);

  protected readonly state$: Observable<FeatureState> = this.route.data.pipe(
    map((data) => featureConfigs[data['slice'] as string] ?? featureConfigs['payments']),
    switchMap((config) =>
      this.loadRecords(config).pipe(
        map((records): FeatureState => ({
          status: 'ready',
          config,
          records,
        })),
        startWith({ status: 'loading', config, records: [] } satisfies FeatureState),
        catchError(() => of({ status: 'error', config, records: [] } satisfies FeatureState)),
      ),
    ),
  );

  protected valueFor(record: FeatureRecord, column: FeatureColumn): string | number {
    return record[column.key] ?? '';
  }

  protected isStatusColumn(column: FeatureColumn, config: FeatureConfig): boolean {
    return column.key === config.statusKey;
  }

  private loadRecords(config: FeatureConfig): Observable<FeatureRecord[]> {
    switch (config.load) {
      case 'listPaymentReadiness':
        return this.transformationApi.listPaymentReadiness().pipe(map(toFeatureRecords));
      case 'listWarehouseSignals':
        return this.transformationApi.listWarehouseSignals().pipe(map(toFeatureRecords));
      case 'listHrPlatformTasks':
        return this.transformationApi.listHrPlatformTasks().pipe(map(toFeatureRecords));
      case 'listInsightMetrics':
        return this.transformationApi.listInsightMetrics().pipe(map(toFeatureRecords));
      case 'listAutomationCandidates':
        return this.transformationApi.listAutomationCandidates().pipe(map(toFeatureRecords));
    }
  }
}

function toFeatureRecords<T extends object>(records: T[]): FeatureRecord[] {
  return records.map((record) => record as unknown as FeatureRecord);
}
