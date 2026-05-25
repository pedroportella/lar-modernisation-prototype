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

    await expect(firstValueFrom(service.listWorkstreams())).resolves.toEqual(mockWorkstreams);
  });

  it('serves derived readiness without a backend process', async () => {
    const service = TestBed.inject(TransformationApiService);

    await expect(firstValueFrom(service.getProgramReadiness())).resolves.toEqual(
      mockProgramReadiness,
    );
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

    await expect(firstValueFrom(service.getWorkflowReview('payments', 1))).resolves.toMatchObject({
      action: 'Escalate cutover dependency',
      recordId: 1,
      slice: 'payments',
      status: 'Blocked',
    });
  });

  it('normalises runtime config for mock mode', () => {
    expect(TestBed.inject(LAR_RUNTIME_CONFIG)).toEqual({
      apiBaseUrl: 'mock',
      environmentLabel: 'Frontend mock mode',
      mockApi: true,
    });
    expect(TestBed.inject(LAR_API_BASE_URL)).toBe('mock');
  });

  it('normalises real API base URLs', () => {
    TestBed.resetTestingModule();
    window.larRuntimeConfig = {
      apiBaseUrl: 'http://localhost:5029/',
      environmentLabel: 'Local API',
      mockApi: false,
    };
    TestBed.configureTestingModule({});

    expect(TestBed.inject(LAR_RUNTIME_CONFIG)).toEqual({
      apiBaseUrl: 'http://localhost:5029',
      environmentLabel: 'Local API',
      mockApi: false,
    });
    expect(TestBed.inject(LAR_API_BASE_URL)).toBe('http://localhost:5029');
  });
});
