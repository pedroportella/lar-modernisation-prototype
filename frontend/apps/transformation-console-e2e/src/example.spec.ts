import { test, expect } from '@playwright/test';
import {
  mockAutomationCandidates,
  mockHrPlatformTasks,
  mockInsightMetrics,
  mockPaymentReadiness,
  mockWarehouseSignals,
} from '@lar/mock-api-fixtures';

test('renders dashboard workstreams from the API boundary', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Transformation Delivery Console' })).toBeVisible();
  await expect(page.getByText('Payments Migration')).toBeVisible();
  await expect(page.getByText('Warehouse Optimisation')).toBeVisible();
  await expect(page.getByText('Needs attention')).toBeVisible();
  await expect(page.getByText('Unable to reach the backend API.')).toBeHidden();
});

test('renders operations status from the API boundary', async ({ page }) => {
  await page.goto('/operations');

  await expect(page.getByRole('heading', { name: 'Runtime Status' })).toBeVisible();
  await expect(page.getByText('Mock data Available')).toBeVisible();
  await expect(page.getByText('Payment readiness')).toBeVisible();
  await expect(page.getByText('Unable to reach the backend API.')).toBeHidden();
});

test('renders program readiness from derived API posture', async ({ page }) => {
  await page.goto('/readiness');

  await expect(page.getByRole('heading', { name: 'Delivery Readiness' })).toBeVisible();
  await expect(page.getByText('66')).toBeVisible();
  await expect(page.getByText('Needs attention')).toBeVisible();
  await expect(page.getByText('Cutover readiness review')).toBeVisible();
  await expect(page.getByText('Unable to reach the backend API.')).toBeHidden();
});

test.describe('feature slices', () => {
  const routes = [
    ['/payments', 'Migration Readiness', 'Token migration', mockPaymentReadiness.length],
    ['/warehouse', 'Operational Signals', 'Pick exceptions', mockWarehouseSignals.length],
    ['/hr-platform', 'Platform Tasks', 'Role mapping', mockHrPlatformTasks.length],
    ['/insights', 'Decision Metrics', 'Decision latency', mockInsightMetrics.length],
    [
      '/automation',
      'Opportunity Queue',
      'Supplier onboarding triage',
      mockAutomationCandidates.length,
    ],
  ] as const;

  for (const [route, heading, expectedRecord, recordCount] of routes) {
    test(`renders ${route} with API records`, async ({ page }) => {
      await page.goto(route);

      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
      await expect(page.locator('tbody tr')).toHaveCount(recordCount);
      await expect(page.getByRole('button', { name: expectedRecord })).toBeVisible();
      await expect(page.getByText('Unable to reach the backend API.')).toBeHidden();
    });
  }

  test('filters feature records and updates the detail panel', async ({ page }) => {
    await page.goto('/payments');

    await expect(page.getByRole('heading', { name: 'Migration Readiness' })).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(mockPaymentReadiness.length);

    await page.getByLabel('Status').selectOption('AtRisk');
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Token migration' })).toBeVisible();
    await expect(page.getByLabel('Selected record detail')).toContainText('Provider cutover sequencing');

    await page.getByLabel('Search').fill('settlement');
    await expect(page.getByText('No matching records')).toBeVisible();

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator('tbody tr')).toHaveCount(mockPaymentReadiness.length);

    await page.getByRole('button', { name: 'Settlement reporting' }).click();
    await expect(page.getByLabel('Selected record detail')).toContainText('Finance reconciliation timing');
  });
});
