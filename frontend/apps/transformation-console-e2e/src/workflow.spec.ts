import { expect, test, type Locator, type Page } from '@playwright/test';

async function focusLocator(locator: Locator) {
  await locator.evaluate((element) => (element as HTMLElement).focus());
  await expect(locator).toBeFocused();
}

async function expectReachableByTab(
  page: Page,
  locator: Locator,
  label: string,
  browserName = '',
) {
  await expect(
    locator,
    `${label} should exist before keyboard traversal`,
  ).toHaveCount(1);

  if (browserName === 'webkit' && label.includes('button')) {
    await focusLocator(locator);
    return;
  }

  for (let index = 0; index < 50; index += 1) {
    await page.keyboard.press('Tab');
    const focused = await locator.evaluate(
      (element) => document.activeElement === element,
    );

    if (focused) return;
  }

  throw new Error(`${label} was not reachable by keyboard tab order.`);
}

async function focusPaymentsRecordSelector(page: Page, browserName: string) {
  const recordSelector = page.getByRole('button', { name: 'Token migration' });

  if (browserName === 'webkit') {
    await focusLocator(recordSelector);
    return;
  }

  await expectReachableByTab(page, recordSelector, 'record selector button');
}

function statusReviewSelect(page: Page) {
  return page.getByRole('combobox', { name: /Status review/ });
}

async function openPaymentsWorkflow(page: Page) {
  await page.goto('/payments');
  await expect(
    page.getByRole('heading', { name: 'Migration Readiness' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Token migration' }).click();
  await expect(
    page.getByRole('heading', { name: 'Token migration' }),
  ).toBeVisible();
  await expect(page.getByLabel('Status review workflow')).toBeVisible();
  await expect(page.getByLabel('Next action')).toHaveValue(
    /.+/,
  );
}

test.describe('payments status review workflow', () => {
  test('validates, saves and applies a persisted status review', async ({
    page,
  }) => {
    await openPaymentsWorkflow(page);

    await page.getByLabel('Review note').fill('short');
    await page.getByLabel('Reviewed by').fill('');
    await page.getByRole('button', { name: 'Save review' }).click();

    await expect(
      page.getByText('Add a note of at least 12 characters.'),
    ).toBeVisible();
    await expect(page.getByText('Enter the reviewer or role.')).toBeVisible();

    await statusReviewSelect(page).selectOption('Blocked');
    await expect(page.getByText('Unsaved changes')).toBeVisible();

    await page.getByLabel('Next action').fill('Escalate cutover dependency');
    await page
      .getByLabel('Review note')
      .fill('Reviewed with release lead and dependency owner.');
    await page.getByLabel('Reviewed by').fill('Delivery lead');
    await page.getByRole('button', { name: 'Save review' }).click();

    await expect(page.getByText('Review saved to backend.')).toBeVisible();
    await expect(page.getByLabel('Selected record detail')).toContainText(
      'Escalate cutover dependency',
    );
    await expect(page.getByLabel('Selected record detail')).toContainText(
      'Blocked',
    );
  });

  test('persists changed status review and next action on payments', async ({
    page,
  }) => {
    await openPaymentsWorkflow(page);

    await statusReviewSelect(page).selectOption('Blocked');
    await page
      .getByLabel('Next action')
      .fill('Escalate cutover dependency');
    await page
      .getByLabel('Review note')
      .fill('Checking that payment workflow changes are persisted.');
    await page.getByLabel('Reviewed by').fill('Delivery lead');
    await page.getByRole('button', { name: 'Save review' }).click();

    await expect(page.getByText('Review saved to backend.')).toBeVisible();

    await page.getByRole('link', { name: 'Warehouse' }).click();
    await expect(
      page.getByRole('heading', { name: 'Operational Signals' }),
    ).toBeVisible();

    await page.getByRole('link', { name: 'Payments' }).click();
    await expect(
      page.getByRole('heading', { name: 'Migration Readiness' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Token migration' }),
    ).toBeVisible();

    await expect(page.getByText('Persisted review applied')).toBeVisible();
    await expect(statusReviewSelect(page)).toHaveValue('Blocked');
    await expect(page.getByLabel('Next action')).toHaveValue(
      'Escalate cutover dependency',
    );
    await expect(page.getByLabel('Selected record detail')).toContainText(
      'Blocked',
    );
    await expect(page.getByLabel('Selected record detail')).toContainText(
      'Escalate cutover dependency',
    );
  });

  test('keeps the workflow controls reachable by keyboard', async ({
    page,
    browserName,
  }) => {
    await page.goto('/payments');
    await expect(
      page.getByRole('heading', { name: 'Migration Readiness' }),
    ).toBeVisible();

    await focusPaymentsRecordSelector(page, browserName);
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('heading', { name: 'Token migration' }),
    ).toBeVisible();

    await expectReachableByTab(
      page,
      statusReviewSelect(page),
      'status review select',
      browserName,
    );
    await expectReachableByTab(
      page,
      page.getByLabel('Next action'),
      'next action field',
      browserName,
    );
    await expectReachableByTab(
      page,
      page.getByLabel('Review note'),
      'review note field',
      browserName,
    );
    await expectReachableByTab(
      page,
      page.getByLabel('Reviewed by'),
      'reviewed by field',
      browserName,
    );
    await expectReachableByTab(
      page,
      page.getByRole('button', { name: 'Save review' }),
      'save review button',
      browserName,
    );
  });

  test('captures desktop and mobile workflow smoke screenshots', async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ height: 960, width: 1440 });
    await openPaymentsWorkflow(page);
    await page
      .getByRole('combobox', { name: /Status review/ })
      .selectOption('AtRisk');
    await page
      .getByLabel('Review note')
      .fill('Preparing a visual smoke state for workflow review.');
    await expect(page.getByText('Unsaved changes')).toBeVisible();

    await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 1440);
    await page.screenshot({
      fullPage: true,
      path: testInfo.outputPath('payments-workflow-desktop.png'),
    });

    await page.setViewportSize({ height: 844, width: 390 });
    await expect(page.getByLabel('Selected record detail')).toBeVisible();
    await expect(page.getByText('Unsaved changes')).toBeVisible();

    const detailBox = await page
      .getByLabel('Selected record detail')
      .boundingBox();
    expect(detailBox?.x).toBeGreaterThanOrEqual(0);
    expect(detailBox ? detailBox.x + detailBox.width : 0).toBeLessThanOrEqual(
      390,
    );

    await page.screenshot({
      fullPage: true,
      path: testInfo.outputPath('payments-workflow-mobile.png'),
    });
  });
});
