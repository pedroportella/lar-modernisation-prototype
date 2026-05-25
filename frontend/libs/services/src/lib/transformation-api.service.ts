import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  LAR_API_BASE_URL,
  LAR_DEMO_ROLE_HEADER,
  LAR_RUNTIME_CONFIG,
} from './api-config';
import {
  AutomationCandidate,
  FeatureQuery,
  HrPlatformTask,
  InsightMetric,
  OperationalStatus,
  PagedResponse,
  PaymentReadinessItem,
  ProgramReadiness,
  WarehouseSignal,
  Workstream,
  WorkstreamDetail,
  WorkflowReview,
  WorkflowReviewRequest,
} from './workstream.models';

@Injectable({ providedIn: 'root' })
export class TransformationApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(LAR_API_BASE_URL);
  private readonly runtimeConfig = inject(LAR_RUNTIME_CONFIG);

  listWorkstreams(): Observable<Workstream[]> {
    return this.http.get<Workstream[]>(`${this.apiBaseUrl}/api/workstreams`);
  }

  getWorkstream(id: string): Observable<WorkstreamDetail> {
    return this.http.get<WorkstreamDetail>(
      `${this.apiBaseUrl}/api/workstreams/${id}`,
    );
  }

  listPaymentReadiness(
    query: FeatureQuery = {},
  ): Observable<PagedResponse<PaymentReadinessItem>> {
    return this.http.get<PagedResponse<PaymentReadinessItem>>(
      `${this.apiBaseUrl}/api/payments/migration-readiness`,
      { params: featureQueryParams(query) },
    );
  }

  listWarehouseSignals(
    query: FeatureQuery = {},
  ): Observable<PagedResponse<WarehouseSignal>> {
    return this.http.get<PagedResponse<WarehouseSignal>>(
      `${this.apiBaseUrl}/api/warehouse/optimisation`,
      { params: featureQueryParams(query) },
    );
  }

  listHrPlatformTasks(
    query: FeatureQuery = {},
  ): Observable<PagedResponse<HrPlatformTask>> {
    return this.http.get<PagedResponse<HrPlatformTask>>(
      `${this.apiBaseUrl}/api/hr/platform-uplift`,
      { params: featureQueryParams(query) },
    );
  }

  listInsightMetrics(
    query: FeatureQuery = {},
  ): Observable<PagedResponse<InsightMetric>> {
    return this.http.get<PagedResponse<InsightMetric>>(
      `${this.apiBaseUrl}/api/insights/wayfinding`,
      { params: featureQueryParams(query) },
    );
  }

  listAutomationCandidates(
    query: FeatureQuery = {},
  ): Observable<PagedResponse<AutomationCandidate>> {
    return this.http.get<PagedResponse<AutomationCandidate>>(
      `${this.apiBaseUrl}/api/automation/candidates`,
      { params: featureQueryParams(query) },
    );
  }

  getOperationalStatus(): Observable<OperationalStatus> {
    return this.http.get<OperationalStatus>(
      `${this.apiBaseUrl}/api/operations/status`,
    );
  }

  getProgramReadiness(): Observable<ProgramReadiness> {
    return this.http.get<ProgramReadiness>(
      `${this.apiBaseUrl}/api/program/readiness`,
    );
  }

  getWorkflowReview(
    slice: string,
    recordId: string | number,
  ): Observable<WorkflowReview> {
    return this.http.get<WorkflowReview>(
      `${this.apiBaseUrl}/api/workflow-reviews/${encodeURIComponent(slice)}/${recordId}`,
    );
  }

  saveWorkflowReview(
    slice: string,
    recordId: string | number,
    request: WorkflowReviewRequest,
  ): Observable<WorkflowReview> {
    return this.http.post<WorkflowReview>(
      `${this.apiBaseUrl}/api/workflow-reviews/${encodeURIComponent(slice)}/${recordId}`,
      request,
      {
        headers: {
          [LAR_DEMO_ROLE_HEADER]: this.runtimeConfig.role,
        },
      },
    );
  }
}

function featureQueryParams(query: FeatureQuery): HttpParams {
  let params = new HttpParams();

  for (const [key, value] of Object.entries(query)) {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === 'all'
    )
      continue;

    params = params.set(key, String(value));
  }

  return params;
}
