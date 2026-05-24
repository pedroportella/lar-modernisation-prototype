import { test, expect } from '@playwright/test';

const workstreams = [
  {
    id: 'payments',
    name: 'Payments Migration',
    status: 'AtRisk',
    summary: 'Move payments onto the modern provider boundary.',
    priority: 1,
  },
  {
    id: 'warehouse',
    name: 'Warehouse Optimisation',
    status: 'OnTrack',
    summary: 'Reduce dispatch friction across fulfilment centres.',
    priority: 2,
  },
];

const featureResponses: Record<string, unknown[]> = {
  '/api/payments/migration-readiness': [
    {
      id: 1,
      area: 'Token migration',
      status: 'AtRisk',
      risk: 'Provider cutover',
      owner: 'Payments lead',
      nextAction: 'Validate dual-write plan',
    },
  ],
  '/api/warehouse/optimisation': [
    {
      id: 1,
      signalName: 'Pick exceptions',
      currentValue: 14,
      unit: 'per shift',
      status: 'OnTrack',
      opportunity: 'Target bin-location corrections',
    },
  ],
  '/api/hr/platform-uplift': [
    {
      id: 1,
      taskName: 'Role mapping',
      status: 'Blocked',
      processRisk: 'Payroll approval dependency',
      owner: 'People systems lead',
    },
  ],
  '/api/insights/wayfinding': [
    {
      id: 1,
      metricName: 'Decision latency',
      value: 3,
      unit: 'days',
      status: 'AtRisk',
    },
  ],
  '/api/automation/candidates': [
    {
      id: 1,
      workflowName: 'Supplier onboarding triage',
      valueScore: 8,
      effortScore: 3,
      riskClass: 'Medium',
      recommendedNextStep: 'Run governance review',
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/workstreams', async (route) => {
    await route.fulfill({ json: workstreams });
  });

  for (const [path, records] of Object.entries(featureResponses)) {
    await page.route(`**${path}`, async (route) => {
      await route.fulfill({ json: records });
    });
  }
});

test('renders dashboard workstreams from the API boundary', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Transformation Delivery Console' })).toBeVisible();
  await expect(page.getByText('Payments Migration')).toBeVisible();
  await expect(page.getByText('Warehouse Optimisation')).toBeVisible();
  await expect(page.getByText('Needs attention')).toBeVisible();
  await expect(page.getByText('Unable to reach the backend API.')).toBeHidden();
});

test.describe('feature slices', () => {
  const routes = [
    ['/payments', 'Migration Readiness', 'Token migration'],
    ['/warehouse', 'Operational Signals', 'Pick exceptions'],
    ['/hr-platform', 'Platform Tasks', 'Role mapping'],
    ['/insights', 'Decision Metrics', 'Decision latency'],
    ['/automation', 'Opportunity Queue', 'Supplier onboarding triage'],
  ] as const;

  for (const [route, heading, expectedRecord] of routes) {
    test(`renders ${route} with API records`, async ({ page }) => {
      await page.goto(route);

      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
      await expect(page.locator('tbody tr')).toHaveCount(1);
      await expect(page.getByText(expectedRecord)).toBeVisible();
      await expect(page.getByText('Unable to reach the backend API.')).toBeHidden();
    });
  }
});
