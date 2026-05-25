import { InjectionToken } from '@angular/core';

declare global {
  interface Window {
    larRuntimeConfig?: {
      apiBaseUrl?: string;
      mockApi?: boolean;
    };
  }
}

export const LAR_API_BASE_URL = new InjectionToken<string>('LAR_API_BASE_URL', {
  factory: () => {
    if (window.larRuntimeConfig?.mockApi) {
      return 'mock';
    }

    return window.larRuntimeConfig?.apiBaseUrl ?? 'http://localhost:5029';
  },
});
