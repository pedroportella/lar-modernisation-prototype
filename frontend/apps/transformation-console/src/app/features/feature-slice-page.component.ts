import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  catchError,
  EMPTY,
  map,
  Observable,
  of,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs';
import {
  LAR_RUNTIME_CONFIG,
  TransformationApiService,
  WorkflowReview,
} from '@lar/services';
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
  sliceKey: string;
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
  actionKey?: string;
}

type FeatureRecord = Record<string, string | number>;
type WorkflowSaveState = 'idle' | 'saving' | 'saved' | 'error';

type FeatureState =
  | { status: 'loading'; config: FeatureConfig; records: FeatureRecord[] }
  | { status: 'ready'; config: FeatureConfig; records: FeatureRecord[] }
  | { status: 'error'; config: FeatureConfig; records: FeatureRecord[] };

const featureConfigs: Record<string, FeatureConfig> = {
  payments: {
    sliceKey: 'payments',
    eyebrow: 'Payment migration',
    title: 'Migration Readiness',
    summary:
      'Checklist items for moving from the current payment platform to a Stripe-style provider boundary.',
    sourceLabel: '/api/payments/migration-readiness',
    load: 'listPaymentReadiness',
    statusKey: 'status',
    actionKey: 'nextAction',
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
    sliceKey: 'warehouse',
    eyebrow: 'Warehouse optimisation',
    title: 'Operational Signals',
    summary: 'Signals that identify pick, pack and dispatch process friction.',
    sourceLabel: '/api/warehouse/optimisation',
    load: 'listWarehouseSignals',
    statusKey: 'status',
    actionKey: 'opportunity',
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
    sliceKey: 'hr',
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
    sliceKey: 'insights',
    eyebrow: 'Wayfinding insights',
    title: 'Decision Metrics',
    summary:
      'Dashboard metrics that help leaders find the right operational signal quickly.',
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
    sliceKey: 'automation',
    eyebrow: 'Automation and AI',
    title: 'Opportunity Queue',
    summary:
      'Candidates for automation or AI-assisted tooling with governance-aware next steps.',
    sourceLabel: '/api/automation/candidates',
    load: 'listAutomationCandidates',
    actionKey: 'recommendedNextStep',
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
    ReactiveFormsModule,
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
  private readonly formBuilder = inject(FormBuilder);
  private readonly runtimeConfig = inject(LAR_RUNTIME_CONFIG);

  protected readonly searchTerm = signal('');
  protected readonly statusFilter = signal('all');
  protected readonly selectedRecordId = signal<string | number | null>(null);
  protected readonly workflowReviews = signal<Record<string, WorkflowReview>>(
    {},
  );
  protected readonly workflowSaveState = signal<WorkflowSaveState>('idle');
  protected readonly workflowError = signal('');
  protected readonly canWriteWorkflowReviews =
    this.runtimeConfig.role === 'DeliveryLead' ||
    this.runtimeConfig.role === 'Admin';

  protected readonly reviewForm = this.formBuilder.nonNullable.group({
    status: ['Monitoring', Validators.required],
    action: ['', [Validators.required, Validators.minLength(8)]],
    note: ['', [Validators.required, Validators.minLength(12)]],
    reviewedBy: ['', Validators.required],
  });

  private activeWorkflowRecordKey = '';
  private readonly loadedWorkflowReviewKeys = new Set<string>();

  protected readonly state$: Observable<FeatureState> = this.route.data.pipe(
    map(
      (data) =>
        featureConfigs[data['slice'] as string] ?? featureConfigs['payments'],
    ),
    switchMap((config) =>
      this.loadRecords(config).pipe(
        tap((records) => this.ensureSelectedRecord(records, config)),
        map(
          (records): FeatureState => ({
            status: 'ready',
            config,
            records,
          }),
        ),
        startWith({
          status: 'loading',
          config,
          records: [],
        } satisfies FeatureState),
        catchError(() =>
          of({ status: 'error', config, records: [] } satisfies FeatureState),
        ),
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

  protected selectRecord(record: FeatureRecord, config: FeatureConfig): void {
    this.selectedRecordId.set(record['id']);
    this.syncReviewForm(record, config);
  }

  protected filteredRecords(
    records: FeatureRecord[],
    config: FeatureConfig,
  ): FeatureRecord[] {
    const query = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();

    return records.filter((record) => {
      const matchesQuery =
        !query ||
        config.columns.some((column) =>
          String(this.valueFor(record, column, config))
            .toLowerCase()
            .includes(query),
        );
      const matchesStatus =
        status === 'all' ||
        !config.statusKey ||
        String(
          this.valueFor(
            record,
            { key: config.statusKey, label: 'Status' },
            config,
          ),
        ) === status;

      return matchesQuery && matchesStatus;
    });
  }

  protected statusOptions(
    records: FeatureRecord[],
    config: FeatureConfig,
  ): string[] {
    if (!config.statusKey) return [];
    const statusKey = config.statusKey;

    return Array.from(
      new Set(records.map((record) => String(record[statusKey]))),
    ).sort();
  }

  protected attentionCount(
    records: FeatureRecord[],
    config: FeatureConfig,
  ): number {
    if (!config.statusKey) return 0;
    const statusKey = config.statusKey;

    return records.filter((record) =>
      ['AtRisk', 'Blocked'].includes(
        String(
          this.valueFor(record, { key: statusKey, label: 'Status' }, config),
        ),
      ),
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

  protected detailColumns(
    record: FeatureRecord,
    config: FeatureConfig,
  ): FeatureColumn[] {
    return config.columns.filter((column) => record[column.key] !== undefined);
  }

  protected valueFor(
    record: FeatureRecord,
    column: FeatureColumn,
    config?: FeatureConfig,
  ): string | number {
    const review = config
      ? this.workflowReviews()[this.reviewKey(record, config)]
      : undefined;

    if (review && column.key === config?.statusKey) {
      return review.status;
    }

    if (review && column.key === config?.actionKey) {
      return review.action;
    }

    return record[column.key] ?? '';
  }

  protected isStatusColumn(
    column: FeatureColumn,
    config: FeatureConfig,
  ): boolean {
    return column.key === config.statusKey;
  }

  protected submitWorkflowReview(
    record: FeatureRecord,
    config: FeatureConfig,
  ): void {
    this.syncReviewForm(record, config);
    this.reviewForm.markAllAsTouched();

    if (this.reviewForm.invalid || this.workflowSaveState() === 'saving')
      return;

    const value = this.reviewForm.getRawValue();
    this.workflowSaveState.set('saving');
    this.workflowError.set('');

    this.transformationApi
      .saveWorkflowReview(config.sliceKey, record['id'], {
        action: value.action,
        note: value.note,
        reviewedBy: value.reviewedBy,
        status: value.status,
      })
      .pipe(
        take(1),
        catchError(() => {
          this.workflowSaveState.set('error');
          this.workflowError.set(
            'Review could not be saved. Keep the form open and try again.',
          );
          return of(null);
        }),
      )
      .subscribe((review) => {
        if (!review) {
          return;
        }

        this.workflowReviews.update((reviews) => ({
          ...reviews,
          [this.reviewKey(record, config)]: review,
        }));
        this.loadedWorkflowReviewKeys.add(this.reviewKey(record, config));
        this.workflowSaveState.set('saved');
        this.reviewForm.markAsPristine();
      });
  }

  protected resetWorkflowReview(
    record: FeatureRecord,
    config: FeatureConfig,
  ): void {
    this.syncReviewForm(record, config, true);
  }

  protected hasWorkflowReview(
    record: FeatureRecord,
    config: FeatureConfig,
  ): boolean {
    return this.workflowReviews()[this.reviewKey(record, config)] !== undefined;
  }

  protected actionLabel(config: FeatureConfig): string {
    switch (config.actionKey) {
      case 'nextAction':
      case 'recommendedNextStep':
        return 'Next action';
      case 'opportunity':
        return 'Response action';
      default:
        return 'Follow-up action';
    }
  }

  protected statusReviewOptions(
    records: FeatureRecord[],
    config: FeatureConfig,
  ): string[] {
    const existing = config.statusKey
      ? this.statusOptions(records, config)
      : [];
    return Array.from(
      new Set([...existing, 'OnTrack', 'Monitoring', 'AtRisk', 'Blocked']),
    ).sort();
  }

  private loadRecords(config: FeatureConfig): Observable<FeatureRecord[]> {
    switch (config.load) {
      case 'listPaymentReadiness':
        return this.transformationApi
          .listPaymentReadiness()
          .pipe(map(toFeatureRecords));
      case 'listWarehouseSignals':
        return this.transformationApi
          .listWarehouseSignals()
          .pipe(map(toFeatureRecords));
      case 'listHrPlatformTasks':
        return this.transformationApi
          .listHrPlatformTasks()
          .pipe(map(toFeatureRecords));
      case 'listInsightMetrics':
        return this.transformationApi
          .listInsightMetrics()
          .pipe(map(toFeatureRecords));
      case 'listAutomationCandidates':
        return this.transformationApi
          .listAutomationCandidates()
          .pipe(map(toFeatureRecords));
    }
  }

  private ensureSelectedRecord(
    records: FeatureRecord[],
    config: FeatureConfig,
  ): void {
    if (records.length === 0) return;

    const selectedId = this.selectedRecordId();
    const selectedStillExists = records.some(
      (record) => record['id'] === selectedId,
    );

    if (!selectedStillExists) {
      this.selectedRecordId.set(records[0]['id']);
      this.syncReviewForm(records[0], config, true);
    }
  }

  private syncReviewForm(
    record: FeatureRecord,
    config?: FeatureConfig,
    force = false,
  ): void {
    if (!config) return;

    const recordKey = this.reviewKey(record, config);
    if (!force && this.activeWorkflowRecordKey === recordKey) return;

    const review = this.workflowReviews()[recordKey];
    this.reviewForm.reset({
      status:
        review?.status ??
        String(record[config.statusKey ?? 'status'] ?? 'Monitoring'),
      action:
        review?.action ??
        String(record[config.actionKey ?? 'nextAction'] ?? ''),
      note: review?.note ?? '',
      reviewedBy: review?.reviewedBy ?? '',
    });
    this.activeWorkflowRecordKey = recordKey;
    this.workflowSaveState.set('idle');
    this.workflowError.set('');
    this.loadPersistedWorkflowReview(record, config);
  }

  private loadPersistedWorkflowReview(
    record: FeatureRecord,
    config: FeatureConfig,
  ): void {
    const recordKey = this.reviewKey(record, config);

    if (this.loadedWorkflowReviewKeys.has(recordKey)) {
      return;
    }

    this.loadedWorkflowReviewKeys.add(recordKey);
    this.transformationApi
      .getWorkflowReview(config.sliceKey, record['id'])
      .pipe(
        take(1),
        catchError(() => EMPTY),
      )
      .subscribe((review) => {
        this.workflowReviews.update((reviews) => ({
          ...reviews,
          [recordKey]: review,
        }));

        if (
          this.activeWorkflowRecordKey === recordKey &&
          !this.reviewForm.dirty
        ) {
          this.reviewForm.reset({
            status: review.status,
            action: review.action,
            note: review.note,
            reviewedBy: review.reviewedBy,
          });
        }
      });
  }

  private reviewKey(record: FeatureRecord, config: FeatureConfig): string {
    return `${config.sliceKey}:${record['id']}`;
  }
}

function toFeatureRecords<T extends object>(records: T[]): FeatureRecord[] {
  return records.map((record) => record as unknown as FeatureRecord);
}
