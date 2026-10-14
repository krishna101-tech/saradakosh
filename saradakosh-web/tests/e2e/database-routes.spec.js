import { test, expect } from '@playwright/test';

test('timeline retains corrected data and links to populated database records', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const timeline = await page.goto('/reports/vivekananda');
  expect(timeline.status()).toBe(200);
  await expect(page.getByRole('tree')).toBeVisible();
  await expect(page.getByRole('link', { name: /Athens\s+\(Nov 1900\)/ })).toBeVisible();
  const viewer = await page.goto('/reports/viewer/8');
  expect(viewer.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'At the touch of the Master (1881 - 1884)' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Total Records Found: 30' })).toBeVisible();
  await expect(page.locator('main')).toContainText('About two miles from Vrindavan');
  expect(errors).toEqual([]);
});
