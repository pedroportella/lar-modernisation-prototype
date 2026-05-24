import { InjectionToken } from '@angular/core';

export const LAR_API_BASE_URL = new InjectionToken<string>('LAR_API_BASE_URL', {
  factory: () => 'http://localhost:5029',
});
