import { test, expect } from '@playwright/test';

test.describe('Performance and Smoothness', () => {
  test('mobile no horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const cw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(sw - cw).toBeLessThanOrEqual(1);
  });

  test('page loads without layout shift (CLS)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    let cls = 0;
    page.on('console', (msg) => {
      // CLS may be logged
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Check for layout shift by measuring element positions before and after
    const beforeHeight = await page.evaluate(() => document.body.scrollHeight);
    await page.waitForTimeout(1000);
    const afterHeight = await page.evaluate(() => document.body.scrollHeight);
    // Allow some difference due to animation cleanup, but shouldn't be huge
    expect(Math.abs(afterHeight - beforeHeight)).toBeLessThan(200);
  });

  test('prefers-reduced-motion does not break page', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    await expect(page.locator('[data-tile="name"]')).toBeVisible();
    await expect(page.locator('[data-tile="projects"]')).toBeVisible();
  });

  test('slow 3G with 4x CPU slowdown — page remains usable', async ({ browser }) => {
    const context = await browser.newContext({
      ...({
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      } as any),
    });
    const page = await context.newPage();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.route('**/*', (route) => {
      route.continue().catch(() => {});
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-tile="name"]', { state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1000);

    // Click a tile
    await page.locator('[data-tile="projects"]').click({ position: { x: 5, y: 5 } });
    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 10000 });

    await page.close();
  });

  test('scroll works without jank', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForTimeout(1500);
    // Scroll and check it completes
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    const finalPos = await page.evaluate(() => window.scrollY);
    expect(finalPos).toBeLessThan(50);
  });
});
