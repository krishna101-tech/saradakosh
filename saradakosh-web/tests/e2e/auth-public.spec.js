// Real anonymous Clerk UI only; these tests never create or mock an identity.
import { test, expect } from '@playwright/test';

test('anonymous visitors retain public navigation and canonical account controls', async ({ page }) => {
  await page.goto('/');
  const account = page.getByRole('navigation', { name: 'Account', exact: true });
  await expect(account.getByRole('link', { name: 'Sign in', exact: true })).toBeVisible();
  await expect(account.getByRole('link', { name: 'Register', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Reports & Directories', exact: true })).toBeVisible();
  expect(await page.locator('a').evaluateAll(links => links.some(link => link.hostname === 'blog.saradakosh.org'))).toBe(false);
});

test('a Classes deep link reaches real Clerk UI and preserves registration return state', async ({ page, baseURL }) => {
  const target = `${baseURL}/classes/transcripts/abcdefghijk`;
  await page.goto('/classes/transcripts/abcdefghijk');
  await expect(page).toHaveURL(/\/sign-in\?/);
  expect(new URL(page.url()).searchParams.get('redirect_url')).toBe(target);
  await expect(page.getByRole('button', { name: 'Continue with Google', exact: true })).toBeVisible();
  const registration = page.getByRole('link', { name: 'Create an account', exact: true });
  expect(new URL(await registration.getAttribute('href'), baseURL).searchParams.get('redirect_url')).toBe(target);
  await registration.click();
  await expect(page).toHaveURL(/\/sign-up\?/);
  await expect(page.getByRole('heading', { name: 'Create your account', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with Google', exact: true })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('redirect_url')).toBe(target);
});

test('untrusted return URLs cannot enter registration links and auth pages fit the viewport', async ({ page, baseURL }) => {
  await page.goto('/sign-in?redirect_url=https%3A%2F%2Fattacker.invalid%2F');
  const registration = page.getByRole('link', { name: 'Create an account', exact: true });
  await expect(registration).toBeVisible();
  expect(new URL(await registration.getAttribute('href'), baseURL).searchParams.get('redirect_url')).toBe(`${baseURL}/classes`);
  await expect(page.getByRole('button', { name: 'Continue with Google', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
});
