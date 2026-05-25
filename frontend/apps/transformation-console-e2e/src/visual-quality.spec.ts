import { expect, test, type Page, type TestInfo } from '@playwright/test';

const coreRoutes = [
  ['dashboard', '/', 'Transformation Delivery Console'],
  ['readiness', '/readiness', 'Delivery Readiness'],
  ['operations', '/operations', 'Runtime Status'],
  ['payments', '/payments', 'Migration Readiness'],
  ['warehouse', '/warehouse', 'Operational Signals'],
  ['hr-platform', '/hr-platform', 'Platform Tasks'],
  ['insights', '/insights', 'Decision Metrics'],
  ['automation', '/automation', 'Opportunity Queue'],
] as const;

type ViewportSize = {
  height: number;
  name: string;
  width: number;
};

const viewports: ViewportSize[] = [
  { height: 960, name: 'desktop', width: 1440 },
  { height: 844, name: 'mobile', width: 390 },
];

async function expectNoPageOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const pageWidth = Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
    );
    const offenders = Array.from(
      document.querySelectorAll(
        [
          '.sidebar',
          '.brand',
          '.primary-nav',
          '.primary-nav a',
          '.workspace',
          '.workspace-bar',
          'main',
          'lar-page-frame',
          'lar-summary-metric',
          '.metrics',
          '.summary',
          '.hero-metrics',
          '.signals',
          '.filters',
          '.table-wrap',
          '.data-layout',
          '.detail-panel',
          '.workflow-form',
          '.workflow-actions',
          'button',
        ].join(','),
      ),
    )
      .map((element) => {
        const box = element.getBoundingClientRect();

        return {
          descriptor:
            element.getAttribute('aria-label') ||
            element.getAttribute('class') ||
            element.tagName.toLowerCase(),
          left: Math.floor(box.left),
          right: Math.ceil(box.right),
          tag: element.tagName.toLowerCase(),
        };
      })
      .filter((box) => box.right > viewportWidth + 1 || box.left < -1);

    return {
      offenders,
      pageWidth,
      viewportWidth,
    };
  });

  expect(
    overflow.pageWidth,
    `Page width should fit viewport: ${JSON.stringify(overflow)}`,
  ).toBeLessThanOrEqual(overflow.viewportWidth + 1);
  expect(overflow.offenders).toEqual([]);
}

async function captureRoute(
  page: Page,
  testInfo: TestInfo,
  routeName: string,
  viewport: ViewportSize,
) {
  await page.screenshot({
    fullPage: true,
    path: testInfo.outputPath(`${routeName}-${viewport.name}.png`),
  });
}

test.describe('visual quality gates', () => {
  for (const viewport of viewports) {
    test(`keeps core routes inside the ${viewport.name} viewport`, async ({
      page,
    }) => {
      await page.setViewportSize({
        height: viewport.height,
        width: viewport.width,
      });

      for (const [, route, heading] of coreRoutes) {
        await page.goto(route);
        await expect(
          page.getByRole('heading', { name: heading }),
        ).toBeVisible();
        await expectNoPageOverflow(page);
      }
    });
  }

  test('captures dashboard shell at desktop and mobile sizes', async ({
    page,
  }, testInfo) => {
    for (const viewport of viewports) {
      await page.setViewportSize({
        height: viewport.height,
        width: viewport.width,
      });
      await page.goto('/');
      await expect(
        page.getByRole('link', { name: 'Dashboard home' }),
      ).toBeVisible();
      await expect(
        page.getByRole('navigation', { name: 'Workspace' }),
      ).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Transformation Delivery Console' }),
      ).toBeVisible();
      await expectNoPageOverflow(page);
      await captureRoute(page, testInfo, 'dashboard-shell', viewport);
    }
  });

  test('captures readiness route at desktop and mobile sizes', async ({
    page,
  }, testInfo) => {
    for (const viewport of viewports) {
      await page.setViewportSize({
        height: viewport.height,
        width: viewport.width,
      });
      await page.goto('/readiness');
      await expect(
        page.getByRole('heading', { name: 'Delivery Readiness' }),
      ).toBeVisible();
      await expect(page.getByLabel('Readiness summary')).toBeVisible();
      await expect(page.getByLabel('Recommended next actions')).toBeVisible();
      await expectNoPageOverflow(page);
      await captureRoute(page, testInfo, 'readiness-route', viewport);
    }
  });
});
