import { test, expect } from '@playwright/test';

test('published archive content remains readable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  try {
    for (const route of ['/', '/classes', '/classes/Meditation', '/classes/transcripts/2UutWVzZlW4', '/reports/refs']) {
      const response = await page.goto(route);
      expect(response.status(), route).toBe(200);
      const heading = page.getByRole('heading', { level: 1 }).first();
      await expect(heading, route).toBeVisible();
      // Playwright visibility alone does not reject opacity:0 ancestors.
      expect(await heading.evaluate(element => {
        for (let node = element; node; node = node.parentElement) {
          if (Number(getComputedStyle(node).opacity) === 0) return false;
        }
        return true;
      }), route).toBe(true);
    }
  } finally {
    await context.close();
  }
});

test('homepage footer remains within narrow viewports and theme controls support keyboard focus', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px overflow`).toBe(true);
    const footerLinks = page.locator('footer a');
    for (const link of await footerLinks.all()) {
      const box = await link.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
  }
  const theme = page.getByRole('button', { name: 'Switch to Midnight Theme (Dark Mode)', exact: true });
  await theme.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const box = await theme.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
});

test('theme controls and quiz language controls remain independently clickable on mobile', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/about', '/reports/vivekananda', '/reports/mega-period', '/reports/refs', '/classes']) {
      await page.goto(route);
      const theme = page.getByRole('button', { name: 'Switch to Midnight Theme (Dark Mode)', exact: true });
      await theme.click();
      const back = page.locator('a[href="/"]').first();
      await back.click();
      await expect(page).toHaveURL(/\/$/);
    }
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Select English', exact: true }).click();
    for (const language of ['Bengali', 'Hindi', 'English']) {
      const button = page.getByRole('button', { name: `Switch to ${language}`, exact: true });
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
    }
    await page.getByRole('button', { name: 'Switch to Midnight Theme (Dark Mode)', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px quiz overflow`).toBe(true);
  }
});
