import {
  HttpErrorResponse,
  HttpInterceptorFn,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, of, throwError } from 'rxjs';
import { LAR_DEMO_ROLE_HEADER, LAR_RUNTIME_CONFIG } from './api-config';
import {
  mockAutomationCandidates,
  mockHrPlatformTasks,
  mockInsightMetrics,
  mockOperationsStatus,
  mockPaymentReadiness,
  mockProgramReadiness,
  mockWarehouseSignals,
  mockWorkstreamDetails,
  mockWorkstreams,
} from './mock-api.fixtures';
import { WorkflowReview, WorkflowReviewRequest } from './workstream.models';

const mockRoutes: Record<string, unknown> = {
  '/api/workstreams': mockWorkstreams,
  '/api/payments/migration-readiness': mockPaymentReadiness,
  '/api/warehouse/optimisation': mockWarehouseSignals,
  '/api/hr/platform-uplift': mockHrPlatformTasks,
  '/api/insights/wayfinding': mockInsightMetrics,
  '/api/automation/candidates': mockAutomationCandidates,
  '/api/operations/status': mockOperationsStatus,
  '/api/program/readiness': mockProgramReadiness,
};

const workflowReviews = new Map<string, WorkflowReview>();
let workflowReviewId = 1;

export const larMockApiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!inject(LAR_RUNTIME_CONFIG).mockApi) {
    return next(request);
  }

  const path = apiPathFromUrl(request.url);
  const response = mockResponseForRequest(
    request.method,
    path,
    request.headers.get(LAR_DEMO_ROLE_HEADER),
    request.body,
  );

  if (response === undefined) {
    return next(request);
  }

  if (response instanceof HttpErrorResponse) {
    return throwError(() => response);
  }

  const httpResponse = new HttpResponse({
    body: cloneMock(response.body),
    status: response.status,
  });

  return request.method === 'POST' && path.startsWith('/api/workflow-reviews/')
    ? of(httpResponse).pipe(delay(150))
    : of(httpResponse);
};

function mockResponseForRequest(
  method: string,
  path: string,
  role: string | null,
  body: unknown,
): { body: unknown; status: number } | HttpErrorResponse | undefined {
  const workflowReviewMatch = path.match(
    /^\/api\/workflow-reviews\/([^/]+)\/([^/]+)$/,
  );

  if (workflowReviewMatch) {
    return mockWorkflowReviewResponse(
      method,
      workflowReviewMatch[1],
      workflowReviewMatch[2],
      role,
      body,
    );
  }

  if (method !== 'GET') {
    return undefined;
  }

  const workstreamDetailMatch = path.match(/^\/api\/workstreams\/([^/]+)$/);

  if (workstreamDetailMatch) {
    return {
      body: mockWorkstreamDetails.find(
        (workstream) => workstream.id === workstreamDetailMatch[1],
      ),
      status: 200,
    };
  }

  const routeBody = mockRoutes[path];

  return routeBody === undefined ? undefined : { body: routeBody, status: 200 };
}

function mockWorkflowReviewResponse(
  method: string,
  slice: string,
  recordId: string,
  role: string | null,
  body: unknown,
): { body: unknown; status: number } | HttpErrorResponse {
  const key = `${slice}:${recordId}`;

  if (method === 'GET') {
    const review = workflowReviews.get(key);

    return review
      ? { body: review, status: 200 }
      : new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
  }

  if (method !== 'POST') {
    return new HttpErrorResponse({
      status: 405,
      statusText: 'Method Not Allowed',
    });
  }

  if (!['DeliveryLead', 'Admin'].includes(role ?? '')) {
    return new HttpErrorResponse({
      status: 403,
      statusText: 'Forbidden',
    });
  }

  const request = body as WorkflowReviewRequest;

  if (request.note.toLowerCase().includes('api failure')) {
    return new HttpErrorResponse({
      status: 500,
      statusText: 'Mock API failure',
    });
  }

  const review: WorkflowReview = {
    id: workflowReviewId++,
    slice,
    recordId: Number(recordId),
    status: request.status,
    action: request.action,
    note: request.note,
    reviewedBy: request.reviewedBy,
    reviewedAtUtc: new Date().toISOString(),
  };

  workflowReviews.set(key, review);

  return { body: review, status: 201 };
}

function apiPathFromUrl(url: string): string {
  const apiIndex = url.indexOf('/api/');

  if (apiIndex >= 0) {
    return url.slice(apiIndex);
  }

  return url.startsWith('/api/') ? url : `/${url.replace(/^mock\/?/, '')}`;
}

function cloneMock<T>(body: T): T {
  return JSON.parse(JSON.stringify(body)) as T;
}
