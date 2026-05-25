import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { of } from 'rxjs';
import { LAR_RUNTIME_CONFIG } from './api-config';
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

export const larMockApiInterceptor: HttpInterceptorFn = (request, next) => {
  if (!inject(LAR_RUNTIME_CONFIG).mockApi) {
    return next(request);
  }

  const path = apiPathFromUrl(request.url);
  const body = mockResponseForPath(path);

  if (body === undefined) {
    return next(request);
  }

  return of(new HttpResponse({ body: cloneMock(body), status: 200 }));
};

function mockResponseForPath(path: string): unknown {
  const workstreamDetailMatch = path.match(/^\/api\/workstreams\/([^/]+)$/);

  if (workstreamDetailMatch) {
    return mockWorkstreamDetails.find((workstream) => workstream.id === workstreamDetailMatch[1]);
  }

  return mockRoutes[path];
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
