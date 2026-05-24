import { InjectionToken } from '@angular/core';

declare global {
  interface Window {
    larRuntimeConfig?: {
      apiBaseUrl?: string;
    };
  }
}

export const LAR_API_BASE_URL = new InjectionToken<string>('LAR_API_BASE_URL', {
  factory: () => window.larRuntimeConfig?.apiBaseUrl ?? 'http://localhost:5029',
});
