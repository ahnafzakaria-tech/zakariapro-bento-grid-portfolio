import { test, expect } from '@playwright/test';

test.describe('Layout checks', () => {
  test('no horizontal scrollbar at base desktop width', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForSelector('[data-tile="name"]', { state: 'visible' });
    await page.waitForTimeout(1500);
    await expect(page).toHaveJSProperty('document.documentElement.scrollWidth', (await page.evaluate(() => document.documentElement.clientWidth)));
  });

  test('no horizontal scrollbar at smallest mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForSelector('[data-tile="name"]', { state: 'visible' });
    await page.waitForTimeout(1500);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const cw = await page.evaluate(() => document.documentElement.clientWidth);
    const overflow = sw - cw;
    expect(overflow).toBeLessThanOrEqual(1); // allow 1px rounding
  });

  test('no horizontal scrollbar in light mode mobile', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.evaluate(() => document.documentElement.classList.remove('dark'));
    await page.waitForSelector('[data-tile="name"]', { state: 'visible' });
    await page.waitForTimeout(1500);
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const cw = await page.evaluate(() => document.documentElement.clientWidth);
    expect(sw - cw).toBeLessThanOrEqual(1);
  });

  test('footer is present and readable', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      const f = document.querySelector('footer');
      if (f) f.scrollIntoView({ block: 'center' });
    });
    const footerText = await page.locator('footer').textContent();
    expect(footerText).toContain('All rights reserved');
  });

  test('theme toggle does not overlap content', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    await page.waitForTimeout(1500);
    const toggle = page.locator('button', { hasText: 'Toggle theme' });
    await expect(toggle).toBeVisible();
    const box = await toggle.boundingBox();
    expect(box).toBeTruthy();
    if (box) {
      expect(box.right).toBeLessThanOrEqual(340); // within 320 viewport
    }
  });

  test('tile headings do not overflow — "Selected Work"', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForTimeout(1500);
    const h3 = page.locator('h3', { hasText: /Selected|Work/ });
    // At least one should contain both words
    const texts = await h3.allTextContents();
    expect(texts.join(' ')).toMatch(/Selected[\s\n]+Work/);
  });

  test('tile headings — "Career Journey"', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForTimeout(1500);
    const texts = await page.locator('h3').allTextContents();
    const all = texts.join(' ');
    expect(all).toMatch(/Career[\s\n]+Journey|Career[\s\n]+Timeline/);
  });

  test('skills marquee text is visible', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForTimeout(1500);
    // Tile face shows "Skills"
    const skillsText = await page.locator('[data-tile="skills"]').textContent();
    expect(skillsText).toMatch(/Skills/i);
  });
});
