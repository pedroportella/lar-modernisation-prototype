import { InjectionToken } from '@angular/core';

export interface LarRuntimeConfig {
  apiBaseUrl: string;
  environmentLabel: string;
  mockApi: boolean;
}

interface WindowRuntimeConfig {
  apiBaseUrl?: string;
  environmentLabel?: string;
  mockApi?: boolean;
}

declare global {
  interface Window {
    larRuntimeConfig?: WindowRuntimeConfig;
  }
}

const defaultApiBaseUrl = 'http://localhost:5029';

export const LAR_RUNTIME_CONFIG = new InjectionToken<LarRuntimeConfig>('LAR_RUNTIME_CONFIG', {
  factory: () => runtimeConfig(),
});

export const LAR_API_BASE_URL = new InjectionToken<string>('LAR_API_BASE_URL', {
  factory: () => runtimeConfig().apiBaseUrl,
});

function runtimeConfig(): LarRuntimeConfig {
  const config = typeof window === 'undefined' ? undefined : window.larRuntimeConfig;
  const mockApi = config?.mockApi === true || config?.apiBaseUrl === 'mock';
  const apiBaseUrl = mockApi ? 'mock' : normalizeApiBaseUrl(config?.apiBaseUrl);

  return {
    apiBaseUrl,
    environmentLabel:
      cleanLabel(config?.environmentLabel) ?? (mockApi ? 'Frontend mock mode' : 'Backend API mode'),
    mockApi,
  };
}

function normalizeApiBaseUrl(value: string | undefined): string {
  const trimmed = value?.trim();

  if (!trimmed) {
    return defaultApiBaseUrl;
  }

  return trimmed.replace(/\/+$/, '');
}

function cleanLabel(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}
