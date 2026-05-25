import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
  primaryKey: string;
  detailTitle: string;
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
    primaryKey: 'area',
    detailTitle: 'Readiness item',
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
    primaryKey: 'signalName',
    detailTitle: 'Signal detail',
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
    primaryKey: 'taskName',
    detailTitle: 'Task detail',
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
    primaryKey: 'metricName',
    detailTitle: 'Metric detail',
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
    primaryKey: 'workflowName',
    detailTitle: 'Candidate detail',
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

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal('all');
  protected readonly selectedRecordId = signal<string | number | null>(null);

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

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected updateStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('all');
  }

  protected selectRecord(record: FeatureRecord): void {
    this.selectedRecordId.set(record['id']);
  }

  protected filteredRecords(records: FeatureRecord[], config: FeatureConfig): FeatureRecord[] {
    const query = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return records.filter((record) => {
      const matchesQuery =
        !query ||
        config.columns.some((column) =>
          String(this.valueFor(record, column)).toLowerCase().includes(query),
        );
      const matchesStatus =
        status === 'all' || !config.statusKey || String(record[config.statusKey]) === status;

      return matchesQuery && matchesStatus;
    });
  }

  protected statusOptions(records: FeatureRecord[], config: FeatureConfig): string[] {
    if (!config.statusKey) return [];
    const statusKey = config.statusKey;

    return Array.from(new Set(records.map((record) => String(record[statusKey])))).sort();
  }

  protected attentionCount(records: FeatureRecord[], config: FeatureConfig): number {
    if (!config.statusKey) return 0;
    const statusKey = config.statusKey;

    return records.filter((record) =>
      ['AtRisk', 'Blocked'].includes(String(record[statusKey])),
    ).length;
  }

  protected selectedRecord(records: FeatureRecord[]): FeatureRecord | null {
    if (records.length === 0) return null;

    const selectedId = this.selectedRecordId();
    return records.find((record) => record['id'] === selectedId) ?? records[0];
  }

  protected recordLabel(record: FeatureRecord, config: FeatureConfig): string {
    return String(record[config.primaryKey] ?? record['id'] ?? 'Record');
  }

  protected detailColumns(record: FeatureRecord, config: FeatureConfig): FeatureColumn[] {
    return config.columns.filter((column) => record[column.key] !== undefined);
  }

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
