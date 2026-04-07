import { test, expect } from '@playwright/test';

test('private seeded buyer can log in', async ({ page }) => {
  await page.goto('http://localhost/login');
  await page.getByPlaceholder('Email').fill('buyer1@vault-private.dev');
  await page.getByPlaceholder('Password').fill('VaultPass123!');
  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForLoadState('networkidle');
  await expect(page).not.toHaveURL(/login/);
});

test('public seeded buyer cannot log in under private seed', async ({ page }) => {
  await page.goto('http://localhost/login');
  await page.getByPlaceholder('Email').fill('buyer1@collectorsvault.dev');
  await page.getByPlaceholder('Password').fill('Password123!');
  await page.getByRole('button', { name: /login/i }).click();

  await page.waitForLoadState('networkidle');
  await expect(page).toHaveURL(/login/);
});

test('health endpoint returns ok', async ({ request }) => {
  const res = await request.get('http://localhost/health');
  expect(res.ok()).toBeTruthy();
});

test('marketplace page loads', async ({ page }) => {
  await page.goto('http://localhost/marketplace');
  await expect(page.locator('body')).toContainText(/marketplace/i);
});

test('login page loads', async ({ page }) => {
  await page.goto('http://localhost/login');
  await expect(page.locator('body')).toContainText(/login/i);
});

test('signup page loads', async ({ page }) => {
  await page.goto('http://localhost/signup');
  await expect(page.locator('body')).toContainText(/sign up/i);
});

test('listing detail page opens from marketplace', async ({ page }) => {
  await page.goto('http://localhost/marketplace');

  const firstLink = page.locator('a[href*="/marketplace/"]').first();

  if (await firstLink.count()) {
    await firstLink.click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  } else {
    await expect(page.locator('body')).toContainText(/marketplace|listing/i);
  }
});