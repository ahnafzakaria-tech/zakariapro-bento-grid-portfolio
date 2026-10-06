import { test, expect, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const VIEWPORTS = [
  { name: 'desktop-1920', w: 1920, h: 1080 },
  { name: 'desktop-1440', w: 1440, h: 900 },
  { name: 'desktop-1280', w: 1280, h: 720 },
  { name: 'tablet-landscape', w: 1024, h: 768 },
  { name: 'tablet-portrait', w: 768, h: 1024 },
  { name: 'mobile-430', w: 430, h: 932 },
  { name: 'mobile-390', w: 390, h: 844 },
  { name: 'mobile-360', w: 360, h: 740 },
  { name: 'mobile-320', w: 320, h: 568 },
  { name: 'mobile-landscape', w: 844, h: 390 },
];

const THEMES: Array<'light' | 'dark'> = ['light', 'dark'];

const SCREENSHOT_DIR = path.resolve(__dirname, '..', 'qa-screenshots');

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
}

for (const vp of VIEWPORTS) {
  for (const theme of THEMES) {
    test(`viewport: ${vp.name} theme: ${theme} — full-page screenshot`, async ({ page, browser }, info) => {
      test.skip(info.retry > 0, 'skip screenshot on retry to avoid duplicate writes');
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('/');
      await page.evaluate((t) => {
        (document.documentElement.classList as any)[t === 'dark' ? 'add' : 'remove']('dark');
        document.documentElement.setAttribute('data-theme', t);
      }, theme);
      // Wait for the intro animation to finish
      await page.waitForSelector('[data-tile="name"]', { state: 'visible' });
      await page.waitForTimeout(1500);

      // Check no horizontal overflow
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const overflow = scrollWidth > clientWidth;
      if (overflow) {
        console.warn(`[${vp.name}/${theme}] horizontal overflow detected: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`);
      }

      // Capture screenshot
      if (!fs.existsSync(SCREENSHOT_DIR)) {
        fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
      }
      const file = `${slugify(vp.name)}-${theme}.png`;
      const fullPath = path.join(SCREENSHOT_DIR, file);
      await page.screenshot({ path: fullPath, fullPage: true });
      console.log(`[screenshot saved] ${fullPath}  overflow=${overflow}`);
    });
  }
}
