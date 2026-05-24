import { Route } from '@angular/router';
import { DashboardPageComponent } from './dashboard/dashboard-page.component';
import { FeatureSlicePageComponent } from './features/feature-slice-page.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: DashboardPageComponent,
    title: 'Transformation Delivery Console',
  },
  {
    path: 'payments',
    component: FeatureSlicePageComponent,
    title: 'Payment Migration Readiness',
    data: { slice: 'payments' },
  },
  {
    path: 'warehouse',
    component: FeatureSlicePageComponent,
    title: 'Warehouse Optimisation',
    data: { slice: 'warehouse' },
  },
  {
    path: 'hr-platform',
    component: FeatureSlicePageComponent,
    title: 'HR Platform Uplift',
    data: { slice: 'hr' },
  },
  {
    path: 'insights',
    component: FeatureSlicePageComponent,
    title: 'Wayfinding Insights',
    data: { slice: 'insights' },
  },
  {
    path: 'automation',
    component: FeatureSlicePageComponent,
    title: 'Automation Opportunity Queue',
    data: { slice: 'automation' },
  },
];
