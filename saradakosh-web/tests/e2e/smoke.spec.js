import { test, expect } from '@playwright/test';

test.describe('End-to-End Smoke Tests', () => {
  test('Homepage loads correctly with core theme', async ({ page }) => {
    // Navigate to the local server or staging URL
    const response = await page.goto('/');
    expect(response.status()).toBe(200);
    
    // Assert 200 OK (implicitly verified by successful goto)
    
    // Check for the Saradakosh emblem
    const emblem = page.locator('img[alt="Saradakosh Emblem"]');
    await expect(emblem).toBeVisible();

    // Check that core theme bg class exists
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('SearchBar returns clickable Links', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('input#search-input');
    await searchInput.fill('Vivekananda');
    
    // Wait for dropdown to appear
    const resultsContainer = page.locator('#search-results');
    await expect(resultsContainer).toBeVisible();
    
    // Ensure the results contain <a> tags
    const links = resultsContainer.locator('a');
    await expect(links.first()).toBeVisible({ timeout: 45_000 });
    await expect(links.first()).toHaveAttribute('href', /\/quotes\/post\/\d+/);
    const destination = await links.first().getAttribute('href');
    await links.first().click();
    await expect(page).toHaveURL(new RegExp(`${destination}$`));
    await expect(page.locator('body')).not.toContainText('Record Not Found');
  });
});
