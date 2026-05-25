import { InjectionToken } from '@angular/core';

export interface LarRuntimeConfig {
  apiBaseUrl: string;
  environmentLabel: string;
  mockApi: boolean;
  role: LarDemoRole;
}

interface WindowRuntimeConfig {
  apiBaseUrl?: string;
  environmentLabel?: string;
  mockApi?: boolean;
  role?: string;
}

export type LarDemoRole = 'Viewer' | 'DeliveryLead' | 'Admin';

export const LAR_DEMO_ROLE_HEADER = 'X-LAR-DEMO-ROLE';

declare global {
  interface Window {
    larRuntimeConfig?: WindowRuntimeConfig;
  }
}

const defaultApiBaseUrl = 'http://localhost:5029';

export const LAR_RUNTIME_CONFIG = new InjectionToken<LarRuntimeConfig>(
  'LAR_RUNTIME_CONFIG',
  {
    factory: () => runtimeConfig(),
  },
);

export const LAR_API_BASE_URL = new InjectionToken<string>('LAR_API_BASE_URL', {
  factory: () => runtimeConfig().apiBaseUrl,
});

function runtimeConfig(): LarRuntimeConfig {
  const config =
    typeof window === 'undefined' ? undefined : window.larRuntimeConfig;
  const mockApi = config?.mockApi === true || config?.apiBaseUrl === 'mock';
  const apiBaseUrl = mockApi ? 'mock' : normalizeApiBaseUrl(config?.apiBaseUrl);

  return {
    apiBaseUrl,
    environmentLabel:
      cleanLabel(config?.environmentLabel) ??
      (mockApi ? 'Frontend mock mode' : 'Backend API mode'),
    mockApi,
    role: normalizeRole(config?.role),
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

function normalizeRole(value: string | undefined): LarDemoRole {
  const trimmed = value?.trim().toLowerCase();

  switch (trimmed) {
    case 'viewer':
      return 'Viewer';
    case 'admin':
      return 'Admin';
    case 'deliverylead':
    case 'delivery-lead':
    case 'delivery lead':
      return 'DeliveryLead';
    default:
      return 'DeliveryLead';
  }
}
