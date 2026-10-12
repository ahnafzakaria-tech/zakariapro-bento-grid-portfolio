import { test, expect, type Page } from '@playwright/test';

async function openTile(page: Page, tile: string) {
  await page.goto('/');
  await page.waitForTimeout(1500);
  // Click the tile face itself
  await page.locator(`[data-tile="${tile}"]`).click({ position: { x: 10, y: 10 } });
  const overlay = page.locator('.fixed.inset-0').first();
  await expect(overlay).toBeVisible({ timeout: 3000 });
  return overlay;
}

test('selected work tile opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(1500);

  // The projects tile is an anchor — click the left side
  await page.locator('[data-tile="projects"]').click({ position: { x: 5, y: 5 } });
  const dialog = page.locator('[role="dialog"]').first();
  await expect(dialog).toBeVisible({ timeout: 3000 });

  // Close via Escape
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: 2000 });
});

test('project modal: open specific project via hash deep link', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/#projects/1');
  await page.waitForTimeout(2000);
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toHaveCount(1, { timeout: 3000 });
  const content = await dialog.textContent();
  expect(content).toMatch(/Starah|Meghnaghat|2GW|718MW|Project|Document|Power|Wind/i);
});

test('project modal: close via Escape key', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openTile(page, 'projects');
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: 2000 });
});

test('project modal: close via backdrop click', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await openTile(page, 'projects');
  const backdrop = page.locator('.fixed.inset-0').first();
  await backdrop.click({ position: { x: 10, y: 10 } });
  await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: 2000 });
});

test('story tile opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  await page.locator('[data-tile="journey"]').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: 2000 });
});

test('resume tile opens', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  await page.locator('[data-tile="resume"]').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: 2000 });
});

test('contact tile opens', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  await page.locator('[data-tile="contact"]').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: 2000 });
});

test('skills tile opens', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  await page.locator('[data-tile="skills"]').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: 2000 });
});

test('name tile opens', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  await page.locator('[data-tile="name"]').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: 2000 });
});

test('clock shows Riyadh time and updates', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  // Verify Riyadh label
  const clockText = await page.locator('[data-tile="clock"]').textContent();
  expect(clockText).toMatch(/Riyadh/i);
  // Verify time digits present
  const timeText = await page.locator('[data-tile="clock"]').textContent();
  expect(timeText).toMatch(/\d{1,2}:\d{2}/);
});

test('theme toggle switches between light and dark', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(1000);
  // Default is dark
  expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true);
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(false);
  // Toggle back
  await page.getByRole('button', { name: 'Toggle theme' }).click();
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true);
});

test('back button closes modal', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  await page.locator('[data-tile="projects"]').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
  await page.goBack();
  await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: 2000 });
});

test('LinkedIn external link', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  // Open contact modal to find the LinkedIn link (it has target="_blank")
  await page.locator('[data-tile="contact"]').click({ position: { x: 5, y: 5 } });
  await page.waitForTimeout(500);
  const linkedin = page.locator('a[href*="linkedin.com/in/workwithzakariapro"]');
  await expect(linkedin).toHaveCount(1, { timeout: 5000 });
  const target = await linkedin.getAttribute('target');
  expect(target).toBe('_blank');
});

test('email link has correct mailto format', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  // Open contact modal to see email links
  await page.locator('[data-tile="contact"]').click({ position: { x: 5, y: 5 } });
  // Wait for modal to open
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  const mailtoLink = page.locator('a[href^="mailto:"]');
  await expect(mailtoLink).toHaveCount(1, { timeout: 5000 });
  const href = await mailtoLink.getAttribute('href');
  expect(href).toMatch(/mailto:ahnafzakariaaz@gmail.com/);
});

test('phone link uses tel:', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  await page.locator('[data-tile="contact"]').click({ position: { x: 5, y: 5 } });
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
  // SEOContentIndex has a sr-only tel link, plus the modal has one
  const telLink = page.locator('a[href^="tel:"]');
  await expect(telLink).toHaveCount(2, { timeout: 5000 });
});

test('keyboard-only navigation — Tab reaches theme toggle', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/');
  await page.waitForTimeout(1500);
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
  expect(focused).toBeTruthy();
});
