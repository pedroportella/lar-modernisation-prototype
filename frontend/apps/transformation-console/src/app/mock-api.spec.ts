import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import {
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
});
