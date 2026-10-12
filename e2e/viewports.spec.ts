import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    test(`viewport: ${vp.name} theme: ${theme} — full-page screenshot`, async ({ page }, info) => {
      await page.setViewportSize({ width: vp.w, height: vp.h });
      await page.goto('/');
      await page.evaluate((t) => {
        (document.documentElement.classList as any)[t === 'dark' ? 'add' : 'remove']('dark');
        document.documentElement.setAttribute('data-theme', t);
      }, theme);
      await page.waitForSelector('[data-tile="name"]', { state: 'visible' });
      await page.waitForTimeout(1500);

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      const overflow = scrollWidth > clientWidth;
      if (overflow) {
        console.warn(`[${vp.name}/${theme}] horizontal overflow: scrollWidth=${scrollWidth} > clientWidth=${clientWidth}`);
      }

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
