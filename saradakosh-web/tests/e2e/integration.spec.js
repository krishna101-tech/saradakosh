import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const quotes = JSON.parse(fs.readFileSync(path.join(__dirname, '../../src/data/quotes.json'), 'utf8'));

test('saved theme and carousel language survive hydration and theme changes persist', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem('saradakosh-theme', 'dark');
    localStorage.setItem('sk_quote_lang', 'ben');
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const carousel = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Vivekananda for You', exact: true }) });
  const cards = carousel.locator('a[href*="/quotes/post/"]');
  await expect(cards).toHaveCount(Math.min(10, quotes.filter(quote => quote.images?.ben).length));
  expect(await cards.evaluateAll(links => links.every(link => link.search === '?lang=ben'))).toBe(true);
  await page.getByRole('button', { name: 'Switch to Dawn Theme (Light Mode)', exact: true }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', 'dark');
  expect(await page.evaluate(() => localStorage.getItem('saradakosh-theme'))).toBe('light');
  expect(errors).toEqual([]);
});

test('feedback reference follows URL history without discarding the message', async ({ page }) => {
  await page.goto('/about?ref=%2Freports%2Fviewer%2F8');
  await expect(page.getByRole('heading', { name: 'Suggest a Correction / Report Error' })).toBeVisible();
  const message = page.locator('textarea');
  await message.fill('An unsent draft');
  await page.evaluate(() => window.history.pushState(null, '', '/about'));
  await expect(page.getByRole('heading', { name: 'Give Feedback', exact: true })).toBeVisible();
  await expect(message).toHaveValue('An unsent draft');
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Suggest a Correction / Report Error' })).toBeVisible();
  await expect(message).toHaveValue('An unsent draft');
});

test('quote sharing reads the current address at the time of the action', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: async data => { window.__sharePayload = data; } });
  });
  await page.goto(`/quotes/post/${quotes[0].id}?lang=eng`);
  await page.evaluate(() => window.history.replaceState(null, '', '?lang=eng&source=integration'));
  await page.getByRole('button', { name: 'Share', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__sharePayload?.url)).toBe(page.url());
});

test('weekend class schedule advances to Monday with the correct topic rotation', async ({ page }) => {
  // This Saturday is 122 weeks after the configured initial Monday.
  await page.clock.setFixedTime(new Date('2026-10-17T12:00:00Z'));
  await page.goto('/schedule');
  const weeks = page.locator('main p[title]');
  await expect(weeks).toHaveCount(6);
  await expect(weeks.first()).toHaveText('19 - 23 Oct - Sri Ramakrishna Lila Prasanga');
  await expect(weeks.last()).toHaveText("23 - 27 Nov - Ma Sarada's life");
});

test('existing timeline trees retain keyboard expansion and explicit selection state', async ({ page }) => {
  for (const route of ['/reports/vivekananda', '/reports/mega-period']) {
    await page.goto(route);
    const tree = page.getByRole('tree');
    const branch = tree.locator('[role="treeitem"][aria-expanded]').first();
    await expect(branch).toHaveAttribute('aria-selected', 'false');
    await expect(branch).toHaveAttribute('aria-expanded', 'true');
    await branch.focus();
    await page.keyboard.press('Enter');
    await expect(branch).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Space');
    await expect(branch).toHaveAttribute('aria-expanded', 'true');
    expect(await tree.getByRole('treeitem').evaluateAll(items => items.every(item => item.getAttribute('aria-selected') === 'false'))).toBe(true);
  }
});
