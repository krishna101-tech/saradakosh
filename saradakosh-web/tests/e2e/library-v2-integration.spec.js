import { test, expect } from '@playwright/test';
import path from 'node:path';

// The original two-project suite remains intact. This expands the integrated
// library matrix once per width instead of repeating identical width overrides.
for (const width of [320, 390, 768, 1440]) {
  test(`V2 integrated ${width}px: Original/English/Bengali × Cards/List`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'Explicit viewport matrix runs once in Chromium');
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    for (const lang of ['original', 'english', 'bengali']) {
      for (const view of ['cards', 'list']) {
        await page.goto(`/reports/refs?lang=${lang}&view=${view}`);
        const items = page.locator('ul[aria-label="Books"] > li');
        await expect(items).toHaveCount(24);
        expect(await items.evaluateAll(nodes => nodes.map(node => Number(node.dataset.bookId))))
          .toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
        await expect(page.getByRole('status')).toHaveText('1–24 of 168 books');
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        await expect(items.locator('.book-cover')).toHaveCount(view === 'cards' ? 24 : 0);
        const gospel = page.locator('[data-book-id="1"]');
        // ID1 original is Bengali. Keep the frozen target visibly unavailable,
        // and never produce an anchor to its confirmed404 URL.
        if (lang !== 'english') {
          await expect(gospel).toContainText('Bengali 3 — unavailable');
          await expect(gospel.getByRole('link')).toHaveCount(4);
        }
        await expect(gospel.locator('a[href*="rkmlibrary.com/bookCnt.php"]')).toHaveCount(0);
        const trigger = gospel.getByRole('button');
        await trigger.focus();
        await page.keyboard.press('Enter');
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('button', { name: 'Close book details' })).toBeFocused();
        expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
        await page.keyboard.press('Shift+Tab');
        await expect(dialog.getByRole('link').last()).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(dialog.getByRole('button', { name: 'Close book details' })).toBeFocused();
        await expect(dialog.locator('a[href*="rkmlibrary.com/bookCnt.php"]')).toHaveCount(0);
        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
        await expect(trigger).toBeFocused();
        const filename = `t4-${width}-${lang}-${view}.png`;
        await page.screenshot({ path: process.env.T4_SCREENSHOT_DIR
          ? path.join(process.env.T4_SCREENSHOT_DIR, filename) : testInfo.outputPath(filename) });
      }
    }
    expect(errors).toEqual([]);
  });
}

test('V2 inherited short essay remains explicitly qualified in Cards, List and dialog', async ({ page }) => {
  for (const view of ['cards', 'list']) {
    await page.goto(`/reports/refs?lang=english&view=${view}`);
    const item = page.locator('[data-book-id="4"]');
    await expect(item).toContainText('Existing source is a short centenary-address essay; complete biography not verified.');
    await item.getByRole('button').click();
    await expect(page.getByRole('dialog')).toContainText('Existing source is a short centenary-address essay; complete biography not verified.');
    await page.keyboard.press('Escape');
  }
});

test('V2 actual institutional reader opens in an isolated external tab', async ({ page }) => {
  await page.goto('/reports/refs?lang=english');
  const link = page.locator('[data-book-id="1"]').getByRole('link', { name: 'English 2', exact: true });
  const [popup] = await Promise.all([page.waitForEvent('popup'), link.click()]);
  await popup.waitForLoadState('domcontentloaded');
  expect(popup.url()).toBe('https://cs.rkmvu.ac.in/~tamal/gospel/gospel.html');
  await expect(popup.locator('body')).toContainText('The Gospel of Sri Ramakrishna');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(await popup.evaluate(() => window.opener === null)).toBe(true);
  await popup.close();
});
