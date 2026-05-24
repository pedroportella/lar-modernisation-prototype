import { Route } from '@angular/router';
import { DashboardPageComponent } from './dashboard/dashboard-page.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: DashboardPageComponent,
    title: 'Transformation Delivery Console',
  },
];
