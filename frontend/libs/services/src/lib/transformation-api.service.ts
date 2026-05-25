import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LAR_API_BASE_URL } from './api-config';
import {
  AutomationCandidate,
  HrPlatformTask,
  InsightMetric,
  OperationalStatus,
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

  listWorkstreams(): Observable<Workstream[]> {
    return this.http.get<Workstream[]>(`${this.apiBaseUrl}/api/workstreams`);
  }

  getWorkstream(id: string): Observable<WorkstreamDetail> {
    return this.http.get<WorkstreamDetail>(`${this.apiBaseUrl}/api/workstreams/${id}`);
  }

  listPaymentReadiness(): Observable<PaymentReadinessItem[]> {
    return this.http.get<PaymentReadinessItem[]>(
      `${this.apiBaseUrl}/api/payments/migration-readiness`,
    );
  }

  listWarehouseSignals(): Observable<WarehouseSignal[]> {
    return this.http.get<WarehouseSignal[]>(`${this.apiBaseUrl}/api/warehouse/optimisation`);
  }

  listHrPlatformTasks(): Observable<HrPlatformTask[]> {
    return this.http.get<HrPlatformTask[]>(`${this.apiBaseUrl}/api/hr/platform-uplift`);
  }

  listInsightMetrics(): Observable<InsightMetric[]> {
    return this.http.get<InsightMetric[]>(`${this.apiBaseUrl}/api/insights/wayfinding`);
  }

  listAutomationCandidates(): Observable<AutomationCandidate[]> {
    return this.http.get<AutomationCandidate[]>(`${this.apiBaseUrl}/api/automation/candidates`);
  }

  getOperationalStatus(): Observable<OperationalStatus> {
    return this.http.get<OperationalStatus>(`${this.apiBaseUrl}/api/operations/status`);
  }

  getProgramReadiness(): Observable<ProgramReadiness> {
    return this.http.get<ProgramReadiness>(`${this.apiBaseUrl}/api/program/readiness`);
  }

  getWorkflowReview(slice: string, recordId: string | number): Observable<WorkflowReview> {
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
    );
  }
}
