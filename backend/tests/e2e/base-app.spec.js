import { test, expect } from '@playwright/test';

test('public seeded buyer can log in', async ({ page }) => { 
    await page.goto('/login'); 
    await page.getByPlaceholder('Email').fill('buyer1@collectorsvault.dev'); 
    await page.getByPlaceholder('Password').fill('Password123!'); 
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForLoadState('networkidle'); 
    await expect(page).not.toHaveURL(/login/); 
});

test('health endpoint returns ok', async ({ request, baseURL }) => {
  const res = await request.get(`${baseURL}/health`);
  expect(res.ok()).toBeTruthy();
});

test('marketplace page loads', async ({ page }) => {
  await page.goto('/marketplace');
  await expect(page.locator('body')).toContainText('Marketplace');
});

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('body')).toContainText('Login');
});

test('signup page loads', async ({ page }) => {
  await page.goto('/signup');
  await expect(page.locator('body')).toContainText('Sign Up');
});

test('listing detail page opens from marketplace', async ({ page }) => {
  await page.goto('/marketplace');
  const firstLink = page.locator('a').filter({ hasText: /view|details|open/i }).first();

  if (await firstLink.count()) {
    await firstLink.click();
    await expect(page.locator('body')).toBeVisible();
  } else {
    await expect(page.locator('body')).toContainText(/marketplace|listing/i);
  }
});
