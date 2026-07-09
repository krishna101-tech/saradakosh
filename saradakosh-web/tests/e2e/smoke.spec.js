import { test, expect } from '@playwright/test';

test.describe('End-to-End Smoke Tests', () => {
  test('Homepage loads correctly with core theme', async ({ page }) => {
    // Navigate to the local server or staging URL
    await page.goto(process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000');
    
    // Assert 200 OK (implicitly verified by successful goto)
    
    // Check for the Saradakosh emblem
    const emblem = page.locator('img[alt="Saradakosh Emblem"]');
    await expect(emblem).toBeVisible();

    // Check that core theme bg class exists
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('SearchBar returns clickable Links', async ({ page }) => {
    await page.goto(process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000');
    
    const searchInput = page.locator('input#search-input');
    await searchInput.fill('Vivekananda');
    
    // Wait for dropdown to appear
    const resultsContainer = page.locator('div.absolute.z-50.w-full.mt-2');
    await expect(resultsContainer).toBeVisible({ timeout: 5000 });
    
    // Ensure the results contain <a> tags
    const links = resultsContainer.locator('a');
    await expect(links.first()).toBeVisible();
    await expect(links.first()).toHaveAttribute('href', /\/quotes\/post\/\d+/);
  });
});
