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
  BehaviorSubject,
  catchError,
  combineLatest,
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
  PagedResponse,
  TransformationApiService,
  WorkflowReview,
} from '@lar/services';
import {
  ButtonComponent,
  CardComponent,
  FormControlOption,
  FormFieldWrapperComponent,
  LoadingStateComponent,
  PageAlertComponent,
  PageFrameComponent,
  SelectInputComponent,
  StatusTagComponent,
  SummaryMetricComponent,
  TextInputComponent,
} from '@lar/ui-library';
import { formatRoles, formatStatus } from '@lar/utils';

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
type ReviewFormControlName = 'status' | 'action' | 'note' | 'reviewedBy';

type FeatureState =
  | {
      status: 'loading';
      config: FeatureConfig;
      records: FeatureRecord[];
      pageInfo: PagedResponse<FeatureRecord>;
    }
  | {
      status: 'ready';
      config: FeatureConfig;
      records: FeatureRecord[];
      pageInfo: PagedResponse<FeatureRecord>;
    }
  | {
      status: 'error';
      config: FeatureConfig;
      records: FeatureRecord[];
      pageInfo: PagedResponse<FeatureRecord>;
    };

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
    eyebrow: 'Automation governance',
    title: 'Opportunity Queue',
    summary:
      'Automation candidates with evidence, approval and governance-aware next steps.',
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
    ButtonComponent,
    CardComponent,
    FormFieldWrapperComponent,
    LoadingStateComponent,
    PageAlertComponent,
    PageFrameComponent,
    ReactiveFormsModule,
    SelectInputComponent,
    StatusTagComponent,
    SummaryMetricComponent,
    TextInputComponent,
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
  protected readonly page = signal(1);
  protected readonly pageSize = signal(25);
  protected readonly sort = signal('');
  protected readonly selectedRecordId = signal<string | number | null>(null);
  protected readonly workflowReviews = signal<Record<string, WorkflowReview>>(
    {},
  );
  protected readonly workflowSaveState = signal<WorkflowSaveState>('idle');
  protected readonly workflowError = signal('');
  protected readonly canWriteWorkflowReviews =
    this.runtimeConfig.role === 'DeliveryLead' ||
    this.runtimeConfig.role === 'Admin';
  protected readonly workflowWriteRoleLabel = formatRoles([
    'DeliveryLead',
    'Admin',
  ]);

  protected readonly reviewForm = this.formBuilder.nonNullable.group({
    status: ['Monitoring', Validators.required],
    action: ['', [Validators.required, Validators.minLength(8)]],
    note: ['', [Validators.required, Validators.minLength(12)]],
    reviewedBy: ['', Validators.required],
  });

  private activeWorkflowRecordKey = '';
  private readonly loadedWorkflowReviewKeys = new Set<string>();
  private readonly queryRefresh = new BehaviorSubject<void>(undefined);

  protected readonly state$: Observable<FeatureState> = combineLatest([
    this.route.data.pipe(
      map(
        (data) =>
          featureConfigs[data['slice'] as string] ?? featureConfigs['payments'],
      ),
    ),
    this.queryRefresh,
  ]).pipe(
    switchMap(([config]) =>
      this.loadRecords(config).pipe(
        tap((pageInfo) => this.ensureSelectedRecord(pageInfo.items, config)),
        map(
          (pageInfo): FeatureState => ({
            status: 'ready',
            config,
            records: pageInfo.items,
            pageInfo,
          }),
        ),
        startWith({
          status: 'loading',
          config,
          records: [],
          pageInfo: emptyPage(this.page(), this.pageSize()),
        } satisfies FeatureState),
        catchError(() =>
          of({
            status: 'error',
            config,
            records: [],
            pageInfo: emptyPage(this.page(), this.pageSize()),
          } satisfies FeatureState),
        ),
      ),
    ),
  );

  protected updateSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.page.set(1);
    this.refreshQuery();
  }

  protected updateStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
    this.refreshQuery();
  }

  protected updateSort(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
    this.refreshQuery();
  }

  protected updatePageSize(event: Event): void {
    this.pageSize.set(Number((event.target as HTMLSelectElement).value));
    this.page.set(1);
    this.refreshQuery();
  }

  protected previousPage(): void {
    this.page.update((page) => Math.max(1, page - 1));
    this.refreshQuery();
  }

  protected nextPage(pageInfo: PagedResponse<FeatureRecord>): void {
    if (this.page() >= pageInfo.totalPages) return;

    this.page.update((page) => page + 1);
    this.refreshQuery();
  }

  protected clearFilters(): void {
    this.searchTerm.set('');
    this.statusFilter.set('all');
    this.sort.set('');
    this.page.set(1);
    this.refreshQuery();
  }

  protected selectRecord(record: FeatureRecord, config: FeatureConfig): void {
    this.selectedRecordId.set(record['id']);
    this.syncReviewForm(record, config);
  }

  protected statusOptions(config: FeatureConfig): string[] {
    return config.statusKey
      ? ['AtRisk', 'Blocked', 'Complete', 'Monitoring', 'OnTrack']
      : [];
  }

  protected statusFilterOptions(config: FeatureConfig): FormControlOption[] {
    return [
      { label: 'All statuses', value: 'all' },
      ...this.statusOptions(config).map((status) => ({
        label: this.statusLabel(status),
        value: status,
      })),
    ];
  }

  protected statusLabel(status: string): string {
    return formatStatus(status);
  }

  protected sortSelectOptions(config: FeatureConfig): FormControlOption[] {
    return [
      { label: 'Source order', value: '' },
      ...this.sortOptions(config).map((option) => ({
        label: option.label,
        value: option.value,
      })),
    ];
  }

  protected pageSizeOptions(): FormControlOption[] {
    return [
      { label: '10', value: '10' },
      { label: '25', value: '25' },
      { label: '50', value: '50' },
    ];
  }

  protected controlError(
    controlName: ReviewFormControlName,
  ): string | undefined {
    const control = this.reviewForm.controls[controlName];
    if (!control.touched || control.valid) {
      return undefined;
    }

    switch (controlName) {
      case 'status':
        return 'Choose a status before saving.';
      case 'action':
        return 'Enter at least 8 characters for the action.';
      case 'note':
        return 'Add a note of at least 12 characters.';
      case 'reviewedBy':
        return 'Enter the reviewer or role.';
    }
  }

  protected sortOptions(
    config: FeatureConfig,
  ): { value: string; label: string }[] {
    return config.columns.flatMap((column) => [
      { value: column.key, label: `${column.label} ascending` },
      { value: `-${column.key}`, label: `${column.label} descending` },
    ]);
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
    const existing = config.statusKey ? this.statusOptions(config) : [];
    return Array.from(
      new Set([...existing, 'OnTrack', 'Monitoring', 'AtRisk', 'Blocked']),
    ).sort();
  }

  private loadRecords(
    config: FeatureConfig,
  ): Observable<PagedResponse<FeatureRecord>> {
    const query = {
      page: this.page(),
      pageSize: this.pageSize(),
      search: this.searchTerm(),
      sort: this.sort(),
      status: this.statusFilter(),
    };

    switch (config.load) {
      case 'listPaymentReadiness':
        return this.transformationApi
          .listPaymentReadiness(query)
          .pipe(map(toFeaturePage));
      case 'listWarehouseSignals':
        return this.transformationApi
          .listWarehouseSignals(query)
          .pipe(map(toFeaturePage));
      case 'listHrPlatformTasks':
        return this.transformationApi
          .listHrPlatformTasks(query)
          .pipe(map(toFeaturePage));
      case 'listInsightMetrics':
        return this.transformationApi
          .listInsightMetrics(query)
          .pipe(map(toFeaturePage));
      case 'listAutomationCandidates':
        return this.transformationApi
          .listAutomationCandidates(query)
          .pipe(map(toFeaturePage));
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

  protected refreshQuery(): void {
    this.queryRefresh.next();
  }
}

function emptyPage(
  page: number,
  pageSize: number,
): PagedResponse<FeatureRecord> {
  return {
    items: [],
    page,
    pageSize,
    totalItems: 0,
    totalPages: 0,
  };
}

function toFeaturePage<T extends object>(
  page: PagedResponse<T>,
): PagedResponse<FeatureRecord> {
  return {
    ...page,
    items: page.items.map((record) => record as unknown as FeatureRecord),
  };
}
