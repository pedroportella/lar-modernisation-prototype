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
import {
  FeatureQuery,
  PagedResponse,
  WorkflowReview,
  WorkflowReviewRequest,
} from './workstream.models';

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

  const apiRequest = apiRequestFromUrl(request.urlWithParams);
  const response = mockResponseForRequest(
    request.method,
    apiRequest.path,
    apiRequest.searchParams,
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

  return request.method === 'POST' &&
    apiRequest.path.startsWith('/api/workflow-reviews/')
    ? of(httpResponse).pipe(delay(150))
    : of(httpResponse);
};

function mockResponseForRequest(
  method: string,
  path: string,
  searchParams: URLSearchParams,
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

  if (routeBody !== undefined && isFeatureRoute(path)) {
    const response = mockPagedFeatureResponse(
      routeBody as Record<string, string | number>[],
      searchParams,
    );

    return response instanceof HttpErrorResponse
      ? response
      : { body: response, status: 200 };
  }

  return routeBody === undefined ? undefined : { body: routeBody, status: 200 };
}

function isFeatureRoute(path: string): boolean {
  return [
    '/api/payments/migration-readiness',
    '/api/warehouse/optimisation',
    '/api/hr/platform-uplift',
    '/api/insights/wayfinding',
    '/api/automation/candidates',
  ].includes(path);
}

function mockPagedFeatureResponse<T extends Record<string, string | number>>(
  records: T[],
  searchParams: URLSearchParams,
): PagedResponse<T> | HttpErrorResponse {
  const query: Required<FeatureQuery> = {
    search: searchParams.get('search') ?? '',
    status: searchParams.get('status') ?? '',
    page: Number(searchParams.get('page') ?? 1),
    pageSize: Number(searchParams.get('pageSize') ?? 25),
    sort: searchParams.get('sort') ?? '',
  };
  const sort = query.sort.startsWith('-') ? query.sort.slice(1) : query.sort;

  if (!Number.isInteger(query.page) || query.page < 1) {
    return new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
  }

  if (
    !Number.isInteger(query.pageSize) ||
    query.pageSize < 1 ||
    query.pageSize > 50
  ) {
    return new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
  }

  if (sort && !Object.keys(records[0] ?? {}).includes(sort)) {
    return new HttpErrorResponse({ status: 400, statusText: 'Bad Request' });
  }

  let filtered = records;
  const search = query.search.trim().toLowerCase();

  if (search) {
    filtered = filtered.filter((record) =>
      Object.values(record).some((value) =>
        String(value).toLowerCase().includes(search),
      ),
    );
  }

  if (query.status && query.status !== 'all') {
    filtered = filtered.filter(
      (record) => String(record['status']) === query.status,
    );
  }

  if (sort) {
    const direction = query.sort.startsWith('-') ? -1 : 1;

    filtered = [...filtered].sort(
      (left, right) =>
        String(left[sort]).localeCompare(String(right[sort]), undefined, {
          numeric: true,
        }) * direction,
    );
  }

  const totalItems = filtered.length;
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / query.pageSize);
  const startIndex = (query.page - 1) * query.pageSize;

  return {
    items: filtered.slice(startIndex, startIndex + query.pageSize),
    page: query.page,
    pageSize: query.pageSize,
    totalItems,
    totalPages,
  };
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

function apiRequestFromUrl(url: string): {
  path: string;
  searchParams: URLSearchParams;
} {
  const parsed = new URL(url, 'http://mock.local');
  const apiIndex = url.indexOf('/api/');

  if (apiIndex >= 0) {
    return {
      path: url.slice(apiIndex).split('?')[0],
      searchParams: parsed.searchParams,
    };
  }

  const path = url.startsWith('/api/')
    ? parsed.pathname
    : `/${url.replace(/^mock\/?/, '').split('?')[0]}`;

  return {
    path,
    searchParams: parsed.searchParams,
  };
}

function cloneMock<T>(body: T): T {
  return JSON.parse(JSON.stringify(body)) as T;
}
