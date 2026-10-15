import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { parseLibrarySnapshot } from '../../src/lib/library/import.mjs';

const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/library/books-source.json'), 'utf8'));
const { books } = parseLibrarySnapshot(source);
const fallback = books.find(book => !book.english_title && book.original_language === 'Bengali' && book.links.some(link => link.language === 'Bengali'));
const items = page => page.locator('ul[aria-label="Books"] > li');
const identities = page => items(page).evaluateAll(elements => elements.map(element => element.dataset.bookId));

test('six view/language combinations preserve identities, page and separate list anatomy', async ({ page }) => {
  await page.goto('/reports/refs?page=2');
  await expect(items(page)).toHaveCount(24);
  const ids = await identities(page);
  for (const view of ['Cards', 'List']) {
    await page.getByRole('group', { name: 'Library view', exact: true }).getByRole('button', { name: view, exact: true }).click();
    for (const language of ['Original', 'English', 'বাংলা']) {
      await page.getByRole('group', { name: 'Book language' }).getByRole('button', { name: language, exact: true }).click();
      await expect(page.getByText('Page 2 of 7', { exact: true })).toBeVisible();
      expect(await identities(page)).toEqual(ids);
      await expect(items(page).locator('.book-cover')).toHaveCount(view === 'Cards' ? 24 : 0);
      await expect(items(page).locator('.dialog-summary')).toHaveCount(0);
      await expect(page.getByRole('status')).toHaveText('25–48 of 168 books');
    }
  }
});

