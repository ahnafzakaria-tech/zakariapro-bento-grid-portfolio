import { test, expect, type Page } from '@playwright/test';
import { AxeBuilder, type AxeResults } from '@axe-core/playwright';

async function runAxe(page: Page): Promise<AxeResults> {
  const builder = new AxeBuilder({ page });
  return await builder.analyze();
}

function describeViolations(violations: any[]): string {
  if (violations.length === 0) return '';
  return violations
    .map((v) => {
      const nodeInfo = v.nodes.map((n: any) => `  - ${n.html || n.target.join(', ')}`).join('\n');
      return `${v.impact || '?'}: ${v.id} — ${v.description}\n${nodeInfo}`;
    })
    .join('\n');
}

test.describe('Accessibility', () => {
  test('no critical accessibility violations — light mode', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForSelector('[data-tile="name"]', { state: 'visible' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.waitForTimeout(500);

    const results = await runAxe(page) as any;
    const critical = (results.violations || []).filter((v: any) =>
      ['critical', 'serious'].includes(v.impact || ''),
    );
    if (critical.length > 0) {
      console.warn('Critical/serious a11y violations (light mode):\n' + describeViolations(critical));
    }
    expect(critical, describeViolations(critical)).toEqual([]);
  });

  test('no critical accessibility violations — dark mode', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.waitForTimeout(1000);

    const results = await runAxe(page) as any;
    const critical = (results.violations || []).filter((v: any) =>
      ['critical', 'serious'].includes(v.impact || ''),
    );
    if (critical.length > 0) {
      console.warn('Critical/serious a11y violations (dark mode):\n' + describeViolations(critical));
    }
    expect(critical, describeViolations(critical)).toEqual([]);
  });

  test('page has title and meta description', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForTimeout(1000);
    const title = await page.title();
    expect(title.length).toBeGreaterThan(10);
    const description = await page.getAttribute('meta[name="description"]', 'content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeGreaterThan(20);
  });

  test('favicon and manifest present', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await expect(page.locator('link[rel="icon"]')).toHaveCount(1);
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  });
});
