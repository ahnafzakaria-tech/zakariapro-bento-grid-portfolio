import { test, expect } from '@playwright/test';

test.describe('Console and Network', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForSelector('[data-tile="name"]', { state: 'visible' });
    await page.waitForTimeout(1500);
  });

  test('no console errors on initial load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    // Reload to capture errors
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const filtered = errors.filter(
      (e) => !e.includes('ResizeObserver') && !e.includes('[bento-intro]'),
    );
    expect(filtered, `Console errors:\n${filtered.join('\n')}`).toEqual([]);
  });

  test('no 404 network requests', async ({ page }) => {
    const failed: string[] = [];
    page.on('response', (response) => {
      if (response.status() === 404) {
        failed.push(`${response.url()} -> ${response.status()}`);
      }
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    expect(failed, `404 errors:\n${failed.join('\n')}`).toEqual([]);
  });

  test('favicon loads successfully', async ({ page }) => {
    const response = await page.waitForResponse((resp) =>
      resp.url().includes('Favicon') || resp.url().includes('favicon'),
    );
    expect(response.ok()).toBe(true);
  });

  test('web manifest loads successfully', async ({ page }) => {
    const response = await page.waitForResponse((resp) =>
      resp.url().includes('site.webmanifest'),
    );
    expect(response.ok()).toBe(true);
  });

  test('profile image loads', async ({ page }) => {
    await page.locator('[data-tile="name"]').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
    // Check that the profile image loaded
    const img = page.locator('img[alt="Md Zakaria Hossain"]');
    await expect(img).toBeVisible();
    const response = await page.waitForResponse((resp) =>
      resp.url().includes('profile.png'),
    );
    expect(response.ok()).toBe(true);
  });

  test('tangram image loads', async ({ page }) => {
    await page.locator('[data-tile="name"]').click({ position: { x: 5, y: 5 } });
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
    const response = await page.waitForResponse((resp) =>
      resp.url().includes('tangram-4x3.svg'),
    );
    expect(response.ok()).toBe(true);
  });
});
