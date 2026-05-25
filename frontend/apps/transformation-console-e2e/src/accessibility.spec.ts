import { expect, test, type Locator, type Page } from '@playwright/test';

const routes = [
  '/',
  '/readiness',
  '/operations',
  '/payments',
  '/warehouse',
  '/hr-platform',
  '/insights',
  '/automation',
];

async function pageAccessibilityIssues(page: Page) {
  return page.evaluate(() => {
    const issues: string[] = [];
    const accessibleName = (element: Element) => {
      const id = element.getAttribute('id');
      const labelledBy = element.getAttribute('aria-labelledby');
      const labelText = id
        ? Array.from(document.querySelectorAll(`label[for="${CSS.escape(id)}"]`))
            .map((label) => label.textContent?.trim())
            .filter(Boolean)
            .join(' ')
        : '';
      const labelledByText = labelledBy
        ? labelledBy
            .split(/\s+/)
            .map((labelId) => document.getElementById(labelId)?.textContent?.trim())
            .filter(Boolean)
            .join(' ')
        : '';

      return [
        element.getAttribute('aria-label'),
        labelledByText,
        labelText,
        element.getAttribute('title'),
        element.getAttribute('placeholder'),
        element.textContent?.trim(),
        element instanceof HTMLInputElement ? element.value : '',
      ]
        .filter(Boolean)
        .join(' ')
        .trim();
    };

    const requiredLandmarks = [
      ['main', 'main, [role="main"]'],
      ['navigation', 'nav, [role="navigation"]'],
      ['complementary sidebar', 'aside, [role="complementary"]'],
    ] as const;

    requiredLandmarks.forEach(([name, selector]) => {
      if (!document.querySelector(selector)) {
        issues.push(`Missing ${name} landmark`);
      }
    });

    if (document.querySelectorAll('main, [role="main"]').length !== 1) {
      issues.push('Expected exactly one main landmark');
    }

    const h1Count = document.querySelectorAll('h1').length;
    if (h1Count !== 1) {
      issues.push(`Expected exactly one h1, found ${h1Count}`);
    }

    document.querySelectorAll('img').forEach((image) => {
      if (!image.hasAttribute('alt')) {
        issues.push(`Image missing alt text: ${image.getAttribute('src') ?? 'unknown src'}`);
      }
    });

    document.querySelectorAll('input, select, textarea').forEach((control) => {
      const type = control.getAttribute('type');
      if (type === 'hidden' || type === 'submit' || type === 'button') return;

      if (!accessibleName(control)) {
        issues.push(`Form control missing accessible name: ${control.outerHTML.slice(0, 80)}`);
      }
    });

    document.querySelectorAll('button, a[href], [role="button"]').forEach((control) => {
      if (!accessibleName(control)) {
        issues.push(
          `Interactive control missing accessible name: ${control.outerHTML.slice(0, 80)}`,
        );
      }
    });

    document.querySelectorAll('ul > a[href], ol > a[href]').forEach((link) => {
      issues.push(`List link must be wrapped in li: ${link.outerHTML.slice(0, 80)}`);
    });

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      const targetId = link.getAttribute('href')?.slice(1);
      if (targetId && !document.getElementById(targetId)) {
        issues.push(`Skip link target missing: #${targetId}`);
      }
    });

    const ids = new Set<string>();
    document.querySelectorAll('[id]').forEach((element) => {
      if (ids.has(element.id)) {
        issues.push(`Duplicate id: ${element.id}`);
      }
      ids.add(element.id);
    });

    return issues;
  });
}

async function expectReachableByTab(page: Page, locator: Locator, label: string) {
  await expect(locator, `${label} should exist before keyboard traversal`).toHaveCount(1);

  for (let index = 0; index < 40; index += 1) {
    await page.keyboard.press('Tab');
    const isFocused = await locator.evaluate((element) => document.activeElement === element);

    if (isFocused) return;
  }

  throw new Error(`${label} was not reachable by keyboard tab order.`);
}

async function expectShellKeyboardAccess(page: Page, browserName: string) {
  const skipLink = page.getByRole('link', { name: 'Skip to main content' });

  if (browserName === 'webkit') {
    await skipLink.evaluate((element) => (element as HTMLElement).focus());
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
    await expect(page.getByRole('link', { name: 'Dashboard home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Readiness' })).toBeVisible();
    return;
  }

  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main-content$/);

  await expectReachableByTab(page, page.getByRole('link', { name: 'Dashboard home' }), 'Home');
  await expectReachableByTab(page, page.getByRole('link', { name: 'Readiness' }), 'Readiness');
}

type RgbColour = {
  b: number;
  g: number;
  r: number;
};

