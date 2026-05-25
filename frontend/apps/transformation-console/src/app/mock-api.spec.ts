import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
  LAR_API_BASE_URL,
  LAR_RUNTIME_CONFIG,
  larMockApiInterceptor,
  mockProgramReadiness,
  mockWorkstreams,
  TransformationApiService,
} from '@lar/services';

describe('mock API mode', () => {
  beforeEach(() => {
    window.larRuntimeConfig = {
      apiBaseUrl: 'mock',
      mockApi: true,
      role: 'DeliveryLead',
    };

    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([larMockApiInterceptor]))],
    });
  });

  afterEach(() => {
    window.larRuntimeConfig = undefined;
    TestBed.resetTestingModule();
  });

  it('serves workstreams without a backend process', async () => {
    const service = TestBed.inject(TransformationApiService);

    await expect(firstValueFrom(service.listWorkstreams())).resolves.toEqual(
      mockWorkstreams,
    );
  });

  it('serves derived readiness without a backend process', async () => {
    const service = TestBed.inject(TransformationApiService);

    await expect(
      firstValueFrom(service.getProgramReadiness()),
    ).resolves.toEqual(mockProgramReadiness);
  });

  it('serves feature slices through the paged query contract', async () => {
    const service = TestBed.inject(TransformationApiService);

    await expect(
      firstValueFrom(
        service.listPaymentReadiness({
          page: 1,
          pageSize: 1,
          search: 'settlement',
          sort: '-area',
        }),
      ),
    ).resolves.toMatchObject({
      items: [{ area: 'Settlement reporting' }],
      page: 1,
      pageSize: 1,
      totalItems: 1,
      totalPages: 1,
    });
  });

  it('rejects invalid mock feature query values', async () => {
    const service = TestBed.inject(TransformationApiService);

    await expect(
      firstValueFrom(service.listPaymentReadiness({ pageSize: 500 })),
    ).rejects.toMatchObject({ status: 400 });
  });

  it('persists workflow reviews in mock mode', async () => {
    const service = TestBed.inject(TransformationApiService);

    await expect(
      firstValueFrom(
        service.saveWorkflowReview('payments', 1, {
          status: 'Blocked',
          action: 'Escalate cutover dependency',
          note: 'Reviewed with release lead and dependency owner.',
          reviewedBy: 'Delivery lead',
        }),
      ),
    ).resolves.toMatchObject({
      action: 'Escalate cutover dependency',
      recordId: 1,
      slice: 'payments',
      status: 'Blocked',
    });

    await expect(
      firstValueFrom(service.getWorkflowReview('payments', 1)),
    ).resolves.toMatchObject({
      action: 'Escalate cutover dependency',
      recordId: 1,
      slice: 'payments',
      status: 'Blocked',
    });
  });

  it('persists automation governance reviews in mock mode', async () => {
    const service = TestBed.inject(TransformationApiService);

    await expect(
      firstValueFrom(
        service.saveAutomationGovernanceReview(1, {
          triageStatus: 'ApprovedForPrototype',
          dataSensitivity: 'Internal',
          humanApprovalRequired: false,
          modelRisk: 'Medium',
          expectedBenefit: 'Reduce manual exception triage effort',
          evidenceSource: 'Discovery workshop notes',
          reviewedBy: 'Automation lead',
        }),
      ),
    ).resolves.toMatchObject({
      candidateId: 1,
      triageStatus: 'ApprovedForPrototype',
      modelRisk: 'Medium',
    });

    await expect(
      firstValueFrom(service.getAutomationGovernanceReview(1)),
    ).resolves.toMatchObject({
      candidateId: 1,
      triageStatus: 'ApprovedForPrototype',
      evidenceSource: 'Discovery workshop notes',
    });
  });

  it('normalises runtime config for mock mode', () => {
    expect(TestBed.inject(LAR_RUNTIME_CONFIG)).toEqual({
      apiBaseUrl: 'mock',
      environmentLabel: 'Frontend mock mode',
      mockApi: true,
      role: 'DeliveryLead',
    });
    expect(TestBed.inject(LAR_API_BASE_URL)).toBe('mock');
  });

  it('rejects workflow review writes for viewer role in mock mode', async () => {
    TestBed.resetTestingModule();
    window.larRuntimeConfig = {
      apiBaseUrl: 'mock',
      mockApi: true,
      role: 'Viewer',
    };
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([larMockApiInterceptor]))],
    });

    const service = TestBed.inject(TransformationApiService);

    await expect(
      firstValueFrom(
        service.saveWorkflowReview('payments', 1, {
          status: 'Blocked',
          action: 'Escalate cutover dependency',
          note: 'Reviewed with release lead and dependency owner.',
          reviewedBy: 'Delivery lead',
        }),
      ),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('normalises real API base URLs', () => {
    TestBed.resetTestingModule();
    window.larRuntimeConfig = {
      apiBaseUrl: 'http://localhost:5029/',
      environmentLabel: 'Local API',
      mockApi: false,
      role: 'Admin',
    };
    TestBed.configureTestingModule({});

    expect(TestBed.inject(LAR_RUNTIME_CONFIG)).toEqual({
      apiBaseUrl: 'http://localhost:5029',
      environmentLabel: 'Local API',
      mockApi: false,
      role: 'Admin',
    });
    expect(TestBed.inject(LAR_API_BASE_URL)).toBe('http://localhost:5029');
  });
});