test('fallback representation aligns title, cover and all links; modal traps and returns keyboard focus', async ({ page }) => {
  await page.goto(`/reports/refs?lang=english&q=${encodeURIComponent(fallback.canonical_title)}`);
  const item = page.locator(`[data-book-id="${fallback.id}"]`);
  await expect(item).toContainText(fallback.original_title);
  await expect(item).toContainText('English not available');
  await expect(item.locator('.book-cover')).toHaveAttribute('data-cover-language', 'Bengali');
  const expectedLinks = fallback.links.filter(link => link.language === 'Bengali');
  expect(await item.locator('a').evaluateAll(links => links.map(link => link.href))).toEqual(expectedLinks.map(link => link.url));
  const trigger = item.getByRole('button');
  await expect(trigger).toHaveAccessibleDescription(`${fallback.author} Bengali · English not available`);
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(fallback.original_title);
  await expect(dialog).toContainText('A summary is not yet available for this book.');
  await expect(dialog.getByRole('button', { name: 'Close book details' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('link').last()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Close book details' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'List', exact: true }).click();
  await expect(item.getByRole('button')).toHaveAccessibleDescription(`${fallback.author} Bengali · English not available`);
});

test('uncertain original language remains visible in every representation; no-link dialog also traps focus', async ({ page }) => {
  const uncertain = books.find(book => book.original_language === 'not clear' && book.links.length === 0);
  await page.goto(`/reports/refs?q=${encodeURIComponent(uncertain.canonical_title)}`);
  const item = page.locator(`[data-book-id="${uncertain.id}"]`);
  for (const view of ['Cards', 'List']) {
    await page.getByRole('button', { name: view, exact: true }).click();
    await expect(item).toContainText('Original language not clear; displayed in English.');
    await item.getByRole('button').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Original language not clear; displayed in English.');
    const close = dialog.getByRole('button', { name: 'Close book details' });
    await expect(close).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(close).toBeFocused();
    await close.click();
    await expect(dialog).not.toBeVisible();
    await expect(item.getByRole('button')).toBeFocused();
  }
  const translated = books.find(book => book.original_language === 'not clear' && book.bengali_title);
  await page.goto(`/reports/refs?lang=bengali&q=${encodeURIComponent(translated.canonical_title)}`);
  const translatedItem = page.locator(`[data-book-id="${translated.id}"]`);
  await expect(translatedItem).toContainText(translated.bengali_title);
  await expect(translatedItem).toContainText('Original language not clear; displayed in Bengali.');
  await expect(translatedItem.locator('.book-cover')).toHaveAttribute('data-cover-language', 'Bengali');
  expect(await translatedItem.getByRole('link').evaluateAll(links => links.map(link => link.href)))
    .toEqual(translated.links.filter(link => link.language === 'Bengali').map(link => link.url));
  await translatedItem.getByRole('button').click();
  await expect(page.getByRole('dialog')).toContainText('Original language not clear; displayed in Bengali.');
});

test('multi-link dialog cycles every link and wraps focus in both directions', async ({ page }) => {
  await page.goto('/reports/refs?lang=english');
  const trigger = page.locator('[data-book-id="1"]').getByRole('button');
  await trigger.click();
  const dialog = page.getByRole('dialog');
  const close = dialog.getByRole('button', { name: 'Close book details' });
  const links = dialog.getByRole('link');
  const center = await dialog.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return [Math.abs(rect.left + rect.width / 2 - innerWidth / 2), Math.abs(rect.top + rect.height / 2 - innerHeight / 2)];
  });
  expect(center.every(offset => offset <= 1)).toBe(true);
  await expect(links).toHaveCount(8);
  await expect(close).toBeFocused();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    await expect(links.nth(i)).toBeFocused();
  }
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(links.last()).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('full-text navigation opens its own tab without opening book details', async ({ page, context }) => {
  await context.route(url => url.hostname !== '127.0.0.1' && url.hostname !== 'localhost', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<title>External source navigation</title>' }));
  await page.goto('/reports/refs?lang=english');
  const link = page.locator('[data-book-id="1"]').getByRole('link', { name: 'English 1', exact: true });
  const [popup] = await Promise.all([page.waitForEvent('popup'), link.click()]);
  await popup.waitForLoadState();
  expect(popup.url()).toBe(books[0].links[0].url);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('status')).toHaveText('1–24 of 168 books');
  await popup.close();
});

test('search, category, pagination and browser history preserve browsing context', async ({ page }) => {
  await page.goto('/reports/refs');
  await page.getByRole('group', { name: 'Book category' }).getByRole('button', { name: 'Swami Vivekananda', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText('1–24 of 33 books');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(items(page)).toHaveCount(9);
  await expect(items(page).first()).toBeInViewport();
  const ids = await identities(page);
  await page.getByRole('button', { name: 'List', exact: true }).click();
  expect(await identities(page)).toEqual(ids);
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Cards', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(await identities(page)).toEqual(ids);
  await page.goForward();
  await expect(page.getByRole('button', { name: 'List', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('group', { name: 'Book category' }).getByRole('button', { name: 'All books', exact: true }).click();
  await expect(page.getByText('Page 1 of 7', { exact: true })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search the collection' }).fill('Mahendranath Gupta');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.locator('[data-book-id="1"]')).toBeVisible();
  await expect(page).toHaveURL(/q=Mahendranath/);
  await page.getByRole('searchbox', { name: 'Search the collection' }).fill('no-such-catalogue-title-123');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No books found' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear search and filters' }).click();
  await expect(items(page)).toHaveCount(24);
});

test('responsive Cards and List remain usable at mobile, tablet and laptop widths', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const view of ['cards', 'list']) {
      await page.goto(`/reports/refs?view=${view}`);
      await expect(items(page)).toHaveCount(24);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      if (view === 'cards') {
        const columns = await page.locator('.library-grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
        expect(columns).toBe(width === 390 ? 2 : width === 1440 ? 4 : 3);
      }
      const small = await page.locator('main').evaluate(element => Array.from(element.querySelectorAll('*')).filter(node => node.childNodes.length && Array.from(node.childNodes).some(child => child.nodeType === 3 && child.textContent.trim())).filter(node => parseFloat(getComputedStyle(node).fontSize) < 13).length);
      expect(small).toBe(0);
    }
  }
  expect(errors).toEqual([]);
});