function parseColour(value: string): RgbColour {
  const colour = value.trim();
  const hexMatch = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(colour);

  if (hexMatch) {
    const hex =
      hexMatch[1].length === 3
        ? hexMatch[1]
            .split('')
            .map((channel) => channel + channel)
            .join('')
        : hexMatch[1];

    return {
      b: Number.parseInt(hex.slice(4, 6), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      r: Number.parseInt(hex.slice(0, 2), 16),
    };
  }

  const rgbMatch = /^rgba?\((\d+),\s*(\d+),\s*(\d+)/i.exec(colour);

  if (rgbMatch) {
    return {
      b: Number.parseInt(rgbMatch[3], 10),
      g: Number.parseInt(rgbMatch[2], 10),
      r: Number.parseInt(rgbMatch[1], 10),
    };
  }

  throw new Error(`Unsupported colour format: ${value}`);
}

function channelLuminance(channel: number) {
  const scaled = channel / 255;
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(colour: RgbColour) {
  return (
    0.2126 * channelLuminance(colour.r) +
    0.7152 * channelLuminance(colour.g) +
    0.0722 * channelLuminance(colour.b)
  );
}

function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(
    relativeLuminance(parseColour(foreground)),
    relativeLuminance(parseColour(background)),
  );
  const darker = Math.min(
    relativeLuminance(parseColour(foreground)),
    relativeLuminance(parseColour(background)),
  );

  return (lighter + 0.05) / (darker + 0.05);
}

async function computedContrast(locator: Locator) {
  return locator.evaluate((element) => {
    const parseRgba = (colour: string) => {
      if (colour === 'transparent') return { alpha: 0, b: 0, g: 0, r: 0 };
      const match = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?\)$/i.exec(colour);
      if (!match) return null;

      return {
        alpha: match[4] === undefined ? 1 : Number.parseFloat(match[4]),
        b: Number.parseInt(match[3], 10),
        g: Number.parseInt(match[2], 10),
        r: Number.parseInt(match[1], 10),
      };
    };
    const blend = (
      foreground: { alpha: number; b: number; g: number; r: number },
      background: { alpha: number; b: number; g: number; r: number },
    ) => {
      const alpha = foreground.alpha + background.alpha * (1 - foreground.alpha);
      if (alpha === 0) return { alpha: 0, b: 0, g: 0, r: 0 };
      const channel = (foregroundChannel: number, backgroundChannel: number) =>
        Math.round(
          (foregroundChannel * foreground.alpha +
            backgroundChannel * background.alpha * (1 - foreground.alpha)) /
            alpha,
        );

      return {
        alpha,
        b: channel(foreground.b, background.b),
        g: channel(foreground.g, background.g),
        r: channel(foreground.r, background.r),
      };
    };
    const toCss = (colour: { b: number; g: number; r: number }) =>
      `rgb(${colour.r}, ${colour.g}, ${colour.b})`;
    const backgroundFor = (source: Element) => {
      let current: Element | null = source;
      let resolved = { alpha: 0, b: 0, g: 0, r: 0 };

      while (current) {
        const background = parseRgba(getComputedStyle(current).backgroundColor);
        if (background) {
          resolved = blend(resolved, background);
          if (resolved.alpha >= 1) return toCss(resolved);
        }
        current = current.parentElement;
      }

      const bodyBackground = parseRgba(getComputedStyle(document.body).backgroundColor) ?? {
        alpha: 1,
        b: 255,
        g: 255,
        r: 255,
      };
      return toCss(blend(resolved, bodyBackground));
    };
    const styles = getComputedStyle(element);

    return {
      background: backgroundFor(element),
      foreground: styles.color,
    };
  });
}

test.describe('accessibility and UX quality gates', () => {
  for (const route of routes) {
    test(`has accessible structure for ${route}`, async ({ page }) => {
      await page.goto(route);

      await expect(page).toHaveTitle(/Transformation|Payment|Warehouse|Platform|Insights|Automation|Operations|Readiness/);
      await expect(page.locator('main')).toHaveCount(1);

      const issues = await pageAccessibilityIssues(page);
      expect(issues).toEqual([]);
    });
  }

  test('supports keyboard access through shell navigation', async ({ page, browserName }) => {
    await page.goto('/');
    await expectShellKeyboardAccess(page, browserName);
    await expect(page.locator('main')).toBeVisible();
  });

  test('keeps dark shell hover and focus contrast accessible', async ({ page }) => {
    await page.goto('/');

    const brand = page.getByRole('link', { name: 'Dashboard home' });
    const brandTitle = brand.locator('strong');
    const brandSubtitle = brand.locator('small');
    const activeNav = page.getByRole('link', { exact: true, name: 'Dashboard' });
    const inactiveNav = page.getByRole('link', { name: 'Payments' });

    await brand.hover();
    let colours = await computedContrast(brandTitle);
    expect(contrastRatio(colours.foreground, colours.background)).toBeGreaterThanOrEqual(4.5);
    colours = await computedContrast(brandSubtitle);
    expect(contrastRatio(colours.foreground, colours.background)).toBeGreaterThanOrEqual(4.5);

    await inactiveNav.hover();
    colours = await computedContrast(inactiveNav);
    expect(contrastRatio(colours.foreground, colours.background)).toBeGreaterThanOrEqual(4.5);

    colours = await computedContrast(activeNav);
    expect(contrastRatio(colours.foreground, colours.background)).toBeGreaterThanOrEqual(4.5);
  });

  test('uses accessible contrast for primary content surfaces', async ({ page }) => {
    await page.goto('/');

    const labels = [
      page.getByRole('heading', { name: 'Transformation Delivery Console' }),
      page.getByText('Runtime config'),
      page.getByText('Blocked').first(),
      page.getByText('At Risk').first(),
      page.getByText('Monitoring').first(),
      page.getByText('On Track').first(),
    ];

    for (const label of labels) {
      const colours = await computedContrast(label);
      expect(contrastRatio(colours.foreground, colours.background)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
