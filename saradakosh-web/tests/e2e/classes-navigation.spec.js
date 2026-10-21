import { test, expect } from '@playwright/test';

test('classroom navigation fetches a subject only after the reader selects it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const prefetches = [];
  page.on('request', request => {
    if (request.headers()['next-router-prefetch'] === '1') prefetches.push(request.url());
  });
  await page.goto('/classes');
  const subject = page.locator('a[href="/classes/Meditation"]');
  await expect(subject).toBeVisible();
  await subject.hover();
  // Leave enough idle time for the former background prefetch storm to surface.
  await page.waitForTimeout(1500);
  expect(prefetches).toEqual([]);
  await subject.click();
  await expect(page).toHaveURL(/\/classes\/Meditation$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Meditation', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'All subjects', exact: true }).click();
  await expect(page).toHaveURL(/\/classes$/);
  await expect(page.getByRole('searchbox', { name: 'Search classes', exact: true })).toBeVisible();
  expect(prefetches).toEqual([]);
});
